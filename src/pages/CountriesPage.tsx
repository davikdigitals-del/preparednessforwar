import { useState, useEffect } from "react";
import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Globe, Search, ChevronRight,
} from "lucide-react";

import { RISK_MAP } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { InteractiveWorldMap } from "@/components/InteractiveWorldMap";
import { publicSupabase } from "@/integrations/supabase/publicClient";

const RISK_CONFIG = {
  low:      { label: "Low Risk",      color: "bg-green-500",  text: "text-green-600",  border: "border-green-200" },
  moderate: { label: "Moderate Risk", color: "bg-yellow-500", text: "text-yellow-600", border: "border-yellow-200" },
  high:     { label: "High Risk",     color: "bg-orange-500", text: "text-orange-600", border: "border-orange-200" },
  extreme:  { label: "Extreme Risk",  color: "bg-red-600",    text: "text-red-600",    border: "border-red-200"   },
};

const getRisk = (code: string, dbRiskMap: Record<string, string>) =>
  (dbRiskMap[code] as keyof typeof RISK_CONFIG) || (RISK_MAP as Record<string, string>)[code] as keyof typeof RISK_CONFIG || "low";

const CountriesPage = () => {
  const { user, loading } = useAuth();
  const { publishedPosts } = useData();
  const [search, setSearch] = useState("");
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    publicSupabase
      .from("countries")
      .select("id, code, name, flag, risk_level, continent, description")
      .order("name")
      .then(({ data }) => {
        if (data && data.length > 0) setCountries(data);
        setDbLoading(false);
      })
      .catch(() => setDbLoading(false));
  }, []);

  if (loading) return <div className="container py-8 text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  /* ── Fullscreen map ── */
  if (mapFullscreen) {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        <button onClick={() => setMapFullscreen(false)} className="absolute top-4 right-4 z-30 px-4 py-2 bg-white border border-gray-200 shadow-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
          ✕ Exit Map
        </button>
        <InteractiveWorldMap height="100vh" />
      </div>
    );
  }

  const getPostCount = (code: string) =>
    publishedPosts.filter((p: any) => (p.countryCodes || []).includes(code)).length;

  const filtered = countries.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* breadcrumb */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="container mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-blue-900 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-900 font-semibold">Countries</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-5 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search country..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-900 rounded"
            />
          </div>
          <span className="text-sm text-gray-400">{filtered.length} countries</span>
        </div>

        {/* Map */}
        <div className="relative bg-blue-50 border border-gray-200 rounded-lg mb-6 h-[300px] sm:h-[380px]">
          <button onClick={() => setMapFullscreen(true)} className="absolute top-3 right-3 z-20 w-8 h-8 bg-white border border-gray-200 shadow flex items-center justify-center hover:bg-gray-50 rounded">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden">
            <InteractiveWorldMap height="100%" />
          </div>
        </div>

        {/* Country Grid */}
        {dbLoading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading countries...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filtered.map(country => {
              const risk = getRisk(country.code, Object.fromEntries(countries.map(c => [c.code, c.risk_level])));
              const cfg = RISK_CONFIG[risk] || RISK_CONFIG.low;
              return (
                <Link
                  key={country.code}
                  to={`/countries/${country.code.toLowerCase()}`}
                  className="group relative rounded-xl overflow-hidden shadow hover:shadow-lg transition-all aspect-[4/3] bg-gray-200"
                >
                  <img
                    src={`https://flagcdn.com/w320/${country.code.toLowerCase()}.png`}
                    alt={country.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${cfg.color}`} title={cfg.label} />
                  <span className="absolute bottom-2 left-2 right-2 text-white font-bold text-xs drop-shadow-md leading-tight">
                    {country.name}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {!dbLoading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No countries found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountriesPage;
