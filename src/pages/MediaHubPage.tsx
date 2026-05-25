import { useState } from "react";
import { Play, Clock, Eye, Headphones, Video, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useData, type MediaItem } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { MediaPlayer } from "@/components/MediaPlayer";

/* ── Media player modal ── */
function MediaModal({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  const url = item.url || "";

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden gap-0 bg-black border-gray-800">
        <DialogHeader className="px-5 pt-4 pb-3 border-b border-gray-800 bg-gray-900">
          <DialogTitle className="text-sm font-bold line-clamp-1 pr-8 text-white">{item.title}</DialogTitle>
          <p className="text-xs text-gray-400 mt-0.5">{item.author} · {item.duration}</p>
        </DialogHeader>

        {url ? (
          <MediaPlayer
            url={url}
            title={item.title}
            isPremium={item.isPremium}
            type={item.type}
            thumbnail={item.thumbnail}
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
      <div className="aspect-video bg-muted relative overflow-hidden">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
        ) : item.type === "video" ? (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Video className="w-10 h-10 text-primary/30" />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center">
            <Headphones className="w-10 h-10 text-foreground/20" />
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${item.type === "video" ? "bg-primary text-white" : "bg-foreground text-white"}`}>
            {item.type === "video" ? <Video className="w-2.5 h-2.5" /> : <Headphones className="w-2.5 h-2.5" />}
            {item.type}
          </span>
        </div>

        {/* Duration */}
        {item.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[9px] px-1.5 py-0.5 font-semibold">
            {item.duration}
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="w-12 h-12 bg-primary flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 text-white ml-0.5 fill-white" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors leading-snug">
          {item.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{item.description}</p>
        <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
          <span className="font-semibold text-foreground/70">{item.author}</span>
          <span className="flex items-center gap-1"><Eye className="w-2.5 h-2.5" />{(item.views / 1000).toFixed(1)}k</span>
          <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{item.duration}</span>
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
