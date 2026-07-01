import { useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { Globe, List, Map, X, Settings } from "lucide-react";
import { natoCountries } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { InteractiveWorldMap } from "@/components/InteractiveWorldMap";

const CountriesPage = () => {
  const { user, loading } = useAuth();
  const { publishedPosts } = useData();
  const [searchParams] = useSearchParams();
  const initialView = searchParams.get('view') || 'globe';
  const [viewMode, setViewMode] = useState<'globe' | 'list'>(initialView as 'globe' | 'list');
  const [showFullscreenGlobe, setShowFullscreenGlobe] = useState(initialView === 'globe');
  const [debugMode, setDebugMode] = useState(false);

  if (loading) return <div className="container py-8 text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  // Count posts per country
  const getPostCount = (countryCode: string) => {
    return publishedPosts.filter((post) => {
      const postCountries = post.countryCodes || [];
      return postCountries.length === 0 || postCountries.includes(countryCode);
    }).length;
  };

  // Full-screen 3D Globe view
  if (showFullscreenGlobe && viewMode === 'globe') {
    return (
      <div className="relative w-full h-screen overflow-hidden">
        {/* Exit fullscreen button */}
        <button
          onClick={() => {
            setShowFullscreenGlobe(false);
            setViewMode('list');
          }}
          className="absolute top-6 right-6 z-30 w-12 h-12 bg-white/95 hover:bg-white rounded-xl shadow-2xl flex items-center justify-center text-slate-700 hover:text-slate-900 transition-all border border-white/20 backdrop-blur-sm"
          title="Exit to List View"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Debug mode toggle */}
        <button
          onClick={() => setDebugMode(!debugMode)}
          className={`absolute top-6 right-20 z-30 w-12 h-12 rounded-xl shadow-2xl flex items-center justify-center transition-all border backdrop-blur-sm ${
            debugMode 
              ? 'bg-red-500 hover:bg-red-600 text-white border-red-400' 
              : 'bg-white/95 hover:bg-white text-slate-700 hover:text-slate-900 border-white/20'
          }`}
          title={debugMode ? "Disable Debug Mode" : "Enable Debug Mode"}
        >
          <Settings className="w-6 h-6" />
        </button>
        
        {/* Interactive World Map */}
        <InteractiveWorldMap debugMode={debugMode} />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">Countries</h1>
              <p className="text-muted-foreground">
                Country information, risk levels, and travel advisories
              </p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setViewMode('globe');
                  setShowFullscreenGlobe(true);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-colors ${
                  viewMode === 'globe' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Map className="w-4 h-4" />
                World Map
              </button>
              <button
                onClick={() => {
                  setViewMode('list');
                  setShowFullscreenGlobe(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                Country List
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Map className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Interactive World Map</h3>
                <p className="text-blue-700 text-sm">
                  Click "World Map" to explore our interactive world map with real country boundaries. 
                  Hover over countries to see their names, and click to view country-specific preparedness content.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* List View */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {natoCountries.map((country) => {
            const postCount = getPostCount(country.code);
            return (
              <a
                key={country.code}
                href={`/countries/${country.code.toLowerCase()}`}
                className="group block bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">{country.flag}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {country.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono">
                      {country.code}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {postCount} post{postCount !== 1 ? 's' : ''}
                  </span>
                  <span className="text-blue-600 group-hover:text-blue-700 font-medium">
                    View →
                  </span>
                </div>
              </a>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {natoCountries.length}
              </div>
              <div className="text-sm text-gray-600">
                Countries Available
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {publishedPosts.length}
              </div>
              <div className="text-sm text-gray-600">
                Total Posts
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {natoCountries.filter(c => getPostCount(c.code) > 0).length}
              </div>
              <div className="text-sm text-gray-600">
                Countries with Content
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {Math.round(publishedPosts.length / natoCountries.length)}
              </div>
              <div className="text-sm text-gray-600">
                Avg Posts per Country
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountriesPage;
