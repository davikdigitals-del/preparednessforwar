/**
 * Auto-translate using MyMemory free API.
 * Uses MutationObserver to catch dynamically loaded content.
 * Caches translations in sessionStorage per language.
 */

// MyMemory uses different codes for some languages
const LANG_CODE_MAP: Record<string, string> = {
  zh: "zh-CN",
  uk: "uk-UA",
  pt: "pt-BR",
};

function apiLang(code: string): string {
  return LANG_CODE_MAP[code] || code;
}

function getCacheKey(lang: string) {
  return `prw-trans-${lang}`;
}

function getCache(lang: string): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(getCacheKey(lang)) || "{}");
  } catch {
    return {};
  }
}

function saveCache(lang: string, cache: Record<string, string>) {
  try {
    sessionStorage.setItem(getCacheKey(lang), JSON.stringify(cache));
  } catch {}
}

async function translateText(text: string, targetLang: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 2 || targetLang === "en") return text;

  const cache = getCache(targetLang);
  if (cache[trimmed]) return cache[trimmed];

  try {
    const langPair = `en|${apiLang(targetLang)}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${langPair}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) return text;
    const data = await res.json();
    const translated: string = data?.responseData?.translatedText || trimmed;

    // Ignore MyMemory error responses
    if (
      translated.toLowerCase().includes("mymemory") ||
      translated.toLowerCase().includes("quota") ||
      translated.toLowerCase().includes("invalid") ||
      translated === trimmed
    ) {
      return text;
    }

    cache[trimmed] = translated;
    saveCache(targetLang, cache);
    return translated;
  } catch {
    return text;
  }
}

// Tags whose text content should NOT be translated
const SKIP_TAGS = new Set([
  "script", "style", "noscript", "code", "pre",
  "input", "textarea", "select", "svg", "path",
]);

// Collect all translatable text nodes
function getTextNodes(root: Element, onlyUntranslated = true): Text[] {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName.toLowerCase();
      if (SKIP_TAGS.has(tag)) return NodeFilter.FILTER_REJECT;
      const text = node.textContent?.trim() || "";
      if (!text || text.length < 2) return NodeFilter.FILTER_REJECT;
      if (parent.closest("[data-notranslate]")) return NodeFilter.FILTER_REJECT;
      if (onlyUntranslated && (node as any).__translated) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let node;
  while ((node = walker.nextNode())) nodes.push(node as Text);
  return nodes;
}

// Translate a list of text nodes in batches
async function translateNodes(nodes: Text[], targetLang: string) {
  const BATCH = 8;
  for (let i = 0; i < nodes.length; i += BATCH) {
    const batch = nodes.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (node) => {
        const original = node.textContent || "";
        if (!original.trim() || original.trim().length < 2) return;
        const translated = await translateText(original.trim(), targetLang);
        if (translated && translated !== original.trim()) {
          // Store original for restoration
          if (!(node as any).__original) {
            (node as any).__original = original;
          }
          node.textContent = translated;
          (node as any).__translated = targetLang;
        }
      })
    );
    if (i + BATCH < nodes.length) {
      await new Promise((r) => setTimeout(r, 80));
    }
  }
}

// Restore all nodes to their original English text
function restoreOriginals(root: Element) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const n = node as any;
    if (n.__original) {
      n.textContent = n.__original;
      n.__translated = false;
    }
  }
}

// Reset translated flag so nodes can be re-translated to a new language
function resetTranslatedFlags(root: Element) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const n = node as any;
    if (n.__translated) {
      n.__translated = false;
      // Restore to original so we translate from English, not from previous translation
      if (n.__original) {
        n.textContent = n.__original;
      }
    }
  }
}

let currentLang = "en";
let observer: MutationObserver | null = null;
let translateTimer: ReturnType<typeof setTimeout> | null = null;
let isTranslating = false;

function scheduleTranslate(root: Element) {
  if (translateTimer) clearTimeout(translateTimer);
  translateTimer = setTimeout(async () => {
    if (isTranslating || currentLang === "en") return;
    const nodes = getTextNodes(root, true);
    if (nodes.length > 0) {
      await translateNodes(nodes, currentLang);
    }
  }, 400);
}

function startObserver(root: Element) {
  if (observer) observer.disconnect();
  observer = new MutationObserver((mutations) => {
    if (currentLang === "en" || isTranslating) return;
    const hasNew = mutations.some(
      (m) => m.type === "childList" && m.addedNodes.length > 0
    );
    if (hasNew) scheduleTranslate(root);
  });
  observer.observe(root, { childList: true, subtree: true });
}

export async function translatePage(targetLang: string) {
  const root = document.getElementById("root");
  if (!root) return;

  // Switching back to English — restore all originals
  if (targetLang === "en") {
    currentLang = "en";
    restoreOriginals(root);
    if (observer) { observer.disconnect(); observer = null; }
    return;
  }

  // Switching to a different non-English language
  if (targetLang !== currentLang && currentLang !== "en") {
    // Restore originals first so we translate from English
    restoreOriginals(root);
  } else if (targetLang !== currentLang) {
    // Was English, switching to new lang — reset flags
    resetTranslatedFlags(root);
  }

  currentLang = targetLang;
  isTranslating = true;

  try {
    const nodes = getTextNodes(root, true);
    await translateNodes(nodes, targetLang);
  } finally {
    isTranslating = false;
  }

  // Keep watching for new DOM content (async Supabase data)
  startObserver(root);
}
