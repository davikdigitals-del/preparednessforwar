import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useData, type MediaItem } from "@/contexts/DataContext";
import { formatTimeAgo, navSections } from "@/data/mockData";
import { Clock, Play, Video, Eye, Headphones, ExternalLink, Crown, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

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
function MediaModal({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const { user } = useAuth();
  const { isPremium: hasPremiumAccess, loading: premiumLoading } = usePremiumStatus();
  const url = item.url || "";
  const embedUrl = getEmbedUrl(url);
  const direct = isDirectVideo(url);
  const audio = isAudio(url) || item.type === "podcast";

  // Check if content is premium and user doesn't have access
  const isPremiumLocked = item.isPremium && !hasPremiumAccess;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden gap-0">
        <DialogHeader className="px-5 pt-4 pb-3 border-b border-border">
          <DialogTitle className="text-sm font-bold line-clamp-1 pr-8 flex items-center gap-2">
            {item.title}
            {item.isPremium && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                <Crown className="w-3 h-3" />
                Premium
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {isPremiumLocked ? (
          /* Premium Gate */
          <div className="p-8">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-primary" />
                </div>

                <h3 className="text-2xl font-bold mb-2">Premium Content</h3>
                <p className="text-gray-600 mb-6">
                  This {item.type} is available exclusively to premium members. Upgrade now to unlock unlimited access.
                </p>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {user ? (
                    <>
                      <Button asChild size="lg" className="gap-2">
                        <Link to="/premium">
                          <Crown className="w-4 h-4" />
                          Upgrade to Premium
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg">
                        <Link to="/my-subscription">View Subscription</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild size="lg" className="gap-2">
                        <Link to="/signup">
                          <Crown className="w-4 h-4" />
                          Start Free Trial
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg">
                        <Link to="/login">Sign In</Link>
                      </Button>
                    </>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  Already a premium member? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
                </p>
              </CardContent>
            </Card>
          </div>
        ) : url ? (
          embedUrl && !direct ? (
            /* YouTube / Vimeo iframe */
            <div className="aspect-video">
              <iframe src={embedUrl} title={item.title} className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen />
            </div>
          ) : direct ? (
            /* Direct video file */
            <video controls autoPlay className="w-full max-h-[60vh] bg-black" src={url} />
          ) : audio ? (
            /* Audio / podcast */
            <div className="p-6 bg-muted flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-primary flex items-center justify-center">
                <Headphones className="w-10 h-10 text-white" />
              </div>
              <audio controls autoPlay className="w-full" src={url} />
            </div>
          ) : (
            /* Unknown URL — show open externally */
            <div className="aspect-video bg-muted flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Video className="w-12 h-12 opacity-30" />
              <p className="text-sm">Cannot embed this URL directly.</p>
              <a href={url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary underline">
                <ExternalLink className="w-3 h-3" /> Open in new tab
              </a>
            </div>
          )
        ) : (
          <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground">
            <p className="text-sm">No media URL provided yet.</p>
          </div>
        )}

        {url && !isPremiumLocked && (
          <div className="px-5 py-3 border-t border-border flex justify-end">
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-primary hover:underline">
              <ExternalLink className="w-3 h-3" /> Open externally
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

const Index = () => {
  const { publishedPosts, mediaItems, loading } = useData();
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const [sections, setSections] = useState<any[]>([]);

  // Set page title
  useEffect(() => {
    document.title = "Preparedness For War - Latest News & Updates";
  }, []);

  // Fetch sections from database
  useEffect(() => {
    const fetchSections = async () => {
      const { data } = await supabase
        .from("sections")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      
      if (data) setSections(data);
    };
    fetchSections();
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
  const featuredPosts = sortedPosts.slice(1, 10);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* HERO POST - Euronews style: Full-width image with overlay text */}
      {heroPost && (
        <Link to={`/${heroPost.section}/${heroPost.category}/${heroPost.id}`} className="block">
          <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-gray-900 overflow-hidden">
            {heroPost.image ? (
              <img
                src={heroPost.image}
                alt={heroPost.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
            )}
            
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            
            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
              <div className="max-w-4xl">
                {/* Category badge */}
                <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold uppercase tracking-wide rounded mb-3">
                  {navSections.find(s => s.slug === heroPost.section)?.title || heroPost.section}
                </span>
                
                {/* Title */}
                <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight mb-2 sm:mb-3">
                  {heroPost.title}
                </h1>
                
                {/* Standfirst - hidden on mobile */}
                <p className="hidden sm:block text-white/90 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl">
                  {heroPost.standfirst}
                </p>
              </div>
            </div>

            {/* Play button if video */}
            {heroPost.videoUrl && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full flex items-center justify-center shadow-2xl">
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white ml-1" />
                </div>
              </div>
            )}
          </div>
        </Link>
      )}

      {/* MAIN CONTENT - Euronews style: Vertical card stack */}
      <div className="max-w-7xl mx-auto px-0 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 sm:gap-6">
          {/* LEFT COLUMN - Story Cards */}
          <div className="lg:col-span-2 space-y-0 sm:space-y-4">
            {featuredPosts.map((post) => {
              const section = navSections.find((s) => s.slug === post.section);
              
              return (
                <Link
                  key={post.id}
                  to={`/${post.section}/${post.category}/${post.id}`}
                  className="block bg-white hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="sm:flex sm:gap-4 p-0 sm:p-4">
                    {/* Image */}
                    <div className="relative sm:w-64 sm:flex-shrink-0 aspect-video sm:aspect-[4/3] bg-gray-200 overflow-hidden">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5" />
                      )}
                      
                      {/* Category badge on image */}
                      <div className="absolute top-2 left-2">
                        <span className="inline-block px-2 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-wide">
                          {section?.title}
                        </span>
                      </div>

                      {/* Play button if video */}
                      {post.videoUrl && (
                        <div className="absolute bottom-2 right-2 bg-primary rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 sm:p-0">
                      <h2 className="font-bold text-lg sm:text-xl leading-tight mb-2 text-gray-900 hover:text-primary transition-colors line-clamp-3">
                        {post.title}
                      </h2>
                      
                      <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-2 sm:line-clamp-3">
                        {post.standfirst}
                      </p>
                      
                      {/* Meta info */}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(post.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.viewCount} views
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* RIGHT SIDEBAR - Most Read (Desktop only) */}
          <aside className="hidden lg:block">
            <div className="bg-white sticky top-20">
              <div className="bg-primary px-4 py-3">
                <h2 className="font-bold text-sm text-white uppercase tracking-wide">Most Read</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {sortedPosts.slice(0, 5).map((post, index) => (
                  <Link
                    key={post.id}
                    to={`/${post.section}/${post.category}/${post.id}`}
                    className="block p-4 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex gap-3">
                      <span className="text-3xl font-black text-gray-200 group-hover:text-primary transition-colors">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold leading-snug group-hover:text-primary transition-colors line-clamp-3">
                          {post.title}
                        </h3>
                        <span className="text-xs text-gray-500 mt-1 block">
                          {formatTimeAgo(post.publishedAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
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
