import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translatePage, hideGoogleTranslateBar } from "@/hooks/useAutoTranslate";

// All NATO member country languages (32 members as of 2024)
export type LangCode =
  | "en"   // UK, USA, Canada, Australia, NZ
  | "fr"   // France, Belgium, Luxembourg, Canada
  | "de"   // Germany
  | "es"   // Spain
  | "it"   // Italy
  | "nl"   // Netherlands, Belgium
  | "pl"   // Poland
  | "tr"   // Turkey
  | "pt"   // Portugal
  | "ro"   // Romania
  | "cs"   // Czech Republic
  | "hu"   // Hungary
  | "el"   // Greece
  | "bg"   // Bulgaria
  | "hr"   // Croatia
  | "sk"   // Slovakia
  | "sl"   // Slovenia
  | "et"   // Estonia
  | "lv"   // Latvia
  | "lt"   // Lithuania
  | "da"   // Denmark
  | "no"   // Norway
  | "sv"   // Sweden (joined 2024)
  | "fi"   // Finland (joined 2023)
  | "is"   // Iceland
  | "sq"   // Albania
  | "mk"   // North Macedonia
  | "me"   // Montenegro
  | "uk"   // Ukraine (partner)
  | "ar"   // Arabic (Middle East partners)
  | "zh"   // Chinese
  | "ru";  // Russian

export interface Translations {
  countries: string; newsletter: string; library: string;
  encyclopaedia: string; mediaHub: string;
  logIn: string; signUp: string; dashboard: string; logout: string;
  quickAccess: string; mainNavigation: string; account: string;
  communityReports: string; courses: string; shop: string;
  searchPlaceholder: string; searchNoResults: string;
  quickLinks: string; latestArticles: string;
  featured: string; live: string; readMore: string; viewAll: string;
  loading: string; langLabel: string;
}

const T = (
  countries: string, newsletter: string, library: string, encyclopaedia: string, mediaHub: string,
  logIn: string, signUp: string, dashboard: string, logout: string,
  quickAccess: string, mainNavigation: string, account: string,
  communityReports: string, courses: string, shop: string,
  searchPlaceholder: string, searchNoResults: string,
  quickLinks: string, latestArticles: string,
  featured: string, live: string, readMore: string, viewAll: string,
  loading: string, langLabel: string
): Translations => ({
  countries, newsletter, library, encyclopaedia, mediaHub,
  logIn, signUp, dashboard, logout,
  quickAccess, mainNavigation, account,
  communityReports, courses, shop,
  searchPlaceholder, searchNoResults,
  quickLinks, latestArticles,
  featured, live, readMore, viewAll,
  loading, langLabel,
});

const translations: Record<LangCode, Translations> = {
  en: T("Countries","Newsletter","Library","Encyclopaedia","Media Hub","Log In","Sign Up","Dashboard","Logout","Quick Access","Main Navigation","Account","Community Reports","Courses","Shop","Search articles, media, library...","No results for","Quick links","Latest Articles","Featured","LIVE","Read more","View all","Loading...","EN"),
  fr: T("Pays","Newsletter","Bibliothèque","Encyclopédie","Médiathèque","Connexion","S'inscrire","Tableau de bord","Déconnexion","Accès rapide","Navigation principale","Compte","Rapports communautaires","Cours","Boutique","Rechercher articles, médias...","Aucun résultat pour","Liens rapides","Derniers articles","À la une","EN DIRECT","Lire la suite","Voir tout","Chargement...","FR"),
  de: T("Länder","Newsletter","Bibliothek","Enzyklopädie","Mediathek","Anmelden","Registrieren","Dashboard","Abmelden","Schnellzugriff","Hauptnavigation","Konto","Community-Berichte","Kurse","Shop","Artikel, Medien suchen...","Keine Ergebnisse für","Schnelllinks","Neueste Artikel","Empfohlen","LIVE","Weiterlesen","Alle anzeigen","Laden...","DE"),
  es: T("Países","Boletín","Biblioteca","Enciclopedia","Centro de medios","Iniciar sesión","Registrarse","Panel","Cerrar sesión","Acceso rápido","Navegación principal","Cuenta","Informes comunitarios","Cursos","Tienda","Buscar artículos, medios...","Sin resultados para","Enlaces rápidos","Últimos artículos","Destacado","EN VIVO","Leer más","Ver todo","Cargando...","ES"),
  it: T("Paesi","Newsletter","Biblioteca","Enciclopedia","Media Hub","Accedi","Registrati","Dashboard","Esci","Accesso rapido","Navigazione principale","Account","Rapporti della comunità","Corsi","Negozio","Cerca articoli, media...","Nessun risultato per","Link rapidi","Ultimi articoli","In evidenza","IN DIRETTA","Leggi di più","Vedi tutto","Caricamento...","IT"),
  nl: T("Landen","Nieuwsbrief","Bibliotheek","Encyclopedie","Mediahub","Inloggen","Registreren","Dashboard","Uitloggen","Snelle toegang","Hoofdnavigatie","Account","Gemeenschapsrapporten","Cursussen","Winkel","Zoek artikelen, media...","Geen resultaten voor","Snelle links","Laatste artikelen","Uitgelicht","LIVE","Lees meer","Alles bekijken","Laden...","NL"),
  pl: T("Kraje","Newsletter","Biblioteka","Encyklopedia","Centrum mediów","Zaloguj się","Zarejestruj się","Panel","Wyloguj się","Szybki dostęp","Główna nawigacja","Konto","Raporty społeczności","Kursy","Sklep","Szukaj artykułów, mediów...","Brak wyników dla","Szybkie linki","Najnowsze artykuły","Polecane","NA ŻYWO","Czytaj więcej","Zobacz wszystko","Ładowanie...","PL"),
  tr: T("Ülkeler","Bülten","Kütüphane","Ansiklopedi","Medya Merkezi","Giriş Yap","Kayıt Ol","Gösterge Paneli","Çıkış Yap","Hızlı Erişim","Ana Navigasyon","Hesap","Topluluk Raporları","Kurslar","Mağaza","Makale, medya ara...","Sonuç bulunamadı","Hızlı bağlantılar","Son Makaleler","Öne Çıkan","CANLI","Devamını oku","Tümünü gör","Yükleniyor...","TR"),
  pt: T("Países","Newsletter","Biblioteca","Enciclopédia","Centro de mídia","Entrar","Cadastrar","Painel","Sair","Acesso rápido","Navegação principal","Conta","Relatórios da comunidade","Cursos","Loja","Pesquisar artigos, mídia...","Sem resultados para","Links rápidos","Últimos artigos","Destaque","AO VIVO","Leia mais","Ver tudo","Carregando...","PT"),
  ro: T("Țări","Buletin informativ","Bibliotecă","Enciclopedie","Hub media","Autentificare","Înregistrare","Panou de control","Deconectare","Acces rapid","Navigare principală","Cont","Rapoarte comunitate","Cursuri","Magazin","Caută articole, media...","Niciun rezultat pentru","Linkuri rapide","Ultimele articole","Recomandat","LIVE","Citește mai mult","Vezi tot","Se încarcă...","RO"),
  cs: T("Země","Newsletter","Knihovna","Encyklopedie","Mediální centrum","Přihlásit se","Registrovat se","Přehled","Odhlásit se","Rychlý přístup","Hlavní navigace","Účet","Komunitní zprávy","Kurzy","Obchod","Hledat články, média...","Žádné výsledky pro","Rychlé odkazy","Nejnovější články","Doporučené","ŽIVĚ","Číst více","Zobrazit vše","Načítání...","CS"),
  hu: T("Országok","Hírlevél","Könyvtár","Enciklopédia","Médiaközpont","Bejelentkezés","Regisztráció","Irányítópult","Kijelentkezés","Gyors hozzáférés","Főnavigáció","Fiók","Közösségi jelentések","Tanfolyamok","Bolt","Cikkek, média keresése...","Nincs találat","Gyors linkek","Legújabb cikkek","Kiemelt","ÉLŐ","Tovább olvasom","Összes megtekintése","Betöltés...","HU"),
  el: T("Χώρες","Ενημερωτικό δελτίο","Βιβλιοθήκη","Εγκυκλοπαίδεια","Κέντρο Μέσων","Σύνδεση","Εγγραφή","Πίνακας ελέγχου","Αποσύνδεση","Γρήγορη πρόσβαση","Κύρια πλοήγηση","Λογαριασμός","Αναφορές κοινότητας","Μαθήματα","Κατάστημα","Αναζήτηση άρθρων...","Δεν βρέθηκαν αποτελέσματα","Γρήγοροι σύνδεσμοι","Τελευταία άρθρα","Προτεινόμενο","ΖΩΝΤΑΝΑ","Διαβάστε περισσότερα","Προβολή όλων","Φόρτωση...","EL"),
  bg: T("Държави","Бюлетин","Библиотека","Енциклопедия","Медиен хъб","Вход","Регистрация","Табло","Изход","Бърз достъп","Основна навигация","Акаунт","Доклади на общността","Курсове","Магазин","Търсене на статии...","Няма резултати за","Бързи връзки","Последни статии","Препоръчано","НА ЖИВО","Прочетете повече","Виж всички","Зареждане...","BG"),
  hr: T("Zemlje","Bilten","Knjižnica","Enciklopedija","Medijski centar","Prijava","Registracija","Nadzorna ploča","Odjava","Brzi pristup","Glavna navigacija","Račun","Izvješća zajednice","Tečajevi","Trgovina","Pretraži članke...","Nema rezultata za","Brze veze","Najnoviji članci","Istaknuto","UŽIVO","Pročitaj više","Pogledaj sve","Učitavanje...","HR"),
  sk: T("Krajiny","Newsletter","Knižnica","Encyklopédia","Mediálne centrum","Prihlásiť sa","Registrovať sa","Prehľad","Odhlásiť sa","Rýchly prístup","Hlavná navigácia","Účet","Správy komunity","Kurzy","Obchod","Hľadať články...","Žiadne výsledky pre","Rýchle odkazy","Najnovšie články","Odporúčané","NAŽIVO","Čítať viac","Zobraziť všetko","Načítavanie...","SK"),
  sl: T("Države","Glasilo","Knjižnica","Enciklopedija","Medijsko središče","Prijava","Registracija","Nadzorna plošča","Odjava","Hiter dostop","Glavna navigacija","Račun","Poročila skupnosti","Tečaji","Trgovina","Iskanje člankov...","Ni rezultatov za","Hitre povezave","Najnovejši članki","Izpostavljeno","V ŽIVO","Preberi več","Poglej vse","Nalaganje...","SL"),
  et: T("Riigid","Uudiskiri","Raamatukogu","Entsüklopeedia","Meediakeskus","Logi sisse","Registreeru","Armatuurlaud","Logi välja","Kiirjuurdepääs","Peamine navigatsioon","Konto","Kogukonna aruanded","Kursused","Pood","Otsi artikleid...","Tulemusi ei leitud","Kiirlingid","Viimased artiklid","Esiletõstetud","OTSE","Loe rohkem","Vaata kõiki","Laadimine...","ET"),
  lv: T("Valstis","Biļetens","Bibliotēka","Enciklopēdija","Mediju centrs","Pieteikties","Reģistrēties","Vadības panelis","Izrakstīties","Ātrā piekļuve","Galvenā navigācija","Konts","Kopienas ziņojumi","Kursi","Veikals","Meklēt rakstus...","Nav rezultātu","Ātrās saites","Jaunākie raksti","Izceltais","TIEŠRAIDE","Lasīt vairāk","Skatīt visu","Ielādē...","LV"),
  lt: T("Šalys","Naujienlaiškis","Biblioteka","Enciklopedija","Medijų centras","Prisijungti","Registruotis","Valdymo skydelis","Atsijungti","Greita prieiga","Pagrindinė navigacija","Paskyra","Bendruomenės ataskaitos","Kursai","Parduotuvė","Ieškoti straipsnių...","Rezultatų nerasta","Greitos nuorodos","Naujausi straipsniai","Rekomenduojama","TIESIOGIAI","Skaityti daugiau","Žiūrėti viską","Kraunama...","LT"),
  da: T("Lande","Nyhedsbrev","Bibliotek","Encyklopædi","Mediehub","Log ind","Tilmeld dig","Dashboard","Log ud","Hurtig adgang","Hovednavigation","Konto","Fællesskabsrapporter","Kurser","Butik","Søg artikler, medier...","Ingen resultater for","Hurtige links","Seneste artikler","Fremhævet","LIVE","Læs mere","Se alle","Indlæser...","DA"),
  no: T("Land","Nyhetsbrev","Bibliotek","Leksikon","Mediehub","Logg inn","Registrer deg","Dashbord","Logg ut","Hurtigtilgang","Hovednavigasjon","Konto","Fellesskapsrapporter","Kurs","Butikk","Søk artikler, medier...","Ingen resultater for","Hurtiglenker","Siste artikler","Fremhevet","DIREKTE","Les mer","Se alle","Laster...","NO"),
  sv: T("Länder","Nyhetsbrev","Bibliotek","Encyklopedi","Mediehub","Logga in","Registrera dig","Instrumentpanel","Logga ut","Snabbåtkomst","Huvudnavigation","Konto","Gemenskapsrapporter","Kurser","Butik","Sök artiklar, media...","Inga resultat för","Snabblänkar","Senaste artiklarna","Utvald","LIVE","Läs mer","Visa alla","Laddar...","SV"),
  fi: T("Maat","Uutiskirje","Kirjasto","Tietosanakirja","Mediakeskus","Kirjaudu sisään","Rekisteröidy","Kojelauta","Kirjaudu ulos","Pikakäyttö","Päänavigaatio","Tili","Yhteisöraportit","Kurssit","Kauppa","Hae artikkeleita...","Ei tuloksia haulle","Pikalinkit","Uusimmat artikkelit","Suositeltu","SUORANA","Lue lisää","Näytä kaikki","Ladataan...","FI"),
  is: T("Lönd","Fréttabréf","Bókasafn","Alfræðiorðabók","Miðlaver","Skrá inn","Nýskrá","Mælaborð","Skrá út","Skjótur aðgangur","Aðalvalmynd","Reikningur","Samfélagsskýrslur","Námskeið","Verslun","Leita að greinum...","Engar niðurstöður","Flýtitenglar","Nýjustu greinar","Valið","BEINT","Lesa meira","Sjá allt","Hleður...","IS"),
  sq: T("Vendet","Buletini","Biblioteka","Enciklopedia","Qendra e Medias","Hyr","Regjistrohu","Paneli","Dil","Qasje e shpejtë","Navigimi kryesor","Llogaria","Raportet e komunitetit","Kurse","Dyqan","Kërko artikuj...","Nuk ka rezultate","Lidhje të shpejta","Artikujt e fundit","I veçuar","DREJTPËRDREJT","Lexo më shumë","Shiko të gjitha","Duke ngarkuar...","SQ"),
  mk: T("Земји","Билтен","Библиотека","Енциклопедија","Медиски центар","Најави се","Регистрирај се","Контролна табла","Одјави се","Брз пристап","Главна навигација","Сметка","Извештаи на заедницата","Курсеви","Продавница","Пребарај статии...","Нема резултати","Брзи врски","Најнови статии","Истакнато","ЖИВО","Прочитај повеќе","Погледај сè","Вчитување...","MK"),
  me: T("Države","Bilten","Biblioteka","Enciklopedija","Medijski centar","Prijava","Registracija","Kontrolna tabla","Odjava","Brzi pristup","Glavna navigacija","Nalog","Izvještaji zajednice","Kursevi","Prodavnica","Pretraži članke...","Nema rezultata","Brze veze","Najnoviji članci","Istaknuto","UŽIVO","Pročitaj više","Pogledaj sve","Učitavanje...","ME"),
  uk: T("Країни","Розсилка","Бібліотека","Енциклопедія","Медіацентр","Увійти","Зареєструватися","Панель","Вийти","Швидкий доступ","Головна навігація","Акаунт","Звіти спільноти","Курси","Магазин","Пошук статей, медіа...","Немає результатів для","Швидкі посилання","Останні статті","Рекомендовано","НАЖИВО","Читати далі","Переглянути все","Завантаження...","UK"),
  ar: T("الدول","النشرة الإخبارية","المكتبة","الموسوعة","مركز الإعلام","تسجيل الدخول","إنشاء حساب","لوحة التحكم","تسجيل الخروج","وصول سريع","التنقل الرئيسي","الحساب","تقارير المجتمع","الدورات","المتجر","ابحث في المقالات...","لا نتائج لـ","روابط سريعة","أحدث المقالات","مميز","مباشر","اقرأ المزيد","عرض الكل","جار التحميل...","AR"),
  zh: T("国家","新闻通讯","图书馆","百科全书","媒体中心","登录","注册","仪表板","退出","快速访问","主导航","账户","社区报告","课程","商店","搜索文章、媒体...","没有结果","快速链接","最新文章","精选","直播","阅读更多","查看全部","加载中...","ZH"),
  ru: T("Страны","Рассылка","Библиотека","Энциклопедия","Медиацентр","Войти","Зарегистрироваться","Панель","Выйти","Быстрый доступ","Главная навигация","Аккаунт","Отчёты сообщества","Курсы","Магазин","Поиск статей, медиа...","Нет результатов для","Быстрые ссылки","Последние статьи","Рекомендуемое","ПРЯМОЙ ЭФИР","Читать далее","Смотреть всё","Загрузка...","RU"),
};

// Country code → language mapping (comprehensive)
const countryToLang: Record<string, LangCode> = {
  // English
  US:"en", GB:"en", CA:"en", AU:"en", NZ:"en", IE:"en", ZA:"en",
  // French
  FR:"fr", BE:"fr", LU:"fr", MC:"fr", SN:"fr", CI:"fr", CM:"fr",
  MG:"fr", ML:"fr", BF:"fr", NE:"fr", TD:"fr", GN:"fr", BJ:"fr",
  TG:"fr", RW:"fr", BI:"fr", DJ:"fr", KM:"fr", MU:"fr", CH:"fr",
  // German
  DE:"de", AT:"de", LI:"de",
  // Spanish
  ES:"es", MX:"es", CO:"es", PE:"es", VE:"es", CL:"es", EC:"es",
  GT:"es", CU:"es", BO:"es", DO:"es", HN:"es", PY:"es", SV:"es",
  NI:"es", CR:"es", PA:"es", UY:"es",
  // Italian
  IT:"it", SM:"it", VA:"it",
  // Dutch
  NL:"nl",
  // Polish
  PL:"pl",
  // Turkish
  TR:"tr",
  // Portuguese
  PT:"pt", BR:"pt", AO:"pt", MZ:"pt", CV:"pt", GW:"pt", ST:"pt",
  // Romanian
  RO:"ro", MD:"ro",
  // Czech
  CZ:"cs",
  // Hungarian
  HU:"hu",
  // Greek
  GR:"el", CY:"el",
  // Bulgarian
  BG:"bg",
  // Croatian
  HR:"hr",
  // Slovak
  SK:"sk",
  // Slovenian
  SI:"sl",
  // Estonian
  EE:"et",
  // Latvian
  LV:"lv",
  // Lithuanian
  LT:"lt",
  // Danish
  DK:"da",
  // Norwegian
  NO:"no",
  // Swedish
  SE:"sv",
  // Finnish
  FI:"fi",
  // Icelandic
  IS:"is",
  // Albanian
  AL:"sq", XK:"sq",
  // Macedonian
  MK:"mk",
  // Montenegrin
  ME:"me",
  // Ukrainian
  UA:"uk",
  // Arabic
  SA:"ar", EG:"ar", AE:"ar", IQ:"ar", SY:"ar", JO:"ar", LB:"ar",
  KW:"ar", QA:"ar", BH:"ar", OM:"ar", YE:"ar", LY:"ar", TN:"ar",
  DZ:"ar", MA:"ar", SD:"ar", SO:"ar",
  // Chinese
  CN:"zh", TW:"zh", HK:"zh", SG:"zh",
  // Russian
  RU:"ru", BY:"ru", KZ:"ru", KG:"ru",
};

export const availableLangs: { code: LangCode; label: string; flag: string; region: string }[] = [
  // Core NATO / English-speaking
  { code: "en", label: "English",       flag: "🇬🇧", region: "NATO" },
  // Western Europe
  { code: "fr", label: "Français",      flag: "🇫🇷", region: "NATO" },
  { code: "de", label: "Deutsch",       flag: "🇩🇪", region: "NATO" },
  { code: "es", label: "Español",       flag: "🇪🇸", region: "NATO" },
  { code: "it", label: "Italiano",      flag: "🇮🇹", region: "NATO" },
  { code: "nl", label: "Nederlands",    flag: "🇳🇱", region: "NATO" },
  { code: "pt", label: "Português",     flag: "🇵🇹", region: "NATO" },
  // Nordic
  { code: "da", label: "Dansk",         flag: "🇩🇰", region: "NATO" },
  { code: "no", label: "Norsk",         flag: "🇳🇴", region: "NATO" },
  { code: "sv", label: "Svenska",       flag: "🇸🇪", region: "NATO" },
  { code: "fi", label: "Suomi",         flag: "🇫🇮", region: "NATO" },
  { code: "is", label: "Íslenska",      flag: "🇮🇸", region: "NATO" },
  // Eastern Europe
  { code: "pl", label: "Polski",        flag: "🇵🇱", region: "NATO" },
  { code: "cs", label: "Čeština",       flag: "🇨🇿", region: "NATO" },
  { code: "sk", label: "Slovenčina",    flag: "🇸🇰", region: "NATO" },
  { code: "hu", label: "Magyar",        flag: "🇭🇺", region: "NATO" },
  { code: "ro", label: "Română",        flag: "🇷🇴", region: "NATO" },
  { code: "bg", label: "Български",     flag: "🇧🇬", region: "NATO" },
  { code: "hr", label: "Hrvatski",      flag: "🇭🇷", region: "NATO" },
  { code: "sl", label: "Slovenščina",   flag: "🇸🇮", region: "NATO" },
  { code: "sk", label: "Slovenčina",    flag: "🇸🇰", region: "NATO" },
  // Baltic
  { code: "et", label: "Eesti",         flag: "🇪🇪", region: "NATO" },
  { code: "lv", label: "Latviešu",      flag: "🇱🇻", region: "NATO" },
  { code: "lt", label: "Lietuvių",      flag: "🇱🇹", region: "NATO" },
  // South-East Europe
  { code: "el", label: "Ελληνικά",      flag: "🇬🇷", region: "NATO" },
  { code: "tr", label: "Türkçe",        flag: "🇹🇷", region: "NATO" },
  { code: "sq", label: "Shqip",         flag: "🇦🇱", region: "NATO" },
  { code: "mk", label: "Македонски",    flag: "🇲🇰", region: "NATO" },
  { code: "me", label: "Crnogorski",    flag: "🇲🇪", region: "NATO" },
  // Partners / Global
  { code: "uk", label: "Українська",    flag: "🇺🇦", region: "Partner" },
  { code: "ar", label: "العربية",       flag: "🇸🇦", region: "Global" },
  { code: "zh", label: "中文",           flag: "🇨🇳", region: "Global" },
  { code: "ru", label: "Русский",       flag: "🇷🇺", region: "Global" },
];

// Deduplicate (sk appeared twice above)
const seen = new Set<string>();
const uniqueLangs = availableLangs.filter(l => {
  if (seen.has(l.code)) return false;
  seen.add(l.code);
  return true;
});
// Re-export deduplicated
(availableLangs as any).length = 0;
uniqueLangs.forEach(l => (availableLangs as any).push(l));

function getSavedLang(): LangCode | null {
  try {
    const saved = localStorage.getItem("prw-lang") as LangCode | null;
    if (saved && translations[saved]) return saved;
  } catch {}
  return null;
}

async function detectLangByIP(): Promise<LangCode> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error("geo failed");
    const data = await res.json();
    const detected = countryToLang[data.country_code as string] || "en";
    localStorage.setItem("prw-lang", detected);
    return detected;
  } catch {
    const b = navigator.language?.toLowerCase() || "en";
    const map: Record<string, LangCode> = {
      fr:"fr", de:"de", es:"es", it:"it", nl:"nl", pl:"pl", tr:"tr",
      pt:"pt", ro:"ro", cs:"cs", hu:"hu", el:"el", bg:"bg", hr:"hr",
      sk:"sk", sl:"sl", et:"et", lv:"lv", lt:"lt", da:"da", no:"no",
      sv:"sv", fi:"fi", is:"is", sq:"sq", mk:"mk", uk:"uk", ar:"ar",
      zh:"zh", ru:"ru",
    };
    for (const [prefix, code] of Object.entries(map)) {
      if (b.startsWith(prefix)) return code;
    }
    return "en";
  }
}

interface LanguageContextType {
  lang: LangCode;
  t: Translations;
  setLang: (lang: LangCode) => void;
  availableLangs: typeof availableLangs;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(getSavedLang() || "en");

  useEffect(() => {
    // Hide Google Translate toolbar immediately
    hideGoogleTranslateBar();

    detectLangByIP().then((detected) => {
      setLangState(detected);
      document.documentElement.lang = detected;
      document.documentElement.dir = detected === "ar" ? "rtl" : "ltr";
      if (detected !== "en") {
        // Small delay to let React render first
        setTimeout(() => translatePage(detected), 500);
      }
    });
  }, []);

  const setLang = (newLang: LangCode) => {
    setLangState(newLang);
    localStorage.setItem("prw-lang", newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
    translatePage(newLang);
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
