import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type LangCode = "en" | "fr" | "de" | "es" | "ar" | "uk" | "pl" | "ru" | "zh" | "pt";

export interface Translations {
  // Nav
  countries: string;
  newsletter: string;
  library: string;
  encyclopaedia: string;
  mediaHub: string;
  // Header
  logIn: string;
  signUp: string;
  dashboard: string;
  logout: string;
  // Mobile menu
  quickAccess: string;
  mainNavigation: string;
  account: string;
  communityReports: string;
  courses: string;
  shop: string;
  // Search
  searchPlaceholder: string;
  searchNoResults: string;
  quickLinks: string;
  latestArticles: string;
  // Hero
  featured: string;
  // Banner
  live: string;
  // General
  readMore: string;
  viewAll: string;
  loading: string;
  // Language label
  langLabel: string;
}

const translations: Record<LangCode, Translations> = {
  en: {
    countries: "Countries", newsletter: "Newsletter", library: "Library",
    encyclopaedia: "Encyclopaedia", mediaHub: "Media Hub",
    logIn: "Log In", signUp: "Sign Up", dashboard: "Dashboard", logout: "Logout",
    quickAccess: "Quick Access", mainNavigation: "Main Navigation", account: "Account",
    communityReports: "Community Reports", courses: "Courses", shop: "Shop",
    searchPlaceholder: "Search articles, media, library...", searchNoResults: "No results for",
    quickLinks: "Quick links", latestArticles: "Latest Articles",
    featured: "Featured", live: "LIVE", readMore: "Read more", viewAll: "View all",
    loading: "Loading...", langLabel: "EN",
  },
  fr: {
    countries: "Pays", newsletter: "Newsletter", library: "Bibliothèque",
    encyclopaedia: "Encyclopédie", mediaHub: "Médiathèque",
    logIn: "Connexion", signUp: "S'inscrire", dashboard: "Tableau de bord", logout: "Déconnexion",
    quickAccess: "Accès rapide", mainNavigation: "Navigation principale", account: "Compte",
    communityReports: "Rapports communautaires", courses: "Cours", shop: "Boutique",
    searchPlaceholder: "Rechercher articles, médias, bibliothèque...", searchNoResults: "Aucun résultat pour",
    quickLinks: "Liens rapides", latestArticles: "Derniers articles",
    featured: "À la une", live: "EN DIRECT", readMore: "Lire la suite", viewAll: "Voir tout",
    loading: "Chargement...", langLabel: "FR",
  },
  de: {
    countries: "Länder", newsletter: "Newsletter", library: "Bibliothek",
    encyclopaedia: "Enzyklopädie", mediaHub: "Mediathek",
    logIn: "Anmelden", signUp: "Registrieren", dashboard: "Dashboard", logout: "Abmelden",
    quickAccess: "Schnellzugriff", mainNavigation: "Hauptnavigation", account: "Konto",
    communityReports: "Community-Berichte", courses: "Kurse", shop: "Shop",
    searchPlaceholder: "Artikel, Medien, Bibliothek suchen...", searchNoResults: "Keine Ergebnisse für",
    quickLinks: "Schnelllinks", latestArticles: "Neueste Artikel",
    featured: "Empfohlen", live: "LIVE", readMore: "Weiterlesen", viewAll: "Alle anzeigen",
    loading: "Laden...", langLabel: "DE",
  },
  es: {
    countries: "Países", newsletter: "Boletín", library: "Biblioteca",
    encyclopaedia: "Enciclopedia", mediaHub: "Centro de medios",
    logIn: "Iniciar sesión", signUp: "Registrarse", dashboard: "Panel", logout: "Cerrar sesión",
    quickAccess: "Acceso rápido", mainNavigation: "Navegación principal", account: "Cuenta",
    communityReports: "Informes comunitarios", courses: "Cursos", shop: "Tienda",
    searchPlaceholder: "Buscar artículos, medios, biblioteca...", searchNoResults: "Sin resultados para",
    quickLinks: "Enlaces rápidos", latestArticles: "Últimos artículos",
    featured: "Destacado", live: "EN VIVO", readMore: "Leer más", viewAll: "Ver todo",
    loading: "Cargando...", langLabel: "ES",
  },
  ar: {
    countries: "الدول", newsletter: "النشرة الإخبارية", library: "المكتبة",
    encyclopaedia: "الموسوعة", mediaHub: "مركز الإعلام",
    logIn: "تسجيل الدخول", signUp: "إنشاء حساب", dashboard: "لوحة التحكم", logout: "تسجيل الخروج",
    quickAccess: "وصول سريع", mainNavigation: "التنقل الرئيسي", account: "الحساب",
    communityReports: "تقارير المجتمع", courses: "الدورات", shop: "المتجر",
    searchPlaceholder: "ابحث في المقالات والوسائط والمكتبة...", searchNoResults: "لا نتائج لـ",
    quickLinks: "روابط سريعة", latestArticles: "أحدث المقالات",
    featured: "مميز", live: "مباشر", readMore: "اقرأ المزيد", viewAll: "عرض الكل",
    loading: "جار التحميل...", langLabel: "AR",
  },
  uk: {
    countries: "Країни", newsletter: "Розсилка", library: "Бібліотека",
    encyclopaedia: "Енциклопедія", mediaHub: "Медіацентр",
    logIn: "Увійти", signUp: "Зареєструватися", dashboard: "Панель", logout: "Вийти",
    quickAccess: "Швидкий доступ", mainNavigation: "Головна навігація", account: "Акаунт",
    communityReports: "Звіти спільноти", courses: "Курси", shop: "Магазин",
    searchPlaceholder: "Пошук статей, медіа, бібліотеки...", searchNoResults: "Немає результатів для",
    quickLinks: "Швидкі посилання", latestArticles: "Останні статті",
    featured: "Рекомендовано", live: "НАЖИВО", readMore: "Читати далі", viewAll: "Переглянути все",
    loading: "Завантаження...", langLabel: "UK",
  },
  pl: {
    countries: "Kraje", newsletter: "Newsletter", library: "Biblioteka",
    encyclopaedia: "Encyklopedia", mediaHub: "Centrum mediów",
    logIn: "Zaloguj się", signUp: "Zarejestruj się", dashboard: "Panel", logout: "Wyloguj się",
    quickAccess: "Szybki dostęp", mainNavigation: "Główna nawigacja", account: "Konto",
    communityReports: "Raporty społeczności", courses: "Kursy", shop: "Sklep",
    searchPlaceholder: "Szukaj artykułów, mediów, biblioteki...", searchNoResults: "Brak wyników dla",
    quickLinks: "Szybkie linki", latestArticles: "Najnowsze artykuły",
    featured: "Polecane", live: "NA ŻYWO", readMore: "Czytaj więcej", viewAll: "Zobacz wszystko",
    loading: "Ładowanie...", langLabel: "PL",
  },
  ru: {
    countries: "Страны", newsletter: "Рассылка", library: "Библиотека",
    encyclopaedia: "Энциклопедия", mediaHub: "Медиацентр",
    logIn: "Войти", signUp: "Зарегистрироваться", dashboard: "Панель", logout: "Выйти",
    quickAccess: "Быстрый доступ", mainNavigation: "Главная навигация", account: "Аккаунт",
    communityReports: "Отчёты сообщества", courses: "Курсы", shop: "Магазин",
    searchPlaceholder: "Поиск статей, медиа, библиотеки...", searchNoResults: "Нет результатов для",
    quickLinks: "Быстрые ссылки", latestArticles: "Последние статьи",
    featured: "Рекомендуемое", live: "ПРЯМОЙ ЭФИР", readMore: "Читать далее", viewAll: "Смотреть всё",
    loading: "Загрузка...", langLabel: "RU",
  },
  zh: {
    countries: "国家", newsletter: "新闻通讯", library: "图书馆",
    encyclopaedia: "百科全书", mediaHub: "媒体中心",
    logIn: "登录", signUp: "注册", dashboard: "仪表板", logout: "退出",
    quickAccess: "快速访问", mainNavigation: "主导航", account: "账户",
    communityReports: "社区报告", courses: "课程", shop: "商店",
    searchPlaceholder: "搜索文章、媒体、图书馆...", searchNoResults: "没有结果",
    quickLinks: "快速链接", latestArticles: "最新文章",
    featured: "精选", live: "直播", readMore: "阅读更多", viewAll: "查看全部",
    loading: "加载中...", langLabel: "ZH",
  },
  pt: {
    countries: "Países", newsletter: "Newsletter", library: "Biblioteca",
    encyclopaedia: "Enciclopédia", mediaHub: "Centro de mídia",
    logIn: "Entrar", signUp: "Cadastrar", dashboard: "Painel", logout: "Sair",
    quickAccess: "Acesso rápido", mainNavigation: "Navegação principal", account: "Conta",
    communityReports: "Relatórios da comunidade", courses: "Cursos", shop: "Loja",
    searchPlaceholder: "Pesquisar artigos, mídia, biblioteca...", searchNoResults: "Sem resultados para",
    quickLinks: "Links rápidos", latestArticles: "Últimos artigos",
    featured: "Destaque", live: "AO VIVO", readMore: "Leia mais", viewAll: "Ver tudo",
    loading: "Carregando...", langLabel: "PT",
  },
};

// Map country codes to languages
const countryToLang: Record<string, LangCode> = {
  // French
  FR: "fr", BE: "fr", CH: "fr", LU: "fr", MC: "fr", SN: "fr", CI: "fr",
  CM: "fr", MG: "fr", ML: "fr", BF: "fr", NE: "fr", TD: "fr", GN: "fr",
  BJ: "fr", TG: "fr", RW: "fr", BI: "fr", DJ: "fr", KM: "fr", MU: "fr",
  // German
  DE: "de", AT: "de", LI: "de",
  // Spanish
  ES: "es", MX: "es", AR: "es", CO: "es", PE: "es", VE: "es", CL: "es",
  EC: "es", GT: "es", CU: "es", BO: "es", DO: "es", HN: "es", PY: "es",
  SV: "es", NI: "es", CR: "es", PA: "es", UY: "es",
  // Arabic
  SA: "ar", EG: "ar", AE: "ar", IQ: "ar", SY: "ar", JO: "ar", LB: "ar",
  KW: "ar", QA: "ar", BH: "ar", OM: "ar", YE: "ar", LY: "ar", TN: "ar",
  DZ: "ar", MA: "ar", SD: "ar", SO: "ar",
  // Ukrainian
  UA: "uk",
  // Polish
  PL: "pl",
  // Russian
  RU: "ru", BY: "ru", KZ: "ru", KG: "ru",
  // Chinese
  CN: "zh", TW: "zh", HK: "zh", SG: "zh",
  // Portuguese
  PT: "pt", BR: "pt", AO: "pt", MZ: "pt", CV: "pt", GW: "pt", ST: "pt",
};

function getSavedLang(): LangCode | null {
  try {
    const saved = localStorage.getItem("prw-lang") as LangCode | null;
    if (saved && translations[saved]) return saved;
  } catch {}
  return null;
}

async function detectLangByIP(): Promise<LangCode> {
  try {
    // Use free IP geolocation API — no key needed
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error("geo failed");
    const data = await res.json();
    const countryCode = data.country_code as string;
    return countryToLang[countryCode] || "en";
  } catch {
    // Fallback to browser language
    const browserLang = navigator.language?.toLowerCase() || "en";
    if (browserLang.startsWith("fr")) return "fr";
    if (browserLang.startsWith("de")) return "de";
    if (browserLang.startsWith("es")) return "es";
    if (browserLang.startsWith("ar")) return "ar";
    if (browserLang.startsWith("uk")) return "uk";
    if (browserLang.startsWith("pl")) return "pl";
    if (browserLang.startsWith("ru")) return "ru";
    if (browserLang.startsWith("zh")) return "zh";
    if (browserLang.startsWith("pt")) return "pt";
    return "en";
  }
}interface LanguageContextType {
  lang: LangCode;
  t: Translations;
  setLang: (lang: LangCode) => void;
  availableLangs: { code: LangCode; label: string; flag: string }[];
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const availableLangs: { code: LangCode; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "uk", label: "Українська", flag: "🇺🇦" },
  { code: "pl", label: "Polski", flag: "🇵🇱" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(getSavedLang() || "en");

  useEffect(() => {
    // If user has a saved preference, use it — don't override
    if (getSavedLang()) return;

    // Otherwise detect by IP country
    detectLangByIP().then((detected) => {
      setLangState(detected);
      document.documentElement.dir = detected === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = detected;
    });
  }, []);

  const setLang = (newLang: LangCode) => {
    setLangState(newLang);
    localStorage.setItem("prw-lang", newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLang, availableLangs }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be inside LanguageProvider");
  return ctx;
}
