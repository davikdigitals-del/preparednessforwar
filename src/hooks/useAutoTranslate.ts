/**
 * Auto-translate using Google Translate free endpoint.
 * Fully non-blocking — yields to the browser between every batch
 * so the UI stays 100% responsive while translating.
 * Per-language sessionStorage cache.
 */

function cacheKey(lang: string) { return `prw-t-${lang}`; }

function getCache(lang: string): Record<string, string> {
  try { return JSON.parse(sessionStorage.getItem(cacheKey(lang)) || "{}"); }
  catch { return {}; }
}

function saveCache(lang: string, cache: Record<string, string>) {
  try { sessionStorage.setItem(cacheKey(lang), JSON.stringify(cache)); }
  catch {}
}

// Google Translate free endpoint — no API key required
async function translateBatch(texts: string[], targetLang: string): Promise<string[]> {
  if (!texts.length || targetLang === "en") return texts;

  // Join with a separator Google won't translate
  const SEP = " ||||| ";
  const joined = texts.join(SEP);

  try {
    const url =
      `https://translate.googleapis.com/translate_a/single` +
      `?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(joined)}`;

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return texts;

    const data = await res.json();
    const out: string = data?.[0]
      ?.map((chunk: any[]) => chunk?.[0] || "")
      .join("") || joined;

    // Split back — Google may alter spacing around separator
    const parts = out.split(/\s*\|\|\|\|\|\s*/);
    return parts.map((p, i) => p.trim() || texts[i]);
  } catch {
    return texts;
  }
}

async function translateSingle(text: string, targetLang: string): Promise<string> {
  const t = text.trim();
  if (!t || t.length < 2 || targetLang === "en") return text;

  const cache = getCache(targetLang);
  if (cache[t]) return cache[t];

  const results = await translateBatch([t], targetLang);
  const out = results[0] || t;
  if (out && out !== t) {
    const c = getCache(targetLang);
    c[t] = out;
    saveCache(targetLang, c);
  }
  return out || text;
}

const SKIP_TAGS = new Set([
  "script","style","noscript","code","pre",
  "input","textarea","select","svg","path","canvas","img",
]);

function getTextNodes(root: Element, onlyNew = true): Text[] {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const p = node.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      if (SKIP_TAGS.has(p.tagName.toLowerCase())) return NodeFilter.FILTER_REJECT;
      const txt = node.textContent?.trim() || "";
      if (!txt || txt.length < 2) return NodeFilter.FILTER_REJECT;
      if (p.closest("[data-notranslate]")) return NodeFilter.FILTER_REJECT;
      if (onlyNew && (node as any).__translated) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n;
  while ((n = walker.nextNode())) nodes.push(n as Text);
  return nodes;
}

// Yield to browser — uses requestIdleCallback when available
function yieldToBrowser(deadline?: number): Promise<void> {
  return new Promise(resolve => {
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(() => resolve(), { timeout: deadline ?? 500 });
    } else {
      setTimeout(resolve, 4); // ~1 frame
    }
  });
}

// Translate nodes in small batches, yielding between each so UI stays responsive
async function translateNodes(nodes: Text[], lang: string, signal: AbortSignal) {
  // Group nodes into batches of 5 — small enough to not block, big enough to be efficient
  const BATCH = 5;

  for (let i = 0; i < nodes.length; i += BATCH) {
    if (signal.aborted) return;

    // Yield to browser BEFORE each batch — keeps UI interactive
    await yieldToBrowser();
    if (signal.aborted) return;

    const batch = nodes.slice(i, i + BATCH);

    // Collect uncached texts
    const cache = getCache(lang);
    const toFetch: { node: Text; orig: string }[] = [];
    const cached: { node: Text; orig: string; out: string }[] = [];

    for (const node of batch) {
      const orig = node.textContent || "";
      const t = orig.trim();
      if (!t || t.length < 2) continue;
      if (cache[t]) {
        cached.push({ node, orig, out: cache[t] });
      } else {
        toFetch.push({ node, orig });
      }
    }

    // Apply cached translations immediately (no network, no blocking)
    for (const { node, orig, out } of cached) {
      if (!(node as any).__original) (node as any).__original = orig;
      node.textContent = out;
      (node as any).__translated = lang;
    }

    // Fetch uncached in one batch request
    if (toFetch.length > 0 && !signal.aborted) {
      const texts = toFetch.map(x => x.orig.trim());
      const results = await translateBatch(texts, lang);

      if (signal.aborted) return;

      const newCache = getCache(lang);
      for (let j = 0; j < toFetch.length; j++) {
        const { node, orig } = toFetch[j];
        const out = results[j];
        if (out && out !== orig.trim()) {
          if (!(node as any).__original) (node as any).__original = orig;
          node.textContent = out;
          (node as any).__translated = lang;
          newCache[orig.trim()] = out;
        }
      }
      saveCache(lang, newCache);
    }
  }
}

function restoreAll(root: Element) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    const node = n as any;
    if (node.__original) {
      node.textContent = node.__original;
      node.__translated = false;
    }
  }
}

let currentLang = "en";
let obs: MutationObserver | null = null;
let mutTimer: ReturnType<typeof setTimeout> | null = null;
let abortCtrl: AbortController | null = null;

function scheduleNew(root: Element) {
  if (mutTimer) clearTimeout(mutTimer);
  mutTimer = setTimeout(async () => {
    if (currentLang === "en") return;
    const nodes = getTextNodes(root, true);
    if (!nodes.length) return;
    const ctrl = new AbortController();
    await translateNodes(nodes, currentLang, ctrl.signal);
  }, 800);
}

function startObs(root: Element) {
  if (obs) obs.disconnect();
  obs = new MutationObserver((muts) => {
    if (currentLang === "en") return;
    if (muts.some(m => m.type === "childList" && m.addedNodes.length > 0)) {
      scheduleNew(root);
    }
  });
  obs.observe(root, { childList: true, subtree: true });
}

export async function translatePage(targetLang: string) {
  const root = document.getElementById("root");
  if (!root) return;

  // Cancel any in-progress translation
  if (abortCtrl) abortCtrl.abort();

  if (targetLang === "en") {
    currentLang = "en";
    restoreAll(root);
    if (obs) { obs.disconnect(); obs = null; }
    return;
  }

  // Restore originals before switching to a new language
  if (currentLang !== "en") restoreAll(root);

  currentLang = targetLang;
  abortCtrl = new AbortController();

  const nodes = getTextNodes(root, true);
  await translateNodes(nodes, targetLang, abortCtrl.signal);

  // Watch for new async content (Supabase data, lazy-loaded components)
  startObs(root);
}
