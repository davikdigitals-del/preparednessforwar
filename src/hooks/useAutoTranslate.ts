/**
 * Translation via Google Translate widget.
 * The widget is loaded in index.html OUTSIDE #root so it never
 * touches React's DOM — no insertBefore/removeChild crashes.
 *
 * When a language is selected, we set the googtrans cookie and
 * trigger the GT select element. GT handles all DOM translation
 * via its own iframe overlay.
 */

// Map our lang codes to Google Translate codes
const GT_CODES: Record<string, string> = {
  en: "en", fr: "fr", de: "de", es: "es", it: "it", nl: "nl",
  pl: "pl", tr: "tr", pt: "pt", ro: "ro", cs: "cs", hu: "hu",
  el: "el", bg: "bg", hr: "hr", sk: "sk", sl: "sl", et: "et",
  lv: "lv", lt: "lt", da: "da", no: "no", sv: "sv", fi: "fi",
  is: "is", sq: "sq", mk: "mk", me: "sr", uk: "uk", ar: "ar",
  zh: "zh-CN", ru: "ru",
};

function setGTCookie(lang: string) {
  const gtLang = GT_CODES[lang] || lang;
  const val = lang === "en" ? "" : `/en/${gtLang}`;
  // Set on both root path and current domain
  document.cookie = `googtrans=${val}; path=/`;
  document.cookie = `googtrans=${val}; path=/; domain=${location.hostname}`;
}

function triggerGTSelect(lang: string) {
  const gtLang = GT_CODES[lang] || lang;
  // Find the Google Translate combo box
  const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
  if (select) {
    select.value = lang === "en" ? "" : gtLang;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }
  return false;
}

function restoreOriginal() {
  // Click the "Show original" button if GT bar is visible
  const iframe = document.querySelector(".goog-te-banner-frame") as HTMLIFrameElement | null;
  if (iframe) {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      const btn = doc?.querySelector("a.goog-te-banner-frame") as HTMLElement | null;
      btn?.click();
    } catch {}
  }
  // Also try the restore button in the GT bar
  const restoreBtn = document.querySelector(".goog-te-gadget a") as HTMLElement | null;
  restoreBtn?.click();
}

let currentLang = "en";
let retryCount = 0;
let retryTimer: ReturnType<typeof setTimeout> | null = null;

export async function translatePage(targetLang: string): Promise<void> {
  if (targetLang === currentLang) return;
  currentLang = targetLang;

  if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
  retryCount = 0;

  if (targetLang === "en") {
    setGTCookie("en");
    restoreOriginal();
    // If restore didn't work, reload without cookie
    setTimeout(() => {
      if (document.documentElement.lang !== "en") {
        window.location.reload();
      }
    }, 500);
    return;
  }

  setGTCookie(targetLang);

  // Try to trigger GT select — retry up to 10 times while GT loads
  const tryTrigger = () => {
    if (currentLang !== targetLang) return; // language changed again
    if (triggerGTSelect(targetLang)) {
      retryCount = 0;
      return;
    }
    retryCount++;
    if (retryCount < 10) {
      retryTimer = setTimeout(tryTrigger, 500);
    } else {
      // GT widget never loaded — reload with cookie set
      window.location.reload();
    }
  };

  // Give GT widget 300ms to initialise first
  retryTimer = setTimeout(tryTrigger, 300);
}
