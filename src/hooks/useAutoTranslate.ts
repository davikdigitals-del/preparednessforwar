/**
 * Auto-translate using MyMemory free API.
 * Uses MutationObserver to catch dynamically loaded content (Supabase data, etc.)
 * Caches translations in sessionStorage to avoid repeat API calls.
 */

const CACHE_KEY = "prw-translations";

function getCache(): Record<string, string> {
  try {
    return JSON.parse(sessionStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, string>) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

async function translateText(text: string, targetLang: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 2 || targetLang === "en") return text;

  const cache = getCache();
  const cacheKey = `${targetLang}:${trimmed}`;
  if (cache[cacheKey]) return cache[cacheKey];

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=en|${targetLang}`;
    const res = await fetch(url, { signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined });
    if (!res.ok) return text;
    const data = await res.json();
    const translated: string = data?.responseData?.translatedText || trimmed;

    // MyMemory sometimes returns error strings — ignore them
    if (translated.toLowerCase().includes("mymemory") || translated.toLowerCase().includes("quota")) {
      return text;
    }

    cache[cacheKey] = translated;
    saveCache(cache);
    return translated;
  } catch {
    return text;
  }
}

// Tags to skip
const SKIP_TAGS = new Set(["script", "style", "noscript", "code", "pre", "input", "textarea", "select", "button", "a"]);

// Get all translatable text nodes under an element
function getTextNodes(root: Element): Text[] {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName.toLowerCase();
      if (SKIP_TAGS.has(tag)) return NodeFilter.FILTER_REJECT;
      if (!node.textContent?.trim() || node.textContent.trim().length < 2) return NodeFilter.FILTER_REJECT;
      if (parent.closest("[data-notranslate]")) return NodeFilter.FILTER_REJECT;
      // Skip already-translated nodes
      if ((node as any).__translated) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let node;
  while ((node = walker.nextNode())) nodes.push(node as Text);
  return nodes;
}

// Translate a batch of text nodes
async function translateNodes(nodes: Text[], targetLang: string) {
  // Process in small batches with delay to avoid rate limiting
  const BATCH = 5;
  for (let i = 0; i < nodes.length; i += BATCH) {
    const batch = nodes.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (node) => {
        const original = node.textContent || "";
        if (!original.trim() || original.trim().length < 2) return;
        const translated = await translateText(original, targetLang);
        if (translated && translated !== original.trim()) {
          node.textContent = translated;
          (node as any).__translated = true;
          (node as any).__original = original;
        }
      })
    );
    // Throttle to avoid hitting rate limits
    if (i + BATCH < nodes.length) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
}

let currentLang = "en";
let observer: MutationObserver | null = null;
let translateTimer: ReturnType<typeof setTimeout> | null = null;

// Debounced translate — waits for DOM to settle before translating new nodes
function scheduleTranslate(root: Element) {
  if (translateTimer) clearTimeout(translateTimer);
  translateTimer = setTimeout(async () => {
    const nodes = getTextNodes(root);
    if (nodes.length > 0) {
      await translateNodes(nodes, currentLang);
    }
  }, 300);
}

// Start observing DOM mutations and translate new content as it appears
function startObserver(root: Element) {
  if (observer) observer.disconnect();

  observer = new MutationObserver((mutations) => {
    if (currentLang === "en") return;
    let hasNewText = false;
    for (const mutation of mutations) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        hasNewText = true;
        break;
      }
    }
    if (hasNewText) scheduleTranslate(root);
  });

  observer.observe(root, {
    childList: true,
    subtree: true,
  });
}

// Restore original text (when switching back to English)
function restoreOriginals(root: Element) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const textNode = node as any;
    if (textNode.__translated && textNode.__original) {
      textNode.textContent = textNode.__original;
      textNode.__translated = false;
    }
  }
}

export async function translatePage(targetLang: string) {
  const root = document.getElementById("root");
  if (!root) return;

  if (targetLang === "en") {
    currentLang = "en";
    restoreOriginals(root);
    if (observer) observer.disconnect();
    return;
  }

  // Clear session cache if language changed
  if (targetLang !== currentLang) {
    try { sessionStorage.removeItem(CACHE_KEY); } catch {}
  }

  currentLang = targetLang;

  // Translate existing content
  const nodes = getTextNodes(root);
  await translateNodes(nodes, targetLang);

  // Watch for new content (Supabase data loading in)
  startObserver(root);
}
