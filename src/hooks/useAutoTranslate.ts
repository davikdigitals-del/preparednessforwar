/**
 * Auto-translate using MyMemory free API.
 * Covers all NATO + partner languages.
 * Uses MutationObserver to catch async Supabase content.
 * Per-language sessionStorage cache.
 */

// MyMemory API language pair codes (some differ from ISO 639-1)
const API_LANG: Record<string, string> = {
  en: "en-GB",
  fr: "fr-FR",
  de: "de-DE",
  es: "es-ES",
  it: "it-IT",
  nl: "nl-NL",
  pl: "pl-PL",
  tr: "tr-TR",
  pt: "pt-PT",
  ro: "ro-RO",
  cs: "cs-CZ",
  hu: "hu-HU",
  el: "el-GR",
  bg: "bg-BG",
  hr: "hr-HR",
  sk: "sk-SK",
  sl: "sl-SI",
  et: "et-EE",
  lv: "lv-LV",
  lt: "lt-LT",
  da: "da-DK",
  no: "nb-NO",
  sv: "sv-SE",
  fi: "fi-FI",
  is: "is-IS",
  sq: "sq-AL",
  mk: "mk-MK",
  me: "sr-ME",
  uk: "uk-UA",
  ar: "ar-SA",
  zh: "zh-CN",
  ru: "ru-RU",
};

function getLangPair(target: string): string {
  return `en-GB|${API_LANG[target] || target}`;
}

function cacheKey(lang: string) { return `prw-t-${lang}`; }

function getCache(lang: string): Record<string, string> {
  try { return JSON.parse(sessionStorage.getItem(cacheKey(lang)) || "{}"); }
  catch { return {}; }
}

function saveCache(lang: string, cache: Record<string, string>) {
  try { sessionStorage.setItem(cacheKey(lang), JSON.stringify(cache)); }
  catch {}
}

async function translateText(text: string, targetLang: string): Promise<string> {
  const t = text.trim();
  if (!t || t.length < 2 || targetLang === "en") return text;

  const cache = getCache(targetLang);
  if (cache[t]) return cache[t];

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(t)}&langpair=${getLangPair(targetLang)}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 7000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return text;

    const data = await res.json();
    const out: string = data?.responseData?.translatedText || t;

    // Reject error strings from MyMemory
    const low = out.toLowerCase();
    if (
      low.includes("mymemory") || low.includes("quota") ||
      low.includes("invalid") || low.includes("please") ||
      out === t
    ) return text;

    cache[t] = out;
    saveCache(targetLang, cache);
    return out;
  } catch {
    return text;
  }
}

const SKIP_TAGS = new Set([
  "script","style","noscript","code","pre",
  "input","textarea","select","svg","path","canvas",
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

async function translateNodes(nodes: Text[], lang: string) {
  const BATCH = 6;
  for (let i = 0; i < nodes.length; i += BATCH) {
    await Promise.all(nodes.slice(i, i + BATCH).map(async (node) => {
      const orig = node.textContent || "";
      if (!orig.trim() || orig.trim().length < 2) return;
      const out = await translateText(orig.trim(), lang);
      if (out && out !== orig.trim()) {
        if (!(node as any).__original) (node as any).__original = orig;
        node.textContent = out;
        (node as any).__translated = lang;
      }
    }));
    if (i + BATCH < nodes.length) await new Promise(r => setTimeout(r, 90));
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
let timer: ReturnType<typeof setTimeout> | null = null;
let busy = false;

function scheduleNew(root: Element) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(async () => {
    if (busy || currentLang === "en") return;
    const nodes = getTextNodes(root, true);
    if (nodes.length) await translateNodes(nodes, currentLang);
  }, 400);
}

function startObs(root: Element) {
  if (obs) obs.disconnect();
  obs = new MutationObserver((muts) => {
    if (currentLang === "en" || busy) return;
    if (muts.some(m => m.type === "childList" && m.addedNodes.length > 0)) {
      scheduleNew(root);
    }
  });
  obs.observe(root, { childList: true, subtree: true });
}

export async function translatePage(targetLang: string) {
  const root = document.getElementById("root");
  if (!root) return;

  if (targetLang === "en") {
    currentLang = "en";
    restoreAll(root);
    if (obs) { obs.disconnect(); obs = null; }
    return;
  }

  // Always restore to English originals before translating to any language
  if (currentLang !== "en") restoreAll(root);

  currentLang = targetLang;
  busy = true;
  try {
    await translateNodes(getTextNodes(root, true), targetLang);
  } finally {
    busy = false;
  }

  startObs(root);
}
