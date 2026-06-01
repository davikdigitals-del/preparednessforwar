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

/* â”€â”€ Embed URL resolver â”€â”€ */
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

/* â”€â”€ Media player modal â”€â”€ */
function MediaModal({ item, onClose }) {
  const { user } = useAuth();
  const { isPremium: hasPremiumAccess } = usePremiumStatus();
  const isPremiumLocked = item.isPremium && !hasPremiumAccess;
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden gap-0 bg-black border-gray-800">
        <DialogHeader className="px-5 pt-4 pb-3 border-b border-gray-800 bg-gray-900">
          <DialogTitle className="text-sm font-bold line-clamp-1 pr-8 text-white flex items-center gap-2">
            {item.title}
            {item.isPremium && <Crown className="w-3.5 h-3.5 text-yellow-400 shrink-0" />}
          </DialogTitle>
          <p className="text-xs text-gray-400 mt-0.5">{item.author} · {item.duration}</p>
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
      <div className="container mx-auto px-4 py-6">
        {/* MOBILE LAYOUT - Single column with sections interspersed */}
        <div className="lg:hidden">
          {/* Hero Section */}
          {heroPost && (
            <div className="mb-5">
              <Link to={`/${heroPost.section}/${heroPost.category}/${heroPost.id}`} className="group block">
                <div className="aspect-[16/9] bg-gray-200 overflow-hidden relative mb-3 rounded-sm">
                  {heroPost.image ? (
                    <img src={heroPost.image} alt={heroPost.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/10" />
                  )}
                  {heroPost.videoUrl && (
                    <div className="absolute bottom-3 right-3 bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  )}
                </div>
                <h1 className="text-xl font-bold leading-tight mb-2 text-gray-900 group-hover:text-primary transition-colors">
                  {heroPost.title}
                </h1>
                {heroPost.standfirst && (
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {String(heroPost.standfirst).replace(/<[^>]*>/g, "")}
                  </p>
                )}
              </Link>
            </div>
          )}

          {/* Top Stories */}
          <div className="space-y-4 mb-8">
            {topStories.map((post) => {
              const section = navSections.find((s) => s.slug === post.section);
              return (
                <Link key={post.id} to={`/${post.section}/${post.category}/${post.id}`} className="group flex gap-3 pb-4 border-b border-gray-200 last:border-0">
                  <div className="w-[140px] h-[100px] bg-gray-200 shrink-0 overflow-hidden relative rounded-sm">
                    {post.image ? (
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/10" />
                    )}
                    {post.videoUrl && (
                      <div className="absolute bottom-2 right-2 bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center shadow-md">
                        <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <span className="text-xs font-semibold text-blue-600 mb-1.5 uppercase tracking-wide">{section?.title}</span>
                    <h3 className="text-base font-bold leading-snug text-gray-900 group-hover:text-primary transition-colors line-clamp-3">{post.title}</h3>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Grid Stories */}
          <div className="space-y-4 mb-8">
            {gridStories.map((post) => {
              const section = navSections.find((s) => s.slug === post.section);
              return (
                <Link key={post.id} to={`/${post.section}/${post.category}/${post.id}`} className="group flex gap-3 pb-4 border-b border-gray-200 last:border-0">
                  <div className="w-[140px] h-[100px] bg-gray-200 shrink-0 overflow-hidden relative rounded-sm">
                    {post.image ? (
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/10" />
                    )}
                    {post.videoUrl && (
                      <div className="absolute bottom-2 right-2 bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center shadow-md">
                        <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <span className="text-xs font-semibold text-blue-600 mb-1.5 uppercase tracking-wide">{section?.title}</span>
                    <h3 className="text-base font-bold leading-snug text-gray-900 group-hover:text-primary transition-colors line-clamp-3">{post.title}</h3>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* First 2 Sections on Mobile */}
          {sections.slice(0, 2).map((section) => {
            const sectionPosts = sortedPosts.filter((p) => p.section === section.slug);
            if (sectionPosts.length === 0) return null;

            const pinnedPosts = sectionPosts.filter(p => p.isPinned).slice(0, 1);
            const regularPosts = sectionPosts.filter(p => !p.isPinned).slice(0, 12);
            const mobileHero = pinnedPosts.length > 0 ? [pinnedPosts[0]] : [regularPosts[0]];
            const mobileGridPosts = pinnedPosts.length >= 1 ? regularPosts.slice(0, 10) : regularPosts.slice(1, 11);

            return (
              <div key={section.slug} className="mb-8">
                <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-primary">{section.title}</h2>
                {mobileHero[0] && (
                  <div className="mb-4">
                    <Link to={`/${mobileHero[0].section}/${mobileHero[0].category}/${mobileHero[0].id}`} className="group block">
                      <div className="aspect-video bg-gray-200 overflow-hidden mb-2 relative rounded-sm">
                        {mobileHero[0].image ? (
                          <img src={mobileHero[0].image} alt={mobileHero[0].title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-primary/10" />
                        )}
                        {mobileHero[0].videoUrl && (
                          <div className="absolute bottom-2 right-2 bg-blue-600 rounded-full w-11 h-11 flex items-center justify-center shadow-lg">
                            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                          </div>
                        )}
                        {mobileHero[0].isPinned && (
                          <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded">FEATURED</div>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-blue-600 mb-1.5 uppercase tracking-wide block">{section.title}</span>
                      <h3 className="text-base font-bold leading-snug mb-1 text-gray-900 group-hover:text-primary transition-colors">{mobileHero[0].title}</h3>
                    </Link>
                  </div>
                )}
                <div className="space-y-4 mb-4">
                  {mobileGridPosts.map((post) => (
                    <Link key={post.id} to={`/${post.section}/${post.category}/${post.id}`} className="group flex gap-3 pb-4 border-b border-gray-200 last:border-0">
                      <div className="w-[140px] h-[100px] bg-gray-200 shrink-0 overflow-hidden relative rounded-sm">
                        {post.image ? (
                          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-primary/10" />
                        )}
                        {post.videoUrl && (
                          <div className="absolute bottom-2 right-2 bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center shadow-md">
                            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <span className="text-xs font-semibold text-blue-600 mb-1.5 uppercase tracking-wide">{section.title}</span>
                        <h3 className="text-base font-bold leading-snug text-gray-900 group-hover:text-primary transition-colors line-clamp-3">{post.title}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="text-center">
                  <Link to={`/${section.slug}`} className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2 rounded text-sm transition-colors">
                    View All {section.title}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Just In Sidebar - Mobile */}
          <div className="bg-white border border-gray-200 mb-8">
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
              <h2 className="font-bold text-sm">Just in</h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {justInPosts.map((post) => {
                const section = navSections.find((s) => s.slug === post.section);
                return (
                  <Link key={post.id} to={`/${post.section}/${post.category}/${post.id}`} className="block p-4 hover:bg-gray-50 transition-colors group">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-xs text-gray-500 shrink-0">
                        {new Date(post.publishedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-xs font-bold text-primary uppercase">{section?.title}</span>
                    </div>
                    <h3 className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors">{post.title}</h3>
                  </Link>
                );
              })}
            </div>
            <div className="p-4 border-t border-gray-200 text-center">
              <Link to="/latest" className="text-sm text-primary font-semibold hover:underline">See more →</Link>
            </div>
          </div>

          {/* Remaining Sections on Mobile - After Just In */}
          {sections.slice(2).map((section) => {
            const sectionPosts = sortedPosts.filter((p) => p.section === section.slug);
            if (sectionPosts.length === 0) return null;

            const pinnedPosts = sectionPosts.filter(p => p.isPinned).slice(0, 1);
            const regularPosts = sectionPosts.filter(p => !p.isPinned).slice(0, 12);
            const mobileHero = pinnedPosts.length > 0 ? [pinnedPosts[0]] : [regularPosts[0]];
            const mobileGridPosts = pinnedPosts.length >= 1 ? regularPosts.slice(0, 10) : regularPosts.slice(1, 11);

            return (
              <div key={section.slug} className="mb-8">
                <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-primary">{section.title}</h2>
                {mobileHero[0] && (
                  <div className="mb-4">
                    <Link to={`/${mobileHero[0].section}/${mobileHero[0].category}/${mobileHero[0].id}`} className="group block">
                      <div className="aspect-video bg-gray-200 overflow-hidden mb-2 relative rounded-sm">
                        {mobileHero[0].image ? (
                          <img src={mobileHero[0].image} alt={mobileHero[0].title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-primary/10" />
                        )}
                        {mobileHero[0].videoUrl && (
                          <div className="absolute bottom-2 right-2 bg-blue-600 rounded-full w-11 h-11 flex items-center justify-center shadow-lg">
                            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                          </div>
                        )}
                        {mobileHero[0].isPinned && (
                          <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded">FEATURED</div>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-blue-600 mb-1.5 uppercase tracking-wide block">{section.title}</span>
                      <h3 className="text-base font-bold leading-snug mb-1 text-gray-900 group-hover:text-primary transition-colors">{mobileHero[0].title}</h3>
                    </Link>
                  </div>
                )}
                <div className="space-y-4 mb-4">
                  {mobileGridPosts.map((post) => (
                    <Link key={post.id} to={`/${post.section}/${post.category}/${post.id}`} className="group flex gap-3 pb-4 border-b border-gray-200 last:border-0">
                      <div className="w-[140px] h-[100px] bg-gray-200 shrink-0 overflow-hidden relative rounded-sm">
                        {post.image ? (
                          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-primary/10" />
                        )}
                        {post.videoUrl && (
                          <div className="absolute bottom-2 right-2 bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center shadow-md">
                            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <span className="text-xs font-semibold text-blue-600 mb-1.5 uppercase tracking-wide">{section.title}</span>
                        <h3 className="text-base font-bold leading-snug text-gray-900 group-hover:text-primary transition-colors line-clamp-3">{post.title}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="text-center">
                  <Link to={`/${section.slug}`} className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2 rounded text-sm transition-colors">
                    View All {section.title}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Videos Section - Mobile */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Latest Videos & Podcasts</h2>
            <div className="grid grid-cols-2 gap-4">
              {mediaItems.slice(0, 8).map((media) => (
                <div key={media.id} className="bg-white rounded overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                  <button onClick={() => setActiveMedia(media)} className="group block w-full text-left">
                    <div className="aspect-video bg-gray-900 overflow-hidden relative">
                      {media.thumbnail ? (
                        <img src={media.thumbnail} alt={media.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full ${media.type === 'video' ? 'bg-gradient-to-br from-blue-900 to-blue-700' : 'bg-gradient-to-br from-purple-900 to-purple-700'}`}>
                          <div className="flex items-center justify-center h-full">
                            {media.type === 'video' ? (
                              <Video className="w-20 h-20 text-white/30" />
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-white/40"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {media.isPremium && (
                        <div className="absolute top-2 left-2 z-10">
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-primary text-white text-[10px] font-bold">
                            <Crown className="w-2.5 h-2.5" />
                            PREMIUM
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2">
                        <div className={`rounded-full w-9 h-9 flex items-center justify-center ${media.isPremium ? 'bg-primary' : 'bg-blue-600'}`}>
                          {media.isPremium ? (
                            <Lock className="w-4 h-4 text-white" />
                          ) : (
                            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-3 pb-2">
                      <h3 className="font-bold text-xs leading-tight mb-2 text-gray-900 line-clamp-2 min-h-[32px] flex items-start gap-1.5">
                        <span className="flex-1">{media.title}</span>
                        {media.isPremium && <Crown className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />}
                      </h3>
                    </div>
                  </button>
                  <div className="px-3 pb-3">
                    <button onClick={() => setActiveMedia(media)} className={`text-[10px] font-bold uppercase tracking-wide ${media.isPremium ? 'text-primary hover:text-primary/80' : 'text-blue-600 hover:text-blue-700'}`}>
                      {media.isPremium ? (
                        <span className="flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" />
                          UNLOCK
                        </span>
                      ) : (
                        'MORE'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link to="/media" className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-5 py-2 rounded text-sm transition-colors">
                View All Videos & Podcasts
                <Play className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* DESKTOP LAYOUT - Original two-column layout */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_320px] gap-6">
          {/* LEFT COLUMN - Main Content */}
          <div>
            {/* DESKTOP HERO - Newspaper layout: text left, large image right */}
            {heroPost && (
              <Link to={`/${heroPost.section}/${heroPost.category}/${heroPost.id}`} className="group block mb-6">
                <div className="grid grid-cols-[2fr_3fr] gap-6 items-start">
                  {/* Left: Text — top aligned */}
                  <div className="flex flex-col pt-2">
                    <h1 className="text-4xl xl:text-5xl font-black leading-[1.1] mb-3 group-hover:text-primary transition-colors">
                      {heroPost.title}
                    </h1>
                    {(heroPost.standfirst || heroPost.body || (heroPost as any).excerpt) && (
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-4">
                        {heroPost.body
                          ? heroPost.body.replace(/<[^>]*>/g, '').substring(0, 400)
                          : heroPost.standfirst || (heroPost as any).excerpt}
                      </p>
                    )}
                  </div>
                  {/* Right: Image fills full height */}
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                    {heroPost.image ? (
                      <img
                        src={heroPost.image}
                        alt={heroPost.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10" />
                    )}
                  </div>
                </div>
              </Link>
            )}

            {/* DESKTOP - 3 column grid */}
            <hr className="border-t border-gray-200 mt-6 mb-6" />
            <div className="grid grid-cols-3 gap-3 mb-4">
              {topStories.map((post) => {
                const section = navSections.find((s) => s.slug === post.section);
                return (
                  <Link key={post.id} to={`/${post.section}/${post.category}/${post.id}`} className="group">
                    <div className="aspect-video bg-gray-200 overflow-hidden mb-1.5 relative">
                      {post.image ? (
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/10" />
                      )}
                      {post.videoUrl && (
                        <div className="absolute bottom-1.5 right-1.5 bg-primary rounded-full w-8 h-8 flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-primary uppercase block mb-0.5">{section?.title}</span>
                    <h3 className="text-xs font-bold leading-tight group-hover:text-primary transition-colors">{post.title}</h3>
                  </Link>
                );
              })}
            </div>

            {/* DESKTOP - 2 column grid */}
            <hr className="border-t border-gray-200 mb-4" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-6">
              {gridStories.map((post) => {
                const section = navSections.find((s) => s.slug === post.section);
                return (
                  <Link key={post.id} to={`/${post.section}/${post.category}/${post.id}`} className="group flex gap-2.5">
                    <div className="w-28 h-20 bg-gray-200 shrink-0 overflow-hidden relative">
                      {post.image ? (
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/10" />
                      )}
                      {post.videoUrl && (
                        <div className="absolute bottom-1 right-1 bg-primary rounded-full w-7 h-7 flex items-center justify-center">
                          <Play className="w-2.5 h-2.5 text-white fill-white ml-0.5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-gray-500 uppercase block mb-0.5">{section?.title}</span>
                      <h3 className="text-xs font-bold leading-tight group-hover:text-primary transition-colors line-clamp-3">{post.title}</h3>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* SECTION BLOCKS - Desktop Original */}
            {sections.map((section) => {
              const sectionPosts = sortedPosts.filter((p) => p.section === section.slug);
              if (sectionPosts.length === 0) return null;

              const pinnedPosts = sectionPosts.filter(p => p.isPinned).slice(0, 4);
              const regularPosts = sectionPosts.filter(p => !p.isPinned).slice(0, 16);
              const desktopHeroes = [...pinnedPosts];
              if (desktopHeroes.length < 4 && regularPosts.length > 0) {
                const needed = 4 - desktopHeroes.length;
                desktopHeroes.push(...regularPosts.slice(0, needed));
              }
              const desktopGridPosts = pinnedPosts.length >= 4 ? regularPosts : regularPosts.slice(4 - pinnedPosts.length);

              return (
                <div key={section.slug} className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-primary">{section.title}</h2>
                  {desktopHeroes.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      {desktopHeroes.map((post) => (
                        <Link key={post.id} to={`/${post.section}/${post.category}/${post.id}`} className="group">
                          <div className="aspect-video bg-gray-200 overflow-hidden mb-1.5 relative">
                            {post.image ? (
                              <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full bg-primary/10" />
                            )}
                            {post.videoUrl && (
                              <div className="absolute bottom-1 right-1 bg-primary rounded-full w-7 h-7 flex items-center justify-center">
                                <Play className="w-2.5 h-2.5 text-white fill-white ml-0.5" />
                              </div>
                            )}
                            {post.isPinned && (
                              <div className="absolute top-1.5 left-1.5 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded">FEATURED</div>
                            )}
                          </div>
                          <h3 className="text-xs font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                        </Link>
                      ))}
                    </div>
                  )}
                  {desktopGridPosts.length > 0 && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                      {desktopGridPosts.slice(0, 12).map((post) => (
                        <Link key={post.id} to={`/${post.section}/${post.category}/${post.id}`} className="group">
                          <div className="aspect-video bg-gray-200 overflow-hidden mb-1.5 relative">
                            {post.image ? (
                              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-primary/10" />
                            )}
                            {post.videoUrl && (
                              <div className="absolute bottom-1 right-1 bg-primary rounded-full w-7 h-7 flex items-center justify-center">
                                <Play className="w-2.5 h-2.5 text-white fill-white ml-0.5" />
                              </div>
                            )}
                          </div>
                          <h3 className="text-xs font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                        </Link>
                      ))}
                    </div>
                  )}
                  <div className="text-center">
                    <Link to={`/${section.slug}`} className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2 rounded text-sm transition-colors">
                      View All {section.title}
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* VIDEO SECTION */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Latest Videos & Podcasts</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {mediaItems
                  .slice(0, 8)
                  .map((media) => (
                    <div key={media.id} className="bg-white rounded overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                      <button
                        onClick={() => setActiveMedia(media)}
                        className="group block w-full text-left"
                      >
                        <div className="aspect-video bg-gray-900 overflow-hidden relative">
                          {media.thumbnail ? (
                            <img 
                              src={media.thumbnail} 
                              alt={media.title} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className={`w-full h-full ${media.type === 'video' ? 'bg-gradient-to-br from-blue-900 to-blue-700' : 'bg-gradient-to-br from-purple-900 to-purple-700'}`}>
                              <div className="flex items-center justify-center h-full">
                                {media.type === 'video' ? (
                                  <Video className="w-20 h-20 text-white/30" />
                                ) : (
                                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                                    <div className="w-10 h-10 rounded-full bg-white/40"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Premium Badge - Top Left */}
                          {media.isPremium && (
                            <div className="absolute top-2 left-2 z-10">
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-primary text-white text-[10px] font-bold">
                                <Crown className="w-2.5 h-2.5" />
                                PREMIUM
                              </span>
                            </div>
                          )}
                          
                          {/* Play Button - Bottom Right Corner */}
                          <div className="absolute bottom-2 right-2">
                            <div className={`rounded-full w-9 h-9 flex items-center justify-center ${media.isPremium ? 'bg-primary' : 'bg-blue-600'}`}>
                              {media.isPremium ? (
                                <Lock className="w-4 h-4 text-white" />
                              ) : (
                                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-3 pb-2">
                          <h3 className="font-bold text-xs leading-tight mb-2 text-gray-900 line-clamp-2 min-h-[32px] flex items-start gap-1.5">
                            <span className="flex-1">{media.title}</span>
                            {media.isPremium && (
                              <Crown className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                            )}
                          </h3>
                        </div>
                      </button>
                      
                      {/* MORE Link */}
                      <div className="px-3 pb-3">
                        <button
                          onClick={() => setActiveMedia(media)}
                          className={`text-[10px] font-bold uppercase tracking-wide ${media.isPremium ? 'text-primary hover:text-primary/80' : 'text-blue-600 hover:text-blue-700'}`}
                        >
                          {media.isPremium ? (
                            <span className="flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" />
                              UNLOCK
                            </span>
                          ) : (
                            'MORE'
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              
              {/* View All Media Link */}
              <div className="text-center mt-6">
                <Link
                  to="/media"
                  className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-5 py-2 rounded text-sm transition-colors"
                >
                  View All Videos & Podcasts
                  <Play className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* RESOURCES SECTION - Removed duplicate, already shown above */}
          </div>

          {/* RIGHT COLUMN - Just In Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white border border-gray-200">
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h2 className="font-bold text-sm">Just in</h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {justInPosts.map((post) => {
                  const section = navSections.find((s) => s.slug === post.section);
                  return (
                    <Link
                      key={post.id}
                      to={`/${post.section}/${post.category}/${post.id}`}
                      className="block p-4 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-xs text-gray-500 shrink-0">
                          {new Date(post.publishedAt).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        <span className="text-xs font-bold text-primary uppercase">
                          {section?.title}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                    </Link>
                  );
                })}
              </div>
              <div className="p-4 border-t border-gray-200 text-center">
                <Link to="/latest" className="text-sm text-primary font-semibold hover:underline">
                  See more →
                </Link>
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
