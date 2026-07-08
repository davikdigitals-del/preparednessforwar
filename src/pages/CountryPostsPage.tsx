import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, Globe, MapPin } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { PostCard } from "@/components/PostCard";
import { natoCountries } from "@/data/mockData";

const CountryPostsPage = () => {
  const { countryCode } = useParams<{ countryCode: string }>();
  const { user, loading } = useAuth();
  const { publishedPosts } = useData();
  const [country, setCountry] = useState<any>(null);

  useEffect(() => {
    if (countryCode) {
      const foundCountry = natoCountries.find(
        c => c.code.toLowerCase() === countryCode.toLowerCase()
      );
      setCountry(foundCountry);
    }
  }, [countryCode]);

  if (loading) {
    return (
      <div className="container py-8 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!country) {
    return (
      <div className="container py-16 text-center">
        <div className="max-w-md mx-auto">
          <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="font-display font-bold text-3xl mb-3">Country Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The country "{countryCode?.toUpperCase()}" was not found in our database.
          </p>
          <Link 
            to="/countries" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold hover:bg-primary/90 transition-colors rounded-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Countries Map
          </Link>
        </div>
      </div>
    );
  }

  // Filter posts for this country - ONLY show posts specifically tagged with this country
  const countryPosts = publishedPosts.filter((post) => {
    const postCountries = post.countryCodes || [];
    // Only include posts that have this country in their country codes
    return postCountries.includes(country.code);
  });

  return (
    <div className="bg-white min-h-screen">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/countries" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to World Map
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl">
              {country.flag}
            </div>
            <div>
              <h1 className="font-display font-bold text-3xl md:text-4xl text-gray-900">
                {country.name}
              </h1>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <MapPin className="w-4 h-4" />
                <span className="font-semibold">{country.code}</span>
                <span>•</span>
                <span>{countryPosts.length} post{countryPosts.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Country-Specific Content</h3>
                <p className="text-blue-700 text-sm">
                  Showing all posts relevant to {country.name}. Content is filtered based on regional 
                  relevance, local threats, and country-specific preparedness information.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {countryPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {countryPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">
              No Posts Available
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              There are currently no posts specifically targeted for {country.name}. 
              Check back later or explore content from other regions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                to="/countries" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold hover:bg-primary/90 transition-colors rounded-md"
              >
                <Globe className="w-4 h-4" />
                Explore Other Countries
              </Link>
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors rounded-md"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* Country Stats */}
        {countryPosts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {countryPosts.length}
                </div>
                <div className="text-sm text-gray-600">
                  Total Posts
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {countryPosts.filter(p => p.isPremium).length}
                </div>
                <div className="text-sm text-gray-600">
                  Premium Content
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {new Set(countryPosts.flatMap(p => p.tags || [])).size}
                </div>
                <div className="text-sm text-gray-600">
                  Unique Topics
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountryPostsPage;