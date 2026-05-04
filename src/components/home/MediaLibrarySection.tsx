import { Link } from "react-router-dom";
import { Video, Headphones, Download, ArrowRight } from "lucide-react";
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
            <div className="flex items-center gap-2 mb-4">
              <Video className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-black uppercase tracking-widest">Videos</h3>
            </div>
            <div className="space-y-3">
              {videos.map((video) => (
                <Link
                  key={video.id}
                  to="/media"
                  className="block group"
                >
                  <h4 className="text-xs font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </h4>
                  <span className="text-[10px] text-white/60 mt-1 block">
                    {video.duration}
                  </span>
                </Link>
              ))}
            </div>
            <Link
              to="/media"
              className="flex items-center gap-1 text-xs text-primary hover:underline mt-4"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Podcasts */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Headphones className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-black uppercase tracking-widest">Podcasts</h3>
            </div>
            <div className="space-y-3">
              {podcasts.map((podcast) => (
                <Link
                  key={podcast.id}
                  to="/media"
                  className="block group"
                >
                  <h4 className="text-xs font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {podcast.title}
                  </h4>
                  <span className="text-[10px] text-white/60 mt-1 block">
                    {podcast.duration}
                  </span>
                </Link>
              ))}
            </div>
            <Link
              to="/media"
              className="flex items-center gap-1 text-xs text-primary hover:underline mt-4"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Library */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Download className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-black uppercase tracking-widest">Library</h3>
            </div>
            <div className="space-y-3">
              {resources.map((resource) => (
                <Link
                  key={resource.id}
                  to="/library"
                  className="block group"
                >
                  <h4 className="text-xs font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {resource.title}
                  </h4>
                  <span className="text-[10px] text-white/60 mt-1 block capitalize">
                    {resource.type}
                  </span>
                </Link>
              ))}
            </div>
            <Link
              to="/library"
              className="flex items-center gap-1 text-xs text-primary hover:underline mt-4"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
