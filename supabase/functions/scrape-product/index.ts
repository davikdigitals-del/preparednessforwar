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
        redirect: 'follow', signal: ctrl.signal,
      });
      clearTimeout(t);
      if (res.ok) {
        const text = await res.text();
        if (text.length > 5000
          && !text.toLowerCase().includes('enable javascript')
          && !text.toLowerCase().includes('access denied')
          && !text.toLowerCase().includes('robot check')
          && !text.toLowerCase().includes('captcha')) {
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
  for (const p of ps) { const m = html.match(p); if (m?.[1]) return m[1].trim(); }
  return '';
}

// Get a deduplication key for any image URL by stripping size variants
function getImageKey(url: string): string {
  // Amazon: use the image ID (e.g. 51abc123XYZ)
  if (url.includes('amazon') || url.includes('media-amazon')) {
    const m = url.match(/\/images\/[A-Z]\/([A-Za-z0-9+]+)/);
    if (m) return m[1];
  }
  // Jumia: strip size prefix like /unsafe/fit-in/300x300/filters:fill(white)/
  if (url.includes('jumia')) {
    return url.replace(/\/unsafe\/fit-in\/\d+x\d+\/[^/]+\//g, '/').toLowerCase();
  }
  // Generic: strip common size suffixes and query strings
  return url
    .replace(/[?&](width|height|w|h|size|resize|fit|quality|q|format)=[^&]*/gi, '')
    .replace(/\/\d+x\d+\//g, '/')
    .replace(/_\d+x\d+\./g, '.')
    .replace(/-(small|medium|large|thumb|thumbnail|preview|xs|sm|md|lg|xl)\./gi, '.')
    .replace(/\?.*$/, '')
    .toLowerCase()
    .trim();
}

// Get the best (highest res) version of an image URL
function getBestImageUrl(url: string): string {
  // Amazon: force high-res
  if (url.includes('amazon') || url.includes('media-amazon')) {
    const m = url.match(/(https:\/\/[^\s]+?\/images\/[A-Z]\/[A-Za-z0-9+]+)\./i);
    if (m) return `${m[1]}._AC_SL1500_.jpg`;
  }
  // Jumia: use 680x680 version
  if (url.includes('jumia')) {
    return url.replace(/\/fit-in\/\d+x\d+\//, '/fit-in/680x680/');
  }
  // Strip query strings for cleaner URLs
  return url.replace(/\?.*$/, '');
}

function extractImages(html: string): string[] {
  const seenKeys = new Set<string>();
  const imgs: string[] = [];

  const add = (src: string) => {
    if (!src?.startsWith('http')) return;
    if (src.includes('sprite') || src.includes('pixel') || src.includes('blank') ||
        src.includes('placeholder') || src.includes('logo') || src.includes('icon')) return;

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
    try { const obj = JSON.parse(m[1].replace(/&quot;/g, '"')); Object.keys(obj).forEach(k => add(k)); } catch (_) {}
  }
  const jldRe = /"image"\s*:\s*(?:"(https?:[^"]+)"|\[([^\]]+)\])/gi;
  while ((m = jldRe.exec(html)) !== null) {
    if (m[1]) add(m[1]);
    if (m[2]) { const us = m[2].match(/"(https?:[^"]+)"/g); if (us) us.forEach(u => add(u.replace(/"/g, ''))); }
  }
  const dataImgRe = /data-(?:src|image|img)=["'](https?:[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/gi;
  while ((m = dataImgRe.exec(html)) !== null) add(m[1]);
  return imgs.slice(0, 8);
}

function extractPrice(html: string): { price: number | null; currency: string } {
  let currency = 'GBP';
  for (const jld of [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]) {
    try {
      const items = [JSON.parse(jld[1])].flat();
      for (const item of items) {
        const offer = item.offers ? [item.offers].flat()[0] : null;
        if (offer?.price) {
          const p = parseFloat(String(offer.price));
          if (!isNaN(p) && p > 0) { if (offer.priceCurrency) currency = offer.priceCurrency; return { price: p, currency }; }
        }
      }
    } catch (_) {}
  }
  const ogP = getMeta(html, 'price:amount') || getMeta(html, 'product:price:amount');
  const ogC = getMeta(html, 'price:currency') || getMeta(html, 'product:price:currency');
  if (ogP) { const p = parseFloat(ogP); if (!isNaN(p) && p > 0) return { price: p, currency: ogC || currency }; }
  const ip = html.match(/itemprop=["']price["'][^>]*content=["']([\d.]+)["']/i);
  if (ip?.[1]) { const p = parseFloat(ip[1]); if (!isNaN(p) && p > 0) return { price: p, currency }; }
  const pats = [
    /class="a-offscreen"[^>]*>([\u00a3$\u20ac][\d,]+\.?[\d]*)/i,
    /<span[^>]*class="[^"]*(?:price|Price)[^"]*"[^>]*>\s*([\u00a3$\u20ac][\d,]+\.?[\d]*)/,
    /data-price=["']([\d.]+)["']/i,
    /"price":\s*"([\u00a3$\u20ac]?[\d,]+\.?[\d]*)"/i,
    /class="[^"]*price[^"]*"[^>]*>[^<]*([\u00a3$\u20ac][\d,]+\.?[\d]*)/i,
  ];
  for (const p of pats) {
    const m = html.match(p);
    if (m?.[1]) {
      let raw = m[1].trim();
      if (raw.startsWith('\u00a3')) { currency = 'GBP'; raw = raw.slice(1); }
      else if (raw.startsWith('$')) { currency = 'USD'; raw = raw.slice(1); }
      else if (raw.startsWith('\u20ac')) { currency = 'EUR'; raw = raw.slice(1); }
      const num = parseFloat(raw.replace(/,/g, ''));
      if (!isNaN(num) && num > 0 && num < 10000000) return { price: num, currency };
    }
  }
  return { price: null, currency };
}

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(parseInt(c)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\s+/g, ' ').trim();
}

function extractDescription(html: string): string {
  for (const jld of [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]) {
    try {
      const items = [JSON.parse(jld[1])].flat();
      for (const item of items) {
        if (item.description?.length > 30) return decodeEntities(item.description.replace(/<[^>]*>/g, '').substring(0, 600));
      }
    } catch (_) {}
  }
  const skip = ['return', 'shipping', 'delivery', 'refund', 'cookie', 'javascript', 'enable', 'browser'];
  const og = getMeta(html, 'description');
  if (og?.length > 30 && !skip.some(w => og.toLowerCase().includes(w))) return decodeEntities(og.replace(/<[^>]*>/g, '').substring(0, 600));
  const meta = getMeta(html, 'description');
  if (meta?.length > 30) return decodeEntities(meta.replace(/<[^>]*>/g, '').substring(0, 600));
  const bullets: string[] = []; const bRe = /<span class="a-list-item">([^<]{15,300})<\/span>/gi; let m;
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
  for (const p of pats) { const m = html.match(p); if (m?.[1]) return m[1]; }
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
      return new Response(JSON.stringify({ error: 'Could not fetch this page. Try pasting the details manually.', blocked: true }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    let name = getMeta(html, 'title');
    if (!name) { const t = html.match(/<title[^>]*>([^<]+)<\/title>/i); if (t) name = t[1].replace(/[|\-\u2013:][^|\-\u2013:]*$/, '').trim(); }
    name = decodeEntities(name).substring(0, 200);
    const description = extractDescription(html);
    const images = extractImages(html);
    const image_url = images[0] || '';
    const priceData = extractPrice(html);
    const video_url = extractVideo(html);
    priceData.currency = detectCurrency(url, priceData.currency);
    const affiliate_network = detectNetwork(url);
    // Auto-convert price to GBP using ECB rates (same source as Google)
    let priceGBP = priceData.price;
    if (priceData.price && priceData.currency !== 'GBP') {
      try {
        // frankfurter.app uses European Central Bank rates — same as Google Finance
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
        // Fallback to approximate rates if API fails
        const fallbackRates: Record<string, number> = {
          USD: 0.79, EUR: 0.86, NGN: 0.00049, KES: 0.0061,
          GHS: 0.052, CAD: 0.58, AUD: 0.51, JPY: 0.0052,
          CNY: 0.11, INR: 0.0095, ZAR: 0.043,
        };
        const rate = fallbackRates[priceData.currency];
        if (rate) priceGBP = Math.round(priceData.price * rate * 100) / 100;
      }
    }
    return new Response(JSON.stringify({ name, description, image_url, images, price: priceGBP, original_price: priceData.price, original_currency: priceData.currency, currency: 'GBP', video_url, affiliate_network }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
