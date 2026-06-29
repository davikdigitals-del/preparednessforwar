/**
 * Translation via Google Translate widget.
 * The widget is loaded in index.html OUTSIDE #root so it never
 * touches React's DOM — no insertBefore/removeChild crashes.
 *
 * When a language is selected, we set the googtrans cookie and
 * trigger the GT select element. GT handles all DOM translation
 * via its own iframe overlay.
 *
 * Switching back to English: GT has no reliable JS API to restore
 * the original text without a reload. We clear the cookie and reload —
 * the page comes back in English with no translation active.
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
  document.cookie = `googtrans=${val}; path=/`;
  document.cookie = `googtrans=${val}; path=/; domain=${location.hostname}`;
}

function triggerGTSelect(lang: string) {
  const gtLang = GT_CODES[lang] || lang;
  const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
  if (select) {
    select.value = gtLang;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }
  return false;
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
    // Clear the googtrans cookie on both path variants, then reload.
    // This is the only reliable way to restore original text with GT.
    document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = `googtrans=; path=/; domain=${location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    window.location.reload();
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
