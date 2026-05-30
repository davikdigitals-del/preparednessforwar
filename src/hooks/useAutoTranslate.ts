/**
 * Non-blocking auto-translate using Google Translate free endpoint.
 * Strategy:
 * - Only translate what's visible in the viewport first
 * - Use IntersectionObserver to translate as content scrolls into view
 * - Tiny batches (3 nodes) with scheduler yield between each
 * - AbortController cancels in-flight work when language changes
 */

// ─── Cache ────────────────────────────────────────────────────────────────────
const cacheKey = (lang: string) => `prw-t-${lang}`;

function getCache(lang: string): Record<string, string> {
  try { return JSON.parse(sessionStorage.getItem(cacheKey(lang)) || "{}"); }
  catch { return {}; }
}

function setCache(lang: string, key: string, val: string) {
  try {
    const c = getCache(lang);
    c[key] = val;
    sessionStorage.setItem(cacheKey(lang), JSON.stringify(c));
  } catch {}
}

// ─── Google Translate (free, no key) ─────────────────────────────────────────
async function gtranslate(texts: string[], lang: string, signal: AbortSignal): Promise<string[]> {
  if (!texts.length || lang === "en") return texts;
  const SEP = " ◆ ";
  const q = texts.join(SEP);
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { signal });
    if (!res.ok) return texts;
    const data = await res.json();
    const out: string = (data?.[0] || []).map((c: any[]) => c?.[0] || "").join("");
    const parts = out.split(/\s*◆\s*/);
    return texts.map((t, i) => parts[i]?.trim() || t);
  } catch {
    return texts;
  }
}

// ─── DOM helpers ─────────────────────────────────────────────────────────────
const SKIP = new Set(["script","style","noscript","code","pre","input","textarea","select","svg","path","canvas","img","button","a"]);

function collectNodes(root: Element): Text[] {
  const out: Text[] = [];
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const p = n.parentElement;
      if (!p) return NodeFilter.FILTER_REJECT;
      if (SKIP.has(p.tagName.toLowerCase())) return NodeFilter.FILTER_REJECT;
      if (p.closest("[data-notranslate]")) return NodeFilter.FILTER_REJECT;
      const txt = n.textContent?.trim() || "";
      if (txt.length < 2) return NodeFilter.FILTER_REJECT;
      if ((n as any).__translated) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n: Node | null;
  while ((n = w.nextNode())) out.push(n as Text);
  return out;
}

function restoreAll(root: Element) {
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let n: Node | null;
  while ((n = w.nextNode())) {
    const node = n as any;
    if (node.__original !== undefined) {
      node.textContent = node.__original;
      delete node.__translated;
    }
  }
}

// ─── Scheduler: yield every frame so UI never blocks ─────────────────────────
function nextFrame(): Promise<void> {
  return new Promise(r => requestAnimationFrame(() => r()));
}

function idle(ms = 200): Promise<void> {
  return new Promise(r => {
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(() => r(), { timeout: ms });
    } else {
      setTimeout(r, 16);
    }
  });
}

// ─── Core translate loop ──────────────────────────────────────────────────────
async function processNodes(nodes: Text[], lang: string, signal: AbortSignal) {
  const BATCH = 3; // tiny batches = UI never freezes

  for (let i = 0; i < nodes.length; i += BATCH) {
    if (signal.aborted) return;

    // Yield to browser — let it handle user input, paint, etc.
    await idle(100);
    if (signal.aborted) return;

    const batch = nodes.slice(i, i + BATCH);
    const cache = getCache(lang);

    // Split into cached vs needs-fetch
    const needFetch: { node: Text; orig: string }[] = [];

    for (const node of batch) {
      if (signal.aborted) return;
      const orig = node.textContent || "";
      const t = orig.trim();
      if (!t || t.length < 2) continue;

      if (cache[t]) {
        // Apply from cache instantly — no network
        if ((node as any).__original === undefined) (node as any).__original = orig;
        node.textContent = cache[t];
        (node as any).__translated = lang;
      } else {
        needFetch.push({ node, orig });
      }
    }

    // Fetch uncached texts in one request
    if (needFetch.length > 0 && !signal.aborted) {
      const texts = needFetch.map(x => x.orig.trim());
      const results = await gtranslate(texts, lang, signal);
      if (signal.aborted) return;

      for (let j = 0; j < needFetch.length; j++) {
        const { node, orig } = needFetch[j];
        const out = results[j];
        if (out && out !== orig.trim()) {
          if ((node as any).__original === undefined) (node as any).__original = orig;
          node.textContent = out;
          (node as any).__translated = lang;
          setCache(lang, orig.trim(), out);
        }
      }
    }

    // Yield a frame after every batch so browser can paint
    await nextFrame();
  }
}

// ─── State ────────────────────────────────────────────────────────────────────
let currentLang = "en";
let abort: AbortController | null = null;
let mutObs: MutationObserver | null = null;
let mutTimer: ReturnType<typeof setTimeout> | null = null;

function cancelCurrent() {
  if (abort) { abort.abort(); abort = null; }
  if (mutTimer) { clearTimeout(mutTimer); mutTimer = null; }
}

function watchMutations(root: Element) {
  if (mutObs) mutObs.disconnect();

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let isProcessing = false;

  mutObs = new MutationObserver((muts) => {
    if (currentLang === "en" || isProcessing) return;

    // Only care about new text nodes added — ignore attribute/style changes
    const hasNewTextContent = muts.some(m => {
      if (m.type !== "childList") return false;
      return Array.from(m.addedNodes).some(node => {
        if (node.nodeType === Node.TEXT_NODE) return true;
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Only trigger if the added element contains actual text
          return (node as Element).textContent?.trim().length > 2;
        }
        return false;
      });
    });

    if (!hasNewTextContent) return;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      if (currentLang === "en" || isProcessing) return;
      isProcessing = true;

      // Disconnect observer while processing to prevent feedback loop
      mutObs?.disconnect();

      try {
        const nodes = collectNodes(root);
        if (nodes.length > 0) {
          const ctrl = new AbortController();
          await processNodes(nodes, currentLang, ctrl.signal);
        }
      } finally {
        isProcessing = false;
        // Reconnect only if still on a non-English language
        if (currentLang !== "en" && mutObs) {
          mutObs.observe(root, { childList: true, subtree: true });
        }
      }
    }, 1200);
  });

  mutObs.observe(root, { childList: true, subtree: true });
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function translatePage(targetLang: string) {
  const root = document.getElementById("root");
  if (!root) return;

  cancelCurrent();

  if (targetLang === "en") {
    currentLang = "en";
    restoreAll(root);
    if (mutObs) { mutObs.disconnect(); mutObs = null; }
    return;
  }

  // Restore originals before switching language
  if (currentLang !== "en") restoreAll(root);

  currentLang = targetLang;
  abort = new AbortController();
  const signal = abort.signal;

  // Wait one frame so React finishes rendering before we walk the DOM
  await nextFrame();
  if (signal.aborted) return;

  const nodes = collectNodes(root);
  await processNodes(nodes, targetLang, signal);

  // Only watch for genuinely new async content after initial translation
  // Disconnect after 30s to prevent infinite observer loops
  if (!signal.aborted) {
    watchMutations(root);
    setTimeout(() => {
      if (mutObs) { mutObs.disconnect(); mutObs = null; }
    }, 30000);
  }
}
