/**
 * Translation engine using Google Translate Element API.
 * Free, no API key, translates all page content including dynamic article text.
 * Falls back to MyMemory for programmatic use.
 */

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
    _gtInitialized: boolean;
  }
}

// Google Translate language codes
const GT_LANG: Record<string, string> = {
  en: "",       // English = no translation (restore)
  fr: "fr",
  de: "de",
  es: "es",
  it: "it",
  nl: "nl",
  pl: "pl",
  tr: "tr",
  pt: "pt",
  ro: "ro",
  cs: "cs",
  hu: "hu",
  el: "el",
  bg: "bg",
  hr: "hr",
  sk: "sk",
  sl: "sl",
  et: "et",
  lv: "lv",
  lt: "lt",
  da: "da",
  no: "no",
  sv: "sv",
  fi: "fi",
  is: "is",
  sq: "sq",
  mk: "mk",
  me: "sr",
  uk: "uk",
  ar: "ar",
  zh: "zh-CN",
  ru: "ru",
};

let gtReady = false;
let pendingLang: string | null = null;

function initGoogleTranslate() {
  if (window._gtInitialized) return;
  window._gtInitialized = true;

  // Create hidden container for Google Translate widget
  const container = document.createElement("div");
  container.id = "google_translate_element";
  container.style.cssText = "position:absolute;top:-9999px;left:-9999px;visibility:hidden;";
  document.body.appendChild(container);

  window.googleTranslateElementInit = () => {
    new window.google.translate.TranslateElement(
      {
        pageLanguage: "en",
        autoDisplay: false,
        includedLanguages: Object.values(GT_LANG).filter(Boolean).join(","),
      },
      "google_translate_element"
    );
    gtReady = true;

    // Apply any pending language
    if (pendingLang) {
      applyGoogleTranslate(pendingLang);
      pendingLang = null;
    }
  };

  // Load Google Translate script
  const script = document.createElement("script");
  script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  script.onerror = () => {
    console.warn("Google Translate failed to load");
    gtReady = false;
  };
  document.head.appendChild(script);
}

function applyGoogleTranslate(targetLang: string) {
  const gtCode = GT_LANG[targetLang];

  if (!gtCode) {
    // Restore to English
    restoreToEnglish();
    return;
  }

  // Find the Google Translate select element and change it
  const tryApply = (attempts = 0) => {
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (select) {
      select.value = gtCode;
      select.dispatchEvent(new Event("change"));
      return;
    }
    // Retry up to 20 times (2 seconds)
    if (attempts < 20) {
      setTimeout(() => tryApply(attempts + 1), 100);
    }
  };

  tryApply();
}

function restoreToEnglish() {
  // Click the "Show original" button if present
  const showOriginal = document.querySelector(".goog-te-banner-frame") as HTMLIFrameElement;
  if (showOriginal) {
    try {
      const btn = showOriginal.contentDocument?.querySelector(".goog-te-button button") as HTMLButtonElement;
      if (btn) { btn.click(); return; }
    } catch {}
  }

  // Alternative: set select to empty (English)
  const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
  if (select) {
    select.value = "";
    select.dispatchEvent(new Event("change"));
    return;
  }

  // Last resort: reload without translation cookie
  const cookie = document.cookie;
  if (cookie.includes("googtrans")) {
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
    window.location.reload();
  }
}

export function translatePage(targetLang: string) {
  // Initialize Google Translate on first call
  if (!window._gtInitialized) {
    initGoogleTranslate();
  }

  if (!gtReady) {
    // Queue it — will be applied once GT loads
    pendingLang = targetLang;
    return;
  }

  applyGoogleTranslate(targetLang);
}

// Hide the Google Translate toolbar banner (it's ugly)
export function hideGoogleTranslateBar() {
  const style = document.createElement("style");
  style.textContent = `
    .goog-te-banner-frame, .goog-te-balloon-frame { display: none !important; }
    body { top: 0 !important; }
    .skiptranslate { display: none !important; }
    #google_translate_element { display: none !important; }
    .goog-te-gadget { display: none !important; }
  `;
  document.head.appendChild(style);
}
