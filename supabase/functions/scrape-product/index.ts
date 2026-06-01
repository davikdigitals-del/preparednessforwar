import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "Missing url" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Step 1: Try Jina AI reader — renders JS, works on Amazon/eBay
    const jinaRes = await fetch(`https://r.jina.ai/${url}`, {
      headers: {
        "Accept": "application/json",
        "X-Return-Format": "json",
        "X-With-Images-Summary": "true",
      },
      signal: AbortSignal.timeout(20000),
    });

    let title = "";
    let description = "";
    let images: string[] = [];
    let price: number | null = null;

    if (jinaRes.ok) {
      const data = await jinaRes.json();
      const content = data.data || data;
      const text = content.text || content.content || "";

      title = content.title || "";
      description = content.description || text.substring(0, 200);

      // Extract price from content text
      const pricePatterns = [
        /\$\s*([\d,]+\.?\d{0,2})/,
        /£\s*([\d,]+\.?\d{0,2})/,
        /€\s*([\d,]+\.?\d{0,2})/,
        /"price":\s*"?([\d.]+)"?/i,
      ];
      for (const re of pricePatterns) {
        const m = text.match(re);
        if (m) { price = parseFloat(m[1].replace(/,/g, "")); break; }
      }

      // Collect images from Jina
      if (content.images && typeof content.images === "object") {
        Object.values(content.images).forEach((img) => {
          if (typeof img === "string" && img.startsWith("http")) images.push(img);
        });
      }
      // Extract markdown image URLs
      const mdImgs = [...text.matchAll(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]);
      images.push(...mdImgs);
    }

    // Step 2: For Amazon — derive image from ASIN via CDN (always works)
    if (url.includes("amazon.")) {
      const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/i) || url.match(/\/product\/([A-Z0-9]{10})/i);
      if (asinMatch) {
        const asin = asinMatch[1];
        // Amazon CDN image URLs — these are publicly accessible
        images.unshift(`https://images-na.ssl-images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`);
        images.unshift(`https://m.media-amazon.com/images/P/${asin}.jpg`);
      }
    }

    // Step 3: Fallback plain HTML scrape if Jina failed
    if (!title) {
      const htmlRes = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (htmlRes.ok) {
        const html = await htmlRes.text();
        const getMeta = (prop: string) => {
          const patterns = [
            new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i"),
            new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${prop}["']`, "i"),
            new RegExp(`<meta[^>]+name=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i"),
          ];
          for (const re of patterns) {
            const m = html.match(re);
            if (m) return m[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"').trim();
          }
          return "";
        };
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        title = getMeta("og:title") || getMeta("twitter:title") || (titleMatch ? titleMatch[1].trim() : "");
        description = getMeta("og:description") || getMeta("twitter:description") || getMeta("description");
        const ogImg = getMeta("og:image") || getMeta("twitter:image");
        if (ogImg) images.push(ogImg);
      }
    }

    return new Response(
      JSON.stringify({
        title,
        description,
        images: [...new Set(images)].slice(0, 6),
        price,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Scrape failed", detail: err.message }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
