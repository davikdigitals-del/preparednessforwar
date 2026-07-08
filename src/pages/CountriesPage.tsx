import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Globe, Search, Download, ChevronRight, AlertTriangle,
  Shield, Activity, HelpCircle, Phone, Flag, FileText,
  ArrowRight, Circle,
} from "lucide-react";
import { natoCountries, formatTimeAgo } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { InteractiveWorldMap } from "@/components/InteractiveWorldMap";
import { publicSupabase } from "@/integrations/supabase/publicClient";

/* ── Risk level assignment (static demo data) ── */
const RISK_MAP: Record<string, "low" | "moderate" | "high" | "extreme"> = {
  US: "low", CA: "low", GB: "low", FR: "low", DE: "low",
  IT: "low", ES: "low", PT: "low", NL: "low", BE: "low",
  DK: "low", NO: "low", SE: "low", FI: "low", IS: "low",
  LU: "low", SI: "low",
  PL: "moderate", CZ: "moderate", SK: "moderate", HR: "moderate",
  RO: "moderate", BG: "moderate", GR: "moderate", AL: "moderate",
  ME: "moderate", MK: "moderate",
  LT: "high", LV: "high", EE: "high",
  TR: "high",
};

const RISK_CONFIG = {
  low:      { label: "Low Risk",      color: "bg-green-500",  text: "text-green-600",  border: "border-green-200",  badge: "bg-green-100 text-green-700" },
  moderate: { label: "Moderate Risk", color: "bg-yellow-500", text: "text-yellow-600", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-700" },
  high:     { label: "High Risk",     color: "bg-orange-500", text: "text-orange-600", border: "border-orange-200", badge: "bg-orange-100 text-orange-700" },
  extreme:  { label: "Extreme Risk",  color: "bg-red-600",    text: "text-red-600",    border: "border-red-200",    badge: "bg-red-100 text-red-700" },
};

// Get unique continents from country data
const CONTINENTS = Array.from(new Set(natoCountries.map(c => c.continent))).sort();

const CONTINENT_ICONS: Record<string, string> = {
  "Africa": "🌍",
  "Asia": "🌏",
  "Europe": "🌍",
  "North America": "🌎",
  "South America": "🌎",
  "Oceania": "🌏",
};

const getRisk = (code: string) => RISK_MAP[code] || "low";

const CountriesPage = () => {
  const { user, loading } = useAuth();
  const { publishedPosts } = useData();
  const [search, setSearch] = useState("");
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dbSpotlight, setDbSpotlight] = useState<any>(null);

  // Fetch spotlight country from Supabase
  useEffect(() => {
    publicSupabase
      .from("countries")
      .select("code, name, flag, risk_level, description")
      .eq("is_spotlight", true)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setDbSpotlight(data);
      });
  }, []);

  if (loading) return <div className="container py-8 text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  /* ── Derived data ── */
  const getPostCount = (code: string) =>
    publishedPosts.filter((p: any) => {
      const pc = p.countryCodes || [];
      // Only count posts specifically tagged with this country
      return pc.includes(code);
    }).length;

  const riskCounts = {
    low:      natoCountries.filter(c => getRisk(c.code) === "low").length,
    moderate: natoCountries.filter(c => getRisk(c.code) === "moderate").length,
    high:     natoCountries.filter(c => getRisk(c.code) === "high").length,
    extreme:  natoCountries.filter(c => getRisk(c.code) === "extreme").length,
  };

  // Country spotlight — use DB value if set, otherwise fall back to first high/extreme risk country
  const spotlightCode = dbSpotlight?.code || natoCountries.find(c => getRisk(c.code) === "high")?.code || natoCountries[0].code;
  const spotlightCountry = natoCountries.find(c => c.code === spotlightCode) || natoCountries[0];
  const spotlight = dbSpotlight
    ? { ...spotlightCountry, ...dbSpotlight }
    : spotlightCountry;
  const spotlightRisk = (dbSpotlight?.risk_level as keyof typeof RISK_CONFIG) || getRisk(spotlight.code);

  // Recent posts as "updates"
  const recentUpdates = publishedPosts
    .slice()
    .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3);

  // Filtered countries
  const continentCountries = selectedContinent
    ? natoCountries.filter(c => c.continent === selectedContinent)
    : null;

  const filtered = natoCountries.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchContinent = continentCountries ? continentCountries.includes(c) : true;
    return matchSearch && matchContinent;
  });

  /* ── Fullscreen map ── */
  if (mapFullscreen) {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <button
          onClick={() => setMapFullscreen(false)}
          className="absolute top-4 right-4 z-30 px-4 py-2 bg-white border border-gray-200 shadow-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          ✕ Exit Map
        </button>
        <InteractiveWorldMap height="100vh" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ── Top breadcrumb ── */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="container mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-blue-900 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-900 font-semibold">Countries</span>
          </div>
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="container mx-auto">
        <div className="flex gap-0 min-h-[calc(100vh-120px)] relative">

          {/* Mobile sidebar backdrop */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* ══════════════════════════════════════════
              LEFT SIDEBAR - Mobile Responsive
          ══════════════════════════════════════════ */}
          <aside className={`
            fixed lg:static inset-0 z-50 lg:z-auto
            w-64 shrink-0 bg-white border-r border-gray-200 py-6 px-4 gap-6
            transform transition-transform duration-300 lg:transform-none
            ${sidebarOpen ? 'translate-x-0 flex flex-col' : '-translate-x-full lg:translate-x-0 hidden lg:flex lg:flex-col'}
          `}>
            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute top-4 right-4 p-2 hover:bg-gray-100 rounded transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Title */}
            <div>
              <h1 className="font-display font-black text-2xl text-gray-900 uppercase tracking-wide mb-1">
                COUNTRIES
              </h1>
              <p className="text-xs text-gray-500 leading-relaxed">
                Country information, risk levels, and travel advisories.
              </p>
            </div>

            {/* Risk Levels Legend */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                RISK LEVELS
              </p>
              <div className="space-y-2">
                {(Object.entries(RISK_CONFIG) as [keyof typeof RISK_CONFIG, typeof RISK_CONFIG[keyof typeof RISK_CONFIG]][]).map(([key, cfg]) => (
                  <div key={key} className="flex items-center gap-2.5">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${cfg.color}`} />
                    <span className="text-sm text-gray-700">{cfg.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search country..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 transition"
              />
            </div>

            {/* Browse by Continent */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                BROWSE BY CONTINENT
              </p>
              <div className="space-y-0.5">
                {CONTINENTS.map(continent => {
                  const count = natoCountries.filter(c => c.continent === continent).length;
                  return (
                    <button
                      key={continent}
                      onClick={() => {
                        setSelectedContinent(selectedContinent === continent ? null : continent);
                        setSidebarOpen(false); // Close sidebar on mobile after selection
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors rounded ${
                        selectedContinent === continent
                          ? "bg-blue-900 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{CONTINENT_ICONS[continent] || "🌍"}</span>
                        <span className="font-medium">{continent}</span>
                      </span>
                      <span className="text-xs opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Download */}
            <div className="mt-auto border border-gray-200 p-3 bg-gray-50">
              <div className="flex items-start gap-2 mb-2">
                <Download className="w-4 h-4 text-blue-900 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Download Country List</p>
                  <p className="text-xs text-gray-500">Get the full list of countries and risk data offline.</p>
                </div>
              </div>
              <button className="w-full text-xs font-semibold text-blue-900 border border-blue-900 px-3 py-1.5 hover:bg-blue-900 hover:text-white transition-colors">
                Download PDF
              </button>
            </div>
          </aside>

          {/* ══════════════════════════════════════════
              MAIN CONTENT
          ══════════════════════════════════════════ */}
          <div className="flex-1 flex flex-col min-w-0 w-full lg:w-auto">

            {/* ── Interactive Map ── */}
            <div className="relative bg-blue-50 border-b border-gray-200 h-[300px] sm:h-[350px] md:h-[420px]">
              {/* Map toggle tabs */}
              <div className="absolute top-3 left-3 z-20 flex gap-1">
                <button className="px-3 py-1 text-xs font-bold bg-white border border-gray-300 shadow-sm text-gray-900">
                  Map
                </button>
                <button
                  onClick={() => setMapFullscreen(true)}
                  className="px-3 py-1 text-xs font-bold bg-white/80 border border-gray-200 text-gray-600 hover:bg-white transition-colors"
                >
                  Fullscreen
                </button>
              </div>

              {/* Fullscreen icon */}
              <button
                onClick={() => setMapFullscreen(true)}
                className="absolute top-3 right-3 z-20 w-8 h-8 bg-white border border-gray-200 shadow flex items-center justify-center hover:bg-gray-50 transition-colors"
                title="Fullscreen map"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>

              {/* Map */}
              <div className="absolute inset-0">
                <InteractiveWorldMap height="100%" />
              </div>
            </div>

            {/* ── Bottom panels ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 border-t border-gray-200 bg-white divide-y md:divide-y-0 md:divide-x divide-gray-200">

              {/* Country Spotlight */}
              <div className="p-4 sm:p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                  COUNTRY SPOTLIGHT
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{spotlight.flag}</span>
                  <span className="font-bold text-gray-900 text-base">{spotlight.name}</span>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded mb-3 ${RISK_CONFIG[spotlightRisk].badge}`}>
                  <Circle className="w-2 h-2 fill-current" />
                  {RISK_CONFIG[spotlightRisk].label}
                </span>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                  {dbSpotlight?.description || "Active security concerns and preparedness guidance available for this region."}
                </p>
                <Link
                  to={`/countries/${spotlight.code.toLowerCase()}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 px-3 py-1.5 transition-colors"
                >
                  View Full Report <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Recent Updates */}
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    RECENT UPDATES
                  </p>
                  <Link to="/latest" className="text-[10px] font-bold text-blue-900 hover:underline uppercase tracking-wide">
                    View All
                  </Link>
                </div>
                {recentUpdates.length > 0 ? (
                  <div className="space-y-3">
                    {recentUpdates.map((post: any) => (
                      <Link
                        key={post.id}
                        to={`/${post.section}/${post.category}/${post.id}`}
                        className="flex gap-2.5 group"
                      >
                        {post.image && (
                          <div className="w-10 h-10 shrink-0 overflow-hidden bg-gray-100">
                            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 group-hover:text-blue-900 transition-colors line-clamp-2 leading-snug">
                            {post.title}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {formatTimeAgo(post.publishedAt)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {["Regional update available", "Security briefing published", "Travel advisory updated"].map((t, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <div className="w-10 h-8 bg-gray-100 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-gray-700 line-clamp-2">{t}</p>
                          <p className="text-[10px] text-gray-400">Coming soon</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Risk Summary */}
              <div className="p-4 sm:p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                  RISK SUMMARY
                </p>
                {/* Donut chart — pure CSS */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="relative w-16 h-16 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                      {/* Background */}
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#f3f4f6" strokeWidth="5" />
                      {/* Segments — rough proportional arcs */}
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#22c55e" strokeWidth="5"
                        strokeDasharray={`${(riskCounts.low / natoCountries.length) * 88} 88`}
                        strokeDashoffset="0" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#eab308" strokeWidth="5"
                        strokeDasharray={`${(riskCounts.moderate / natoCountries.length) * 88} 88`}
                        strokeDashoffset={`-${(riskCounts.low / natoCountries.length) * 88}`} />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#f97316" strokeWidth="5"
                        strokeDasharray={`${(riskCounts.high / natoCountries.length) * 88} 88`}
                        strokeDashoffset={`-${((riskCounts.low + riskCounts.moderate) / natoCountries.length) * 88}`} />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#dc2626" strokeWidth="5"
                        strokeDasharray={`${(riskCounts.extreme / natoCountries.length) * 88} 88`}
                        strokeDashoffset={`-${((riskCounts.low + riskCounts.moderate + riskCounts.high) / natoCountries.length) * 88}`} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-sm font-black text-gray-900 leading-none">{natoCountries.length}</span>
                      <span className="text-[8px] text-gray-400 leading-none">Total</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {(Object.entries(riskCounts) as [keyof typeof RISK_CONFIG, number][]).map(([key, count]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${RISK_CONFIG[key].color}`} />
                        <span className="text-gray-600">{RISK_CONFIG[key].label}</span>
                        <span className="font-bold text-gray-900 ml-auto pl-2">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Need Help */}
              <div className="p-4 sm:p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                  NEED HELP?
                </p>
                <div className="space-y-2.5">
                  {[
                    { icon: Shield, label: "Travel Safety Tips", desc: "Stay safe while travelling", href: "/survival-guides/evacuation-shelter" },
                    { icon: Phone, label: "Emergency Contacts", desc: "Important contacts by country", href: "/directives" },
                    { icon: Flag, label: "Report an Incident", desc: "Submit a field report to help the community", href: "/dashboard/submit-report" },
                  ].map(item => (
                    <Link
                      key={item.label}
                      to={item.href}
                      className="flex items-center gap-3 group p-2 hover:bg-gray-50 -mx-2 transition-colors"
                    >
                      <div className="w-7 h-7 shrink-0 border border-gray-200 flex items-center justify-center group-hover:border-blue-900 transition-colors">
                        <item.icon className="w-3.5 h-3.5 text-blue-900" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 leading-none mb-0.5">{item.label}</p>
                        <p className="text-[10px] text-gray-400 leading-none">{item.desc}</p>
                      </div>
                      <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-blue-900 transition-colors shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Country Grid ── */}
            <div className="flex-1 bg-gray-50 p-4 sm:p-6">
              {/* Mobile search */}
              <div className="lg:hidden mb-4 relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search country..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-900"
                />
              </div>

              {/* Mobile continent filter button */}
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 transition-colors rounded"
                >
                  <span>
                    {selectedContinent ? (
                      <>
                        {CONTINENT_ICONS[selectedContinent]} {selectedContinent}
                      </>
                    ) : (
                      'All Continents'
                    )}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-700">
                  {selectedContinent ? selectedContinent : "All Countries"}
                  <span className="text-gray-400 font-normal ml-2">({filtered.length})</span>
                </p>
                {selectedContinent && (
                  <button
                    onClick={() => setSelectedContinent(null)}
                    className="text-xs text-blue-900 hover:underline"
                  >
                    Clear filter
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3">
                {filtered.map(country => {
                  const risk = getRisk(country.code);
                  const cfg = RISK_CONFIG[risk];
                  const posts = getPostCount(country.code);
                  return (
                    <Link
                      key={country.code}
                      to={`/countries/${country.code.toLowerCase()}`}
                      className={`group bg-white border ${cfg.border} hover:shadow-md transition-all p-2 sm:p-3 flex flex-col gap-1.5 sm:gap-2`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xl sm:text-2xl leading-none">{country.flag}</span>
                        <div className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full shrink-0 mt-1 ${cfg.color}`} title={cfg.label} />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-blue-900 transition-colors leading-tight line-clamp-2">
                          {country.name}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5 font-mono">{country.code}</p>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-1 border-t border-gray-100">
                        <span className={`text-[9px] sm:text-[10px] font-bold ${cfg.text}`}>{cfg.label}</span>
                        <span className="text-[9px] sm:text-[10px] text-gray-400">{posts} post{posts !== 1 ? "s" : ""}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No countries match your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountriesPage;
