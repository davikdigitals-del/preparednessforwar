/**
 * Translation is handled by the browser's built-in translation engine.
 * (Chrome, Edge, Safari all auto-offer translation when html[lang] != user's language)
 *
 * We set document.documentElement.lang based on IP detection in LanguageContext.
 * The browser does the rest — no DOM mutation, no React conflicts.
 *
 * This stub exists so existing imports don't break.
 */

export async function translatePage(_targetLang: string): Promise<void> {
  // No-op: browser handles translation natively via html[lang] attribute.
  // Setting document.documentElement.lang in LanguageContext is sufficient.
}
