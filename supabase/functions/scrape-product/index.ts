import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SCRAPER_API_KEY = Deno.env.get('SCRAPER_API_KEY') || '';

const JS_HEAVY = [
  'amazon.', 'ebay.', 'argos.co.uk', 'johnlewis.com', 'currys.co.uk',
  'very.co.uk', 'asos.com', 'next.co.uk', 'marksandspencer', 'tesco.com',
  'asda.com', 'sainsburys.co.uk', 'boots.com', 'superdrug.com',
  'walmart.', 'target.com', 'bestbuy.com', 'costco.com',
  'jumia.', 'alibaba.com', 'aliexpress.com', 'lazada.', 'flipkart.com',
  'noon.com', 'jd.com', 'screwfix.com', 'toolstation.com', 'wickes.co.uk',
  'diy.com', 'homebase.co.uk', 'dunelm.com', 'wayfair.co.uk',
];

function needsJs(url: string): boolean {
  return JS_HEAVY.some(s => url.toLowerCase().includes(s));
}

async function fetchDirect(url: string): Promise<string | null> {
  const agents = [
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'Twitterbot/1.0',
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
  ];
  for (const ua of agents) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 7000);
      const res = await fetch(url, {
        headers: { 'User-Agent': ua, 'Accept': 'text/html,*/*', 'Accept-Language': 'en-GB,en;q=0.9' },
        redirect: 'follow',
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (res.ok) {
        const text = await res.text();
        if (
          text.length > 5000 &&
          !text.toLowerCase().includes('enable javascript') &&
          !text.toLowerCase().includes('access denied') &&
          !text.toLowerCase().includes('robot check') &&
          !text.toLowerCase().includes('captcha')
        ) {
          return text;
        }
      }
    } catch (_) {}
  }
  return null;
}

async function fetchScraperApi(url: string, render = true): Promise<string | null> {
  if (!SCRAPER_API_KEY) return null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 25000);
    const apiUrl = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}&render=${render}&country_code=gb`;
    const res = await fetch(apiUrl, { signal: ctrl.signal });
    clearTimeout(t);
    if (res.ok) {
      const text = await res.text();
      if (text.length > 3000) return text;
    }
  } catch (_) {}
  return null;
}

async function fetchPage(url: string): Promise<string | null> {
  if (needsJs(url)) {
    const scraped = await fetchScraperApi(url, true);
    if (scraped) return scraped;
    return fetchDirect(url);
  }
  const direct = await fetchDirect(url);
  if (direct) return direct;
  const scraped = await fetchScraperApi(url, false);
  if (scraped) return scraped;
  return fetchScraperApi(url, true);
}

function getMeta(html: string, prop: string): string {
  const ps = [
    new RegExp(`<meta[^>]+property=["']og:${prop}["'][^>]+content=["']([^"'<>]+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"'<>]+)["'][^>]+property=["']og:${prop}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${prop}["'][^>]+content=["']([^"'<>]+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"'<>]+)["'][^>]+name=["']${prop}["']`, 'i'),
  ];
  for (const p of ps) {
    const m = html.match(p);
    if (m?.[1]) return m[1].trim();
  }
  return '';
}

function getImageKey(url: string): string {
  if (url.includes('amazon') || url.includes('media-amazon')) {
    const m = url.match(/\/images\/[A-Z]\/([A-Za-z0-9+]+)/);
    if (m) return m[1];
  }
  if (url.includes('jumia')) {
    return url.replace(/\/unsafe\/fit-in\/\d+x\d+\/[^/]+\//g, '/').toLowerCase();
  }
  return url
    .replace(/[?&](width|height|w|h|size|resize|fit|quality|q|format)=[^&]*/gi, '')
    .replace(/\/\d+x\d+\//g, '/')
    .replace(/_\d+x\d+\./g, '.')
    .replace(/-(small|medium|large|thumb|thumbnail|preview|xs|sm|md|lg|xl)\./gi, '.')
    .replace(/\?.*$/, '')
    .toLowerCase()
    .trim();
}

function getBestImageUrl(url: string): string {
  if (url.includes('amazon') || url.includes('media-amazon')) {
    const m = url.match(/(https:\/\/[^\s]+?\/images\/[A-Z]\/[A-Za-z0-9+]+)\./i);
    if (m) return `${m[1]}._AC_SL1500_.jpg`;
  }
  if (url.includes('jumia')) return url.replace(/\/fit-in\/\d+x\d+\//, '/fit-in/680x680/');
  return url.replace(/\?.*$/, '');
}

function extractImages(html: string): string[] {
  const seenKeys = new Set<string>();
  const imgs: string[] = [];

  const add = (src: string) => {
    if (!src?.startsWith('http')) return;
    if (
      src.includes('sprite') || src.includes('pixel') || src.includes('blank') ||
      src.includes('placeholder') || src.includes('logo') || src.includes('icon')
    ) return;
    const key = getImageKey(src);
    if (seenKeys.has(key)) return;
    seenKeys.add(key);
    imgs.push(getBestImageUrl(src));
  };

  let m;
  const ogRe = /<meta[^>]+property=["']og:image[^"']*["'][^>]+content=["']([^"'<>]+)["']/gi;
  while ((m = ogRe.exec(html)) !== null) add(m[1]);

  const amzHi = /data-old-hires=["']([^"']+)["']/gi;
  while ((m = amzHi.exec(html)) !== null) add(m[1]);

  const dynRe = /data-a-dynamic-image=["']({[^"']+})["']/gi;
  while ((m = dynRe.exec(html)) !== null) {
    try {
      const obj = JSON.parse(m[1].replace(/&quot;/g, '"'));
      Object.keys(obj).forEach(k => add(k));
    } catch (_) {}
  }

  const jldRe = /"image"\s*:\s*(?:"(https?:[^"]+)"|\[([^\]]+)\])/gi;
  while ((m = jldRe.exec(html)) !== null) {
    if (m[1]) add(m[1]);
    if (m[2]) {
      const us = m[2].match(/"(https?:[^"]+)"/g);
      if (us) us.forEach(u => add(u.replace(/"/g, '')));
    }
  }

  const dataImgRe = /data-(?:src|image|img)=["'](https?:[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi;
  while ((m = dataImgRe.exec(html)) !== null) add(m[1]);

  return imgs.slice(0, 8);
}

function parsePriceString(raw: string, defaultCurrency: string): { price: number; currency: string } | null {
  raw = raw.trim().replace(/\s+/g, '');
  let currency = defaultCurrency;
  // Strip currency symbols/codes
  if (raw.startsWith('\u00a3') || raw.startsWith('GBP')) { currency = 'GBP'; raw = raw.replace(/^(GBP|\u00a3)/, ''); }
  else if (raw.startsWith('$') || raw.startsWith('USD')) { currency = 'USD'; raw = raw.replace(/^(USD|\$)/, ''); }
  else if (raw.startsWith('\u20ac') || raw.startsWith('EUR')) { currency = 'EUR'; raw = raw.replace(/^(EUR|\u20ac)/, ''); }
  else if (raw.startsWith('NGN') || raw.startsWith('\u20a6')) { currency = 'NGN'; raw = raw.replace(/^(NGN|\u20a6)/, ''); }
  // Remove trailing currency codes
  raw = raw.replace(/(GBP|USD|EUR|NGN|KES|GHS|CAD|AUD|JPY|CNY|INR|ZAR)$/i, '').trim();
  // Normalise: remove thousands separators, keep decimal
  // Handle formats like 1,299.99 or 1.299,99
  if (/,\d{2}$/.test(raw)) raw = raw.replace(/\./g, '').replace(',', '.');
  else raw = raw.replace(/,/g, '');
  const num = parseFloat(raw);
  if (!isNaN(num) && num > 0 && num < 10_000_000) return { price: num, currency };
  return null;
}

function extractPrice(html: string): { price: number | null; currency: string } {
  let currency = 'GBP';

  // ── 1. JSON-LD structured data (most reliable) ──────────────────────────
  for (const jld of [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]) {
    try {
      const items = [JSON.parse(jld[1])].flat();
      for (const item of items) {
        const offers = item.offers ? [item.offers].flat() : [];
        for (const offer of offers) {
          const raw = offer.price ?? offer.lowPrice;
          if (raw != null) {
            const p = parseFloat(String(raw));
            if (!isNaN(p) && p > 0) {
              if (offer.priceCurrency) currency = offer.priceCurrency;
              return { price: p, currency };
            }
          }
        }
      }
    } catch (_) {}
  }

  // ── 2. Open Graph price meta tags ────────────────────────────────────────
  const ogP = getMeta(html, 'price:amount') || getMeta(html, 'product:price:amount');
  const ogC = getMeta(html, 'price:currency') || getMeta(html, 'product:price:currency');
  if (ogP) {
    const r = parsePriceString(ogP, ogC || currency);
    if (r) return r;
  }

  // ── 3. Microdata itemprop ─────────────────────────────────────────────────
  const ipContent = html.match(/itemprop=["']price["'][^>]*content=["']([\d.,]+)["']/i);
  if (ipContent?.[1]) {
    const r = parsePriceString(ipContent[1], currency);
    if (r) return r;
  }
  // itemprop price as text node
  const ipText = html.match(/itemprop=["']price["'][^>]*>\s*([\u00a3$\u20ac\u20a6]?[\d,. ]+)/i);
  if (ipText?.[1]) {
    const r = parsePriceString(ipText[1], currency);
    if (r) return r;
  }

  // ── 4. Amazon-specific patterns ───────────────────────────────────────────
  // a-offscreen (screen-reader price, very reliable on Amazon)
  const amzOffscreen = html.match(/class="a-offscreen"[^>]*>\s*([\u00a3$\u20ac][\d,]+\.?\d*)/i);
  if (amzOffscreen?.[1]) {
    const r = parsePriceString(amzOffscreen[1], 'GBP');
    if (r) return r;
  }
  // data-a-color="price" whole/fraction split
  const amzWhole = html.match(/class="[^"]*a-price-whole[^"]*"[^>]*>([\d,]+)/i);
  const amzFrac  = html.match(/class="[^"]*a-price-fraction[^"]*"[^>]*>(\d+)/i);
  if (amzWhole?.[1]) {
    const whole = amzWhole[1].replace(/,/g, '');
    const frac  = amzFrac?.[1] ?? '00';
    const r = parsePriceString(`${whole}.${frac}`, 'GBP');
    if (r) return r;
  }

  // ── 5. data-price attribute ───────────────────────────────────────────────
  const dataPrice = html.match(/data-price=["']([\d.,]+)["']/i);
  if (dataPrice?.[1]) {
    const r = parsePriceString(dataPrice[1], currency);
    if (r) return r;
  }

  // ── 6. Generic price class spans/divs ────────────────────────────────────
  const genericPats = [
    /<[^>]+class="[^"]*(?:sale-?price|selling-?price|current-?price|final-?price|product-?price|offer-?price)[^"]*"[^>]*>\s*<[^>]*>\s*([\u00a3$\u20ac\u20a6][\d,]+\.?\d*)/i,
    /<[^>]+class="[^"]*(?:sale-?price|selling-?price|current-?price|final-?price|product-?price|offer-?price)[^"]*"[^>]*>\s*([\u00a3$\u20ac\u20a6][\d,]+\.?\d*)/i,
    /<[^>]+class="[^"]*price[^"]*"[^>]*>\s*(?:<[^>]*>)?\s*([\u00a3$\u20ac\u20a6][\d,]+\.?\d*)/i,
    /"price"\s*:\s*"([\u00a3$\u20ac\u20a6]?[\d,]+\.?\d*)"/i,
    /"price"\s*:\s*([\d]+\.?\d*)/,
  ];
  for (const pat of genericPats) {
    const m = html.match(pat);
    if (m?.[1]) {
      const r = parsePriceString(m[1], currency);
      if (r) return r;
    }
  }

  return { price: null, currency };
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(parseInt(c)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\s+/g, ' ')
    .trim();
}

function extractDescription(html: string): string {
  for (const jld of [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]) {
    try {
      const items = [JSON.parse(jld[1])].flat();
      for (const item of items) {
        if (item.description?.length > 30)
          return decodeEntities(item.description.replace(/<[^>]*>/g, '').substring(0, 600));
      }
    } catch (_) {}
  }

  const skip = ['return', 'shipping', 'delivery', 'refund', 'cookie', 'javascript', 'enable', 'browser'];
  const og = getMeta(html, 'description');
  if (og?.length > 30 && !skip.some(w => og.toLowerCase().includes(w)))
    return decodeEntities(og.replace(/<[^>]*>/g, '').substring(0, 600));

  const meta = getMeta(html, 'description');
  if (meta?.length > 30) return decodeEntities(meta.replace(/<[^>]*>/g, '').substring(0, 600));

  const bullets: string[] = [];
  const bRe = /<span class="a-list-item">([^<]{15,300})<\/span>/gi;
  let m;
  while ((m = bRe.exec(html)) !== null && bullets.length < 5) {
    const t = m[1].trim().replace(/\s+/g, ' ');
    if (t.length > 15 && !skip.some(w => t.toLowerCase().includes(w))) bullets.push(decodeEntities(t));
  }
  if (bullets.length) return bullets.join(' | ').substring(0, 600);

  return '';
}

function extractVideo(html: string): string {
  const pats = [
    /"contentUrl"\s*:\s*"(https?:[^"]+\.mp4[^"]*)"/i,
    /<meta[^>]+property=["']og:video[^"']*["'][^>]+content=["']([^"'<>]+)["']/i,
    /data-video-url=["'](https?:[^"']+)["']/i,
    /"videoUrl"\s*:\s*"(https?:[^"]+\.mp4[^"]*)"/i,
  ];
  for (const p of pats) {
    const m = html.match(p);
    if (m?.[1]) return m[1];
  }
  return '';
}

function detectCurrency(url: string, found: string): string {
  if (url.includes('.co.uk')) return 'GBP';
  if (url.includes('amazon.com') && !url.includes('.co')) return 'USD';
  if (url.includes('.de') || url.includes('.fr') || url.includes('.es') || url.includes('.it') || url.includes('.nl')) return 'EUR';
  if (url.includes('jumia.com.ng') || url.includes('jumia.ng')) return 'NGN';
  if (url.includes('jumia.co.ke')) return 'KES';
  if (url.includes('jumia.com.gh')) return 'GHS';
  if (url.includes('alibaba.com') || url.includes('aliexpress.com')) return 'USD';
  return found || 'GBP';
}

function detectNetwork(url: string): string {
  if (url.includes('amazon.')) return 'amazon';
  if (url.includes('shareasale.com')) return 'shareasale';
  if (url.includes('cj.com')) return 'cj';
  if (url.includes('awin1.com') || url.includes('awin.com')) return 'awin';
  return 'custom';
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url) throw new Error('URL is required');

    const html = await fetchPage(url);
    if (!html) {
      return new Response(
        JSON.stringify({ error: 'Could not fetch this page. Try pasting the details manually.', blocked: true }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let name = getMeta(html, 'title');
    if (!name) {
      const t = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (t) name = t[1].replace(/[|\-\u2013:][^|\-\u2013:]*$/, '').trim();
    }
    name = decodeEntities(name).substring(0, 200);

    const description = extractDescription(html);
    const images = extractImages(html);
    const image_url = images[0] || '';
    const priceData = extractPrice(html);
    const video_url = extractVideo(html);
    priceData.currency = detectCurrency(url, priceData.currency);
    const affiliate_network = detectNetwork(url);

    // Convert to GBP using ECB rates via frankfurter.app
    let priceGBP = priceData.price;
    if (priceData.price && priceData.currency !== 'GBP') {
      try {
        const rateRes = await fetch(
          `https://api.frankfurter.app/latest?from=${priceData.currency}&to=GBP`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (rateRes.ok) {
          const rateData = await rateRes.json();
          const rate = rateData.rates?.GBP;
          if (rate) priceGBP = Math.round(priceData.price * rate * 100) / 100;
        }
      } catch (_) {
        const fallback: Record<string, number> = {
          USD: 0.79, EUR: 0.86, NGN: 0.00049, KES: 0.0061, GHS: 0.052,
          CAD: 0.58, AUD: 0.51, JPY: 0.0052, CNY: 0.11, INR: 0.0095, ZAR: 0.043,
        };
        const rate = fallback[priceData.currency];
        if (rate) priceGBP = Math.round(priceData.price * rate * 100) / 100;
      }
    }

    return new Response(
      JSON.stringify({
        name,
        description,
        image_url,
        images,
        price: priceGBP,
        original_price: priceData.price,
        original_currency: priceData.currency,
        currency: 'GBP',
        video_url,
        affiliate_network,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
