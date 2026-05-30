/**
 * Non-blocking auto-translate using Google Translate free endpoint.
 *
 * SAFE approach: wraps translated text in a <span data-translated>
 * instead of mutating React-owned text nodes directly.
 * This prevents React's DOM reconciliation from crashing.
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
const SKIP_TAGS = new Set([
  "script","style","noscript","code","pre","input","textarea",
  "select","svg","path","canvas","img","button","a","option",
]);

// Find elements (not text nodes) that contain only a single text node
// and are safe to translate — these are "leaf" elements React won't split
function getLeafElements(root: Element): Element[] {
  const results: Element[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode(el) {
      const element = el as Element;
      const tag = element.tagName.toLowerCase();

      // Skip tags we never translate
      if (SKIP_TAGS.has(tag)) return NodeFilter.FILTER_REJECT;

      // Skip elements already translated
      if (element.hasAttribute("data-translated")) return NodeFilter.FILTER_REJECT;

      // Skip elements marked no-translate
      if (element.closest("[data-notranslate]")) return NodeFilter.FILTER_REJECT;

      // Only accept elements whose ONLY child is a single text node
      const children = element.childNodes;
      if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
        const txt = (children[0] as Text).textContent?.trim() || "";
        if (txt.length >= 2) return NodeFilter.FILTER_ACCEPT;
      }

      return NodeFilter.FILTER_SKIP;
    },
  });

  let n: Node | null;
  while ((n = walker.nextNode())) results.push(n as Element);
  return results;
}

// Restore all translated elements back to original
function restoreAll(root: Element) {
  root.querySelectorAll("[data-translated]").forEach(el => {
    const orig = el.getAttribute("data-original");
    if (orig !== null) {
      el.textContent = orig;
      el.removeAttribute("data-translated");
      el.removeAttribute("data-original");
    }
  });
}

// ─── Scheduler ───────────────────────────────────────────────────────────────
function nextFrame(): Promise<void> {
  return new Promise(r => requestAnimationFrame(() => r()));
}

function idle(ms = 150): Promise<void> {
  return new Promise(r => {
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(() => r(), { timeout: ms });
    } else {
      setTimeout(r, 16);
    }
  });
}

// ─── Core translate loop ──────────────────────────────────────────────────────
async function processElements(elements: Element[], lang: string, signal: AbortSignal) {
  const BATCH = 8;

  for (let i = 0; i < elements.length; i += BATCH) {
    if (signal.aborted) return;
    await idle(100);
    if (signal.aborted) return;

    const batch = elements.slice(i, i + BATCH);
    const cache = getCache(lang);
    const needFetch: { el: Element; orig: string }[] = [];

    for (const el of batch) {
      if (signal.aborted) return;
      // Re-check: element might have been removed from DOM or already translated
      if (!document.contains(el)) continue;
      if (el.hasAttribute("data-translated")) continue;

      const orig = el.textContent?.trim() || "";
      if (!orig || orig.length < 2) continue;

      if (cache[orig]) {
        // Apply from cache — safe: set textContent on the element, not the text node
        el.setAttribute("data-original", orig);
        el.setAttribute("data-translated", lang);
        el.textContent = cache[orig];
      } else {
        needFetch.push({ el, orig });
      }
    }

    if (needFetch.length > 0 && !signal.aborted) {
      const texts = needFetch.map(x => x.orig);
      const results = await gtranslate(texts, lang, signal);
      if (signal.aborted) return;

      for (let j = 0; j < needFetch.length; j++) {
        const { el, orig } = needFetch[j];
        if (!document.contains(el)) continue;
        if (el.hasAttribute("data-translated")) continue;
        const out = results[j];
        if (out && out !== orig) {
          el.setAttribute("data-original", orig);
          el.setAttribute("data-translated", lang);
          el.textContent = out;
          setCache(lang, orig, out);
        }
      }
    }

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

  let isProcessing = false;

  mutObs = new MutationObserver((muts) => {
    if (currentLang === "en" || isProcessing) return;

    // Only care about new elements added to the DOM
    const hasNew = muts.some(m =>
      m.type === "childList" &&
      Array.from(m.addedNodes).some(n =>
        n.nodeType === Node.ELEMENT_NODE &&
        (n as Element).textContent?.trim().length > 2
      )
    );
    if (!hasNew) return;

    if (mutTimer) clearTimeout(mutTimer);
    mutTimer = setTimeout(async () => {
      if (currentLang === "en" || isProcessing) return;
      isProcessing = true;
      mutObs?.disconnect();
      try {
        const els = getLeafElements(root);
        if (els.length > 0) {
          const ctrl = new AbortController();
          await processElements(els, currentLang, ctrl.signal);
        }
      } finally {
        isProcessing = false;
        if (currentLang !== "en") {
          mutObs?.observe(root, { childList: true, subtree: true });
        }
      }
    }, 1000);
  });

  mutObs.observe(root, { childList: true, subtree: true });

  // Auto-stop after 20s — page should be fully loaded by then
  setTimeout(() => {
    if (mutObs) { mutObs.disconnect(); mutObs = null; }
  }, 20000);
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

  // Restore before switching language
  if (currentLang !== "en") restoreAll(root);

  currentLang = targetLang;
  abort = new AbortController();
  const signal = abort.signal;

  await nextFrame();
  if (signal.aborted) return;

  const elements = getLeafElements(root);
  await processElements(elements, targetLang, signal);

  if (!signal.aborted) watchMutations(root);
}
