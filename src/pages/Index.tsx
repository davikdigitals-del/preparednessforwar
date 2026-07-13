import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { useNavSections } from "@/hooks/useNavSections";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const { loading } = useData();
  const { sections: dbSections } = useNavSections();

  useEffect(() => {
    document.title = "Preparedness For War - Latest News & Updates";
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">

      {/* ── HERO BANNER ── */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: "520px" }}>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/hero-banner.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/80 to-blue-800/40" />
        <div
          className="relative container mx-auto px-4 py-24 flex flex-col justify-center"
          style={{ minHeight: "520px" }}
        >
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-black uppercase tracking-widest text-white mb-4 border border-white/40 px-3 py-1">
              Preparedness For War
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4 uppercase">
              Prepare.<br />Inform.<br />Survive.
            </h1>
            <p className="text-blue-100 text-lg mb-8 max-w-lg leading-relaxed">
              Your trusted resource for war preparedness, safety information, and survival guidance worldwide.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/survival-guides"
                className="px-6 py-3 bg-white text-blue-900 font-bold text-sm hover:bg-blue-50 transition-colors"
              >
                Explore Guides
              </Link>
              <Link
                to="/emergency-news"
                className="px-6 py-3 bg-blue-500 text-white font-bold text-sm hover:bg-blue-400 transition-colors border border-blue-400"
              >
                Emergency News
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── MISSION SECTION ── */}
      <div className="bg-blue-50 border-y border-blue-100">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-blue-600 mb-3 block">
                Our Mission
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
                Knowledge Today.<br />Safety Tomorrow.
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We provide accurate, timely, and life-saving information to help individuals and communities
                prepare for conflicts and emergencies worldwide.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                From country risk levels and survival guides to official NATO directives and health advisories
                — everything you need to stay informed and stay safe.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/survival-guides"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 text-white font-bold text-sm hover:bg-blue-800 transition-colors"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/countries"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-blue-900 text-blue-900 font-bold text-sm hover:bg-blue-900 hover:text-white transition-colors"
                >
                  View World Map
                </Link>
              </div>
            </div>
            <div className="relative overflow-hidden shadow-lg" style={{ height: "340px" }}>
              <img
                src="https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=900&q=80"
                alt="World preparedness"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-blue-900/20" />
              <div className="absolute bottom-4 left-4 bg-blue-900 text-white px-4 py-2">
                <p className="text-xs font-black uppercase tracking-wide">195 Countries Monitored</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURED CATEGORIES ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-14">
          <div className="mb-8">
            <span className="text-xs font-black uppercase tracking-widest text-blue-600 mb-1 block">Browse</span>
            <h2 className="text-2xl font-black text-gray-900 uppercase">Featured Categories</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { title: "Emergency News", desc: "Live updates and critical alerts", href: "/emergency-news", img: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80" },
              { title: "Survival Guides", desc: "Step-by-step preparedness guides", href: "/survival-guides", img: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=400&q=80" },
              { title: "Health & Wellness", desc: "Medical and vaccination info", href: "/health", img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80" },
              { title: "Official Directives", desc: "Government and NATO guidance", href: "/directives", img: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=400&q=80" },
              { title: "Resources", desc: "Checklists, templates & downloads", href: "/resources", img: "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=400&q=80" },
              { title: "Media Hub", desc: "Videos, podcasts & documentaries", href: "/media", img: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=400&q=80" },
            ].map((cat) => (
              <Link
                key={cat.title}
                to={cat.href}
                className="group relative overflow-hidden shadow hover:shadow-lg transition-shadow"
                style={{ height: "180px" }}
              >
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-black text-xs leading-tight mb-0.5">{cat.title}</p>
                  <p className="text-blue-200 text-[10px] leading-tight hidden sm:block">{cat.desc}</p>
                </div>
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA STRIP ── */}
      <div className="bg-blue-900">
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3 uppercase">
            Stay Prepared. Stay Informed.
          </h2>
          <p className="text-blue-200 text-sm mb-6 max-w-xl mx-auto">
            Sign up for free alerts, download survival guides, and access expert resources — all in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/signup"
              className="px-6 py-3 bg-white text-blue-900 font-bold text-sm hover:bg-blue-50 transition-colors"
            >
              Create Free Account
            </Link>
            <Link
              to="/library"
              className="px-6 py-3 border border-white/40 text-white font-bold text-sm hover:bg-white/10 transition-colors"
            >
              Browse Resources
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Index;
