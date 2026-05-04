import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Check } from "lucide-react";
import { natoCountries } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/PostCard";

const CountriesPage = () => {
  const { user, loading } = useAuth();
  const { publishedPosts } = useData();

  const [selected, setSelected] = useState<string>(user?.country || "GB");
  const [search, setSearch] = useState("");

  if (loading) return <div className="container py-8 text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  const filteredCountries = natoCountries.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const countryPosts = publishedPosts.filter((post) => {
    const postCountries = post.countryCodes || [];
    return postCountries.length === 0 || postCountries.includes(selected);
  });

  const handleSelectCountry = async (countryCode: string) => {
    setSelected(countryCode);
    await supabase.from("profiles").update({ country: countryCode }).eq("user_id", user.id);
  };

  return (
    <div className="container py-8">
      <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">Country Feed</h1>
      <p className="text-muted-foreground mb-6">Members only. You will only see posts targeted to your selected country.</p>

      <input
        type="text"
        placeholder="Search countries..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md px-4 py-2.5 bg-card border border-border rounded-sm text-sm mb-6 outline-none focus:ring-2 focus:ring-ring"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
        {filteredCountries.map((country) => (
          <button
            key={country.code}
            onClick={() => void handleSelectCountry(country.code)}
            className={`flex items-center gap-3 p-3 rounded-sm border transition-all text-left ${
              selected === country.code ? "border-alert bg-alert/5 ring-1 ring-alert" : "border-border bg-card hover:border-muted-foreground/30"
            }`}
          >
            <span className="text-3xl">{country.flag}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{country.name}</p>
              <p className="text-xs text-muted-foreground">{country.code}</p>
            </div>
            {selected === country.code && <Check className="w-4 h-4 text-alert shrink-0" />}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <h2 className="font-display font-bold text-xl">Posts for {natoCountries.find((c) => c.code === selected)?.name || selected}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {countryPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {countryPosts.length === 0 && <p className="text-center text-muted-foreground py-12">No posts available for this country yet.</p>}
    </div>
  );
};

export default CountriesPage;
