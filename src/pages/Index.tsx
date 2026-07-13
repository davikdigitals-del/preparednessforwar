import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useData, type MediaItem } from "@/contexts/DataContext";
import { formatTimeAgo, navSections as fallbackSections } from "@/data/mockData";
import { useNavSections } from "@/hooks/useNavSections";
import { Clock, Play, Video, Eye, Headphones, ExternalLink, Crown, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { MediaPlayer } from "@/components/MediaPlayer";

/* ── Embed URL resolver ── */
function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  if (url.includes("youtube.com/embed/") || url.includes("player.vimeo.com")) return url;
  const ytWatch = url.match(/youtube\.com\/watch\?v=([\w-]+)/);
  if (ytWatch) return `https://www.youtube.com/embed/${ytWatch[1]}?autoplay=1&rel=0`;
  const ytShort = url.match(/youtu\.be\/([\w-]+)/);
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}?autoplay=1&rel=0`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`;
  return null;
}

function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
}

function isAudio(url: string) {
  return /\.(mp3|aac|wav|ogg|m4a)(\?|$)/i.test(url);
}

/* ── Media player modal ── */
function MediaModal({ item, onClose }) {
  const { user } = useAuth();
  const { isPremium: hasPremiumAccess } = usePremiumStatus();
  const isPremiumLocked = item.isPremium && !hasPremiumAccess;
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden gap-0 bg-black border-gray-800" aria-describedby={undefined}>
        <DialogHeader className="px-5 pt-4 pb-3 border-b border-gray-800 bg-gray-900">
          <DialogTitle className="text-sm font-bold line-clamp-1 pr-8 text-white flex items-center gap-2">
            {item.title}
            {item.isPremium && <Crown className="w-3.5 h-3.5 text-yellow-400 shrink-0" />}
          </DialogTitle>
          <p className="text-xs text-gray-400 mt-0.5">{item.author} � {item.duration}</p>
        </DialogHeader>
        {isPremiumLocked ? (
          <div className="aspect-video bg-gray-900 flex flex-col items-center justify-center gap-4 px-8 text-center">
            <Crown className="w-12 h-12 text-yellow-400" />
            <h3 className="text-white font-bold text-lg">Premium Content</h3>
            <p className="text-gray-400 text-sm">Subscribe to access this {item.type}.</p>
            <Button asChild className="bg-yellow-500 text-black font-bold" onClick={onClose}>
              <Link to={user ? '/subscribe' : '/login'}>{user ? 'Upgrade to Premium' : 'Sign In'}</Link>
            </Button>
          </div>
        ) : item.url ? (
          <MediaPlayer url={item.url} title={item.title} isPremium={item.isPremium} type={item.type} thumbnail={item.thumbnail} mediaId={item.id} />
        ) : (
          <div className="aspect-video bg-gray-900 flex items-center justify-center text-gray-500"><p className="text-sm">No media URL.</p></div>
        )}
      </DialogContent>
    </Dialog>
  );
}

const Index = () => {
  const { publishedPosts, mediaItems, loading } = useData();
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const { sections: dbSections } = useNavSections();
  const sections = dbSections.length > 0 ? dbSections : fallbackSections;
  const navSections = sections; // alias for existing references

  // Set page title
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

  const sortedPosts = [...publishedPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const heroPost = sortedPosts[0];
  const topStories = sortedPosts.slice(1, 4);
  const gridStories = sortedPosts.slice(4, 16);
  const justInPosts = sortedPosts.slice(0, 15);
  const mostReadPosts = [...publishedPosts].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);

  return (
    <div className="bg-white min-h-screen">

      {/* ------------------------------------------
          HERO BANNER
      ------------------------------------------ */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: "520px" }}>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/hero-banner.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/80 to-blue-800/40" />
        <div className="relative container mx-auto px-4 py-24 flex flex-col justify-center" style={{ minHeight: "520px" }}>
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
              <Link to="/survival-guides" className="px-6 py-3 bg-white text-blue-900 font-bold text-sm hover:bg-blue-50 transition-colors">
                Explore Guides
              </Link>
              <Link to="/emergency-news" className="px-6 py-3 bg-blue-500 text-white font-bold text-sm hover:bg-blue-400 transition-colors border border-blue-400">
                Emergency News
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------
          MISSION SECTION
      ------------------------------------------ */}
      <div className="bg-blue-50 border-y border-blue-100">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-blue-600 mb-3 block">Our Mission</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
                Knowledge Today.<br />Safety Tomorrow.
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We provide accurate, timely, and life-saving information to help individuals and communities prepare for conflicts and emergencies worldwide.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                From country risk levels and survival guides to official NATO directives and health advisories � everything you need to stay informed and stay safe.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/survival-guides" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 text-white font-bold text-sm hover:bg-blue-800 transition-colors">
                  Learn More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
                <Link to="/countries" className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-blue-900 text-blue-900 font-bold text-sm hover:bg-blue-900 hover:text-white transition-colors">
                  View World Map
                </Link>
              </div>
            </div>
            <div className="relative overflow-hidden shadow-lg" style={{ height: "340px" }}>
              <img src="https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=900&q=80" alt="World preparedness" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-blue-900/20" />
              <div className="absolute bottom-4 left-4 bg-blue-900 text-white px-4 py-2">
                <p className="text-xs font-black uppercase tracking-wide">195 Countries Monitored</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------
          FEATURED CATEGORIES
      ------------------------------------------ */}
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
            ].map(cat => (
              <Link key={cat.title} to={cat.href} className="group relative overflow-hidden shadow hover:shadow-lg transition-shadow" style={{ height: "180px" }}>
                <img src={cat.img} alt={cat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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

      {/* ------------------------------------------
          LATEST NEWS
      ------------------------------------------ */}
      <div className="container mx-auto px-4 py-10">
        <div className="flex gap-6">

          {/* LEFT � Main news content */}
          <div className="flex-1 min-w-0">

            {/* Latest News heading */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-blue-600 mb-1 block">Live</span>
                <h2 className="text-2xl font-black text-gray-900 uppercase">Latest News</h2>
              </div>
              <Link to="/latest" className="text-sm font-bold text-blue-900 border border-blue-900 px-4 py-1.5 hover:bg-blue-900 hover:text-white transition-colors">
                View All
              </Link>
            </div>

            {/* Hero Post */}
            {heroPost && (
              <Link to={`/${heroPost.section}/${heroPost.category}/${heroPost.id}`} className="group block mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 items-start">
                  <div className="flex flex-col pt-2">
                    <span className="text-xs font-bold text-blue-600 uppercase mb-2">
                      {navSections.find(s => s.slug === heroPost.section)?.title}
                    </span>
                    <h2 className="text-3xl xl:text-4xl font-black leading-tight mb-3 group-hover:text-blue-900 transition-colors">
                      {heroPost.title}
                    </h2>
                    {(heroPost.standfirst || heroPost.body) && (
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-4">
                        {heroPost.body
                          ? heroPost.body.replace(/<[^>]*>/g, '').substring(0, 300)
                          : heroPost.standfirst}
                      </p>
                    )}
                  </div>
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                    {heroPost.image ? (
                      <img src={heroPost.image} alt={heroPost.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-blue-50" />
                    )}
                  </div>
                </div>
              </Link>
            )}

            <hr className="border-gray-200 mb-6" />

            {/* 3-column top stories */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {topStories.map(post => {
                const section = navSections.find(s => s.slug === post.section);
                return (
                  <Link key={post.id} to={`/${post.section}/${post.category}/${post.id}`} className="group">
                    <div className="aspect-video bg-gray-200 overflow-hidden mb-2 relative">
                      {post.image ? <img src={post.image} alt={post.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-blue-50" />}
                      {post.videoUrl && <div className="absolute bottom-1.5 right-1.5 bg-blue-900 rounded-full w-8 h-8 flex items-center justify-center"><Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" /></div>}
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase block mb-1">{section?.title}</span>
                    <h3 className="text-sm font-bold leading-tight group-hover:text-blue-900 transition-colors line-clamp-2">{post.title}</h3>
                  </Link>
                );
              })}
            </div>

            <hr className="border-gray-200 mb-6" />

            {/* 2-column grid stories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {gridStories.map(post => {
                const section = navSections.find(s => s.slug === post.section);
                return (
                  <Link key={post.id} to={`/${post.section}/${post.category}/${post.id}`} className="group flex gap-3">
                    <div className="w-28 h-20 bg-gray-200 shrink-0 overflow-hidden">
                      {post.image ? <img src={post.image} alt={post.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-blue-50" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">{section?.title}</span>
                      <h3 className="text-xs font-bold leading-tight group-hover:text-blue-900 transition-colors line-clamp-3">{post.title}</h3>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Section blocks */}
            {sections.map(section => {
              const sectionPosts = sortedPosts.filter(p => p.section === section.slug);
              if (sectionPosts.length === 0) return null;
              const pinnedPosts = sectionPosts.filter(p => p.isPinned).slice(0, 4);
              const regularPosts = sectionPosts.filter(p => !p.isPinned);
              const heroes = [...pinnedPosts];
              if (heroes.length < 4) heroes.push(...regularPosts.slice(0, 4 - heroes.length));
              const gridPosts = pinnedPosts.length >= 4 ? regularPosts : regularPosts.slice(4 - pinnedPosts.length);
              return (
                <div key={section.slug} className="mb-10">
                  <h2 className="text-xl font-black mb-4 pb-2 border-b-2 border-blue-900 flex items-center justify-between">
                    <span>{section.title}</span>
                    <Link to={`/${section.slug}`} className="text-xs font-bold text-blue-900 hover:underline normal-case">View all ?</Link>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    {heroes.map(post => (
                      <Link key={post.id} to={`/${post.section}/${post.category}/${post.id}`} className="group">
                        <div className="aspect-video bg-gray-200 overflow-hidden mb-1.5 relative">
                          {post.image ? <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full bg-blue-50" />}
                          {post.isPinned && <div className="absolute top-1.5 left-1.5 bg-blue-900 text-white text-[10px] font-bold px-1.5 py-0.5">FEATURED</div>}
                        </div>
                        <h3 className="text-xs font-bold leading-tight group-hover:text-blue-900 transition-colors line-clamp-2">{post.title}</h3>
                      </Link>
                    ))}
                  </div>
                  {gridPosts.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {gridPosts.slice(0, 8).map(post => (
                        <Link key={post.id} to={`/${post.section}/${post.category}/${post.id}`} className="group">
                          <div className="aspect-video bg-gray-200 overflow-hidden mb-1.5">
                            {post.image ? <img src={post.image} alt={post.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-blue-50" />}
                          </div>
                          <h3 className="text-xs font-bold leading-tight group-hover:text-blue-900 transition-colors line-clamp-2">{post.title}</h3>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Videos & Podcasts */}
            <div className="mb-8">
              <h2 className="text-xl font-black mb-4 pb-2 border-b-2 border-blue-900 flex items-center justify-between">
                <span>Videos & Podcasts</span>
                <Link to="/media" className="text-xs font-bold text-blue-900 hover:underline normal-case">View all ?</Link>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {mediaItems.slice(0, 8).map(media => (
                  <div key={media.id} className="bg-white border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
                    <button onClick={() => setActiveMedia(media)} className="group block w-full text-left">
                      <div className="aspect-video bg-gray-900 overflow-hidden relative">
                        {media.thumbnail ? <img src={media.thumbnail} alt={media.title} className="w-full h-full object-cover" /> : <div className={`w-full h-full ${media.type === 'video' ? 'bg-blue-900' : 'bg-purple-900'} flex items-center justify-center`}><Video className="w-10 h-10 text-white/30" /></div>}
                        {media.isPremium && <div className="absolute top-2 left-2"><span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-900 text-white text-[10px] font-bold"><Crown className="w-2.5 h-2.5" />PREMIUM</span></div>}
                        <div className="absolute bottom-2 right-2"><div className={`rounded-full w-9 h-9 flex items-center justify-center ${media.isPremium ? 'bg-blue-900' : 'bg-blue-600'}`}>{media.isPremium ? <Lock className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white fill-white ml-0.5" />}</div></div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-xs leading-tight text-gray-900 line-clamp-2">{media.title}</h3>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT � Just In sidebar (desktop only) */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-4">
              <div className="border border-gray-200">
                <div className="bg-blue-900 px-4 py-3">
                  <h2 className="font-black text-sm text-white uppercase tracking-wide">Just In</h2>
                </div>
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {justInPosts.map(post => {
                    const section = navSections.find(s => s.slug === post.section);
                    return (
                      <Link key={post.id} to={`/${post.section}/${post.category}/${post.id}`} className="block p-3 hover:bg-blue-50 transition-colors group">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] text-gray-400 shrink-0">{new Date(post.publishedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="text-[10px] font-bold text-blue-600 uppercase">{section?.title}</span>
                        </div>
                        <h3 className="text-xs font-semibold leading-snug group-hover:text-blue-900 transition-colors">{post.title}</h3>
                      </Link>
                    );
                  })}
                </div>
                <div className="p-3 border-t border-gray-200 text-center">
                  <Link to="/latest" className="text-xs text-blue-900 font-bold hover:underline">See more ?</Link>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>

      {/* Video Player Modal */}
      {activeMedia && <MediaModal item={activeMedia} onClose={() => setActiveMedia(null)} />}
    </div>
  );
};

export default Index;
