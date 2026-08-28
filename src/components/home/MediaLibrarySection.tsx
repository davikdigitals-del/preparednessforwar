import { Link } from "react-router-dom";
import { Video, Headphones, Download, ArrowRight, Play } from "lucide-react";
import type { MediaItem, LibraryItem } from "@/contexts/DataContext";

interface MediaLibrarySectionProps {
  mediaItems: MediaItem[];
  libraryItems: LibraryItem[];
}

export default function MediaLibrarySection({ mediaItems, libraryItems }: MediaLibrarySectionProps) {
  const videos = mediaItems.filter((m) => m.type === "video").slice(0, 3);
  const podcasts = mediaItems.filter((m) => m.type === "podcast").slice(0, 3);
  const resources = libraryItems.slice(0, 4);

  return (
    <div className="bg-foreground text-white py-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Videos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-black uppercase tracking-widest">Videos</h3>
              </div>
              <Link to="/media" className="flex items-center gap-1 text-xs text-primary hover:underline">
                All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {videos.map((video) => (
                <Link key={video.id} to="/media" className="group flex gap-3 items-center">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-14 flex-shrink-0 overflow-hidden bg-white/10">
                    {video.thumbnail ? (
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-5 h-5 text-white/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                      {video.title}
                    </h4>
                    <span className="text-[10px] text-white/50 mt-0.5 block">{video.duration}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Podcasts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-black uppercase tracking-widest">Podcasts</h3>
              </div>
              <Link to="/media" className="flex items-center gap-1 text-xs text-primary hover:underline">
                All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {podcasts.map((podcast) => (
                <Link key={podcast.id} to="/media" className="group flex gap-3 items-center">
                  {/* Thumbnail */}
                  <div className="relative w-20 h-14 flex-shrink-0 overflow-hidden bg-white/10">
                    {podcast.thumbnail ? (
                      <img src={podcast.thumbnail} alt={podcast.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Headphones className="w-5 h-5 text-white/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                      {podcast.title}
                    </h4>
                    <span className="text-[10px] text-white/50 mt-0.5 block">{podcast.duration}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Library */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-black uppercase tracking-widest">Library</h3>
              </div>
              <Link to="/library" className="flex items-center gap-1 text-xs text-primary hover:underline">
                All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {resources.map((resource) => (
                <Link key={resource.id} to="/library" className="group flex gap-3 items-center">
                  {/* Cover */}
                  <div className="w-10 h-14 flex-shrink-0 overflow-hidden bg-white/10 flex items-center justify-center">
                    {resource.coverImageUrl ? (
                      <img src={resource.coverImageUrl} alt={resource.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full ${resource.coverColor || "bg-primary/40"} flex items-center justify-center`}>
                        <span className="text-white font-black text-xs">{resource.title[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                      {resource.title}
                    </h4>
                    <span className="text-[10px] text-white/50 mt-0.5 block capitalize">{resource.format || "PDF"}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
