/**
 * Translation via Google Translate element API.
 * Does NOT mutate React-owned DOM nodes — uses Google's own iframe overlay.
 * This is the same approach used by major news sites.
 */

// Google Translate language codes
const GT_LANG: Record<string, string> = {
  en: "en", fr: "fr", de: "de", es: "es", it: "it", nl: "nl",
  pl: "pl", tr: "tr", pt: "pt", ro: "ro", cs: "cs", hu: "hu",
  el: "el", bg: "bg", hr: "hr", sk: "sk", sl: "sl", et: "et",
  lv: "lv", lt: "lt", da: "da", no: "no", sv: "sv", fi: "fi",
  is: "is", sq: "sq", mk: "mk", me: "sr", uk: "uk", ar: "ar",
  zh: "zh-CN", ru: "ru",
};

let currentLang = "en";

function getCookieLang(): string {
  const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
  return match ? match[1] : "en";
}

function setGoogleTranslateCookie(lang: string) {
  if (lang === "en") {
    // Remove the cookie to go back to original
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + location.hostname;
  } else {
    const gtLang = GT_LANG[lang] || lang;
    document.cookie = `googtrans=/en/${gtLang}; path=/`;
    document.cookie = `googtrans=/en/${gtLang}; path=/; domain=${location.hostname}`;
  }
}

function triggerGoogleTranslate(lang: string) {
  const gtLang = GT_LANG[lang] || lang;

  // Try using the Google Translate element API if loaded
  const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
  if (select) {
    select.value = lang === "en" ? "" : gtLang;
    select.dispatchEvent(new Event("change"));
    return;
  }

  // Fallback: set cookie and reload
  setGoogleTranslateCookie(lang);
  if (lang === "en") {
    // Restore original — reload without translation
    const iframe = document.querySelector(".goog-te-banner-frame") as HTMLIFrameElement | null;
    if (iframe) {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      const restoreBtn = iframeDoc?.querySelector(".goog-te-banner-frame") as HTMLElement | null;
      restoreBtn?.click();
    }
    // Nuclear restore: reload page
    window.location.reload();
  } else {
    window.location.reload();
  }
}

function injectGoogleTranslateScript(lang: string) {
  // Remove any existing GT script
  document.getElementById("gt-script")?.remove();
  (window as any).googleTranslateElementInit = undefined;

  const gtLang = GT_LANG[lang] || lang;

  // Set cookie before loading script
  setGoogleTranslateCookie(lang);

  // Define init callback
  (window as any).googleTranslateElementInit = () => {
    new (window as any).google.translate.TranslateElement(
      {
        pageLanguage: "en",
        includedLanguages: Object.values(GT_LANG).join(","),
        layout: (window as any).google?.translate?.TranslateElement?.InlineLayout?.SIMPLE,
        autoDisplay: false,
      },
      "google_translate_element"
    );
    // After init, trigger the language
    setTimeout(() => triggerGoogleTranslate(lang), 500);
  };

  const script = document.createElement("script");
  script.id = "gt-script";
  script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.head.appendChild(script);
}

export async function translatePage(targetLang: string) {
  if (targetLang === currentLang) return;
  currentLang = targetLang;

  if (targetLang === "en") {
    // Restore original language
    setGoogleTranslateCookie("en");
    // Try clicking the "Show original" button in GT bar
    const showOriginal = document.querySelector(".goog-te-menu-value") as HTMLElement | null;
    if (showOriginal) {
      showOriginal.click();
      return;
    }
    // Fallback: reload without cookie
    window.location.reload();
    return;
  }

  // Check if Google Translate is already loaded
  if ((window as any).google?.translate?.TranslateElement) {
    triggerGoogleTranslate(targetLang);
  } else {
    injectGoogleTranslateScript(targetLang);
  }
}
