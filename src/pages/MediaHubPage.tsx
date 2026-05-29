import { useState } from "react";
import { Play, Clock, Eye, Headphones, Video, Search, Crown, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useData, type MediaItem } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { MediaPlayer } from "@/components/MediaPlayer";
import { Link } from "react-router-dom";

/* ── Media player modal ── */
function MediaModal({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const url = item.url || "";
  const { user } = useAuth();
  const { isPremium } = usePremiumStatus();

  // Premium gate — block if content is premium and user doesn't have subscription
  const isLocked = item.isPremium && !isPremium;

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

        {isLocked ? (
          /* Premium gate UI */
          <div className="aspect-video bg-gray-900 flex flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-1">Premium Content</h3>
              <p className="text-gray-400 text-sm mb-4">
                Subscribe to access this {item.type === "podcast" ? "podcast" : "video"} and all premium content.
              </p>
            </div>
            {user ? (
              <Button asChild className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
                <Link to="/subscribe" onClick={onClose}>
                  <Crown className="w-4 h-4 mr-2" /> Upgrade to Premium
                </Link>
              </Button>
            ) : (
              <Button asChild className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold">
                <Link to="/login?redirect=/media" onClick={onClose}>
                  Sign In to Subscribe
                </Link>
              </Button>
            )}
          </div>
        ) : url ? (
          <MediaPlayer
            url={url}
            title={item.title}
            isPremium={item.isPremium}
            type={item.type}
            thumbnail={item.thumbnail}
            mediaId={item.id}
          />
        ) : (
          <div className="aspect-video bg-gray-900 flex items-center justify-center text-gray-500">
            <p className="text-sm">No media URL provided yet.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ── Media card ── */
function MediaCard({ item, onClick }: { item: MediaItem; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group text-left w-full bg-white border border-border hover:border-primary hover:shadow-md transition-all overflow-hidden">
      {/* Mobile: horizontal layout. md+: vertical (thumbnail on top) */}
      <div className="flex flex-row md:flex-col">
        {/* Thumbnail */}
        <div className="relative overflow-hidden w-32 h-24 flex-shrink-0 md:w-full md:h-auto md:aspect-video">
          {item.thumbnail ? (
            <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
          ) : item.type === "video" ? (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Video className="w-8 h-8 text-primary/30" />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center">
              <Headphones className="w-8 h-8 text-foreground/20" />
            </div>
          )}

          {/* Type badge */}
          <div className="absolute top-1.5 left-1.5">
            <span className={`flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${item.type === "video" ? "bg-primary text-white" : "bg-foreground text-white"}`}>
              {item.type === "video" ? <Video className="w-2 h-2" /> : <Headphones className="w-2 h-2" />}
              {item.type}
            </span>
          </div>

          {/* Premium badge */}
          {item.isPremium && (
            <div className="absolute top-1.5 right-1.5">
              <span className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-black bg-yellow-500 text-black rounded">
                <Crown className="w-2 h-2" /> PREMIUM
              </span>
            </div>
          )}

          {/* Duration */}
          {item.duration && (
            <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[9px] px-1.5 py-0.5 font-semibold">
              {item.duration}
            </div>
          )}

          {/* Play overlay — desktop only */}
          <div className="hidden md:flex absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="w-12 h-12 bg-primary flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 text-white ml-0.5 fill-white" />
            </div>
          </div>
        </div>

        {/* Text content */}
        <div className="p-3 md:p-4 flex-1 min-w-0 flex flex-col justify-center">
          <h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {item.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
          <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground flex-wrap">
            <span className="font-semibold text-foreground/70 truncate max-w-[80px]">{item.author}</span>
            <span className="flex items-center gap-1"><Eye className="w-2.5 h-2.5" />{(item.views / 1000).toFixed(1)}k</span>
            <span className="flex items-center gap-1 md:hidden"><Clock className="w-2.5 h-2.5" />{item.duration}</span>
          </div>
          {/* Mobile play hint */}
          <div className="flex items-center gap-1 mt-2 text-[10px] text-primary font-semibold md:hidden">
            <Play className="w-3 h-3 fill-primary" /> Play
          </div>
        </div>
      </div>
    </button>
  );
}

/* ══════════════════════════════════════════════
   MEDIA HUB PAGE
══════════════════════════════════════════════ */
export default function MediaHubPage() {
  const { mediaItems } = useData();
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "video" | "podcast">("all");
  const [search, setSearch] = useState("");
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

  const filtered = mediaItems.filter((m) => {
    const matchType = filter === "all" || m.type === filter;
    const matchSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    const codes = m.countryCodes || [];
    const matchCountry = codes.length === 0 || (user ? codes.includes(user.country) : true);
    return matchType && matchSearch && matchCountry;
  });

  const videos = filtered.filter((m) => m.type === "video");
  const podcasts = filtered.filter((m) => m.type === "podcast");

  return (
    <div className="bg-[#f4f5f7] min-h-screen">
      {/* Hero band */}
      <div className="bg-primary text-white">
        <div className="container py-8">
          <h1 className="font-display font-black text-3xl md:text-4xl">Media Hub</h1>
          <p className="text-white/70 mt-2 text-sm">
            Videos, podcasts, and broadcasts to keep you informed and prepared.
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search media…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-white" />
          </div>
          <div className="flex gap-2">
            {(["all", "video", "podcast"] as const).map((t) => (
              <button key={t} onClick={() => setFilter(t)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${filter === t ? "bg-primary text-white" : "bg-white border border-border text-muted-foreground hover:border-primary hover:text-primary"}`}>
                {t === "all" ? "All" : t === "video" ? "Videos" : "Podcasts"}
              </button>
            ))}
          </div>
        </div>

        {/* Videos section */}
        {(filter === "all" || filter === "video") && videos.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-[3px] h-5 bg-primary" />
              <h2 className="font-display font-black text-base uppercase tracking-wide">Videos</h2>
              <span className="text-xs text-muted-foreground">({videos.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {videos.map((item) => (
                <MediaCard key={item.id} item={item} onClick={() => setActiveMedia(item)} />
              ))}
            </div>
          </div>
        )}

        {/* Podcasts section */}
        {(filter === "all" || filter === "podcast") && podcasts.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-[3px] h-5 bg-foreground" />
              <h2 className="font-display font-black text-base uppercase tracking-wide">Podcasts</h2>
              <span className="text-xs text-muted-foreground">({podcasts.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {podcasts.map((item) => (
                <MediaCard key={item.id} item={item} onClick={() => setActiveMedia(item)} />
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="bg-white border border-border p-16 text-center">
            <Video className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="font-bold text-lg mb-2">No media found</h2>
            <p className="text-sm text-muted-foreground">
              {search ? `No results for "${search}"` : "No media has been published yet. Check back soon!"}
            </p>
          </div>
        )}
      </div>

      {/* Player modal */}
      {activeMedia && <MediaModal item={activeMedia} onClose={() => setActiveMedia(null)} />}
    </div>
  );
}
