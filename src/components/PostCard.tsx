import { Link } from "react-router-dom";
import { Clock, Eye, Play } from "lucide-react";
import type { Post } from "@/data/mockData";
import { formatTimeAgo, navSections } from "@/data/mockData";

interface PostCardProps {
  post: Post;
  variant?: "default" | "hero" | "compact" | "horizontal";
}

export function PostCard({ post, variant = "default" }: PostCardProps) {
  const section = navSections.find((s) => s.slug === post.section);
  const sectionColor = section?.color || "category-emergency";

  if (variant === "hero") {
    const hasVideo = (post as any).videoUrl || (post as any).video_url;
    
    return (
      <Link to={`/${post.section}/${post.category}/${post.id}`} className="card-news group block">
        <div className="aspect-[16/9] bg-muted relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
          {hasVideo && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-blue-900/90 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <Play className="w-10 h-10 text-white fill-white ml-1" />
              </div>
            </div>
          )}
          {hasVideo && (
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 fill-white" />
              Video
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span className={`category-pill bg-${sectionColor} text-alert-foreground mb-2`}>
              {section?.title}
            </span>
            <h2 className="article-headline text-2xl md:text-3xl text-card mt-2">{post.title}</h2>
            <p className="text-card/80 text-sm mt-2 line-clamp-2">{post.standfirst}</p>
            <div className="flex items-center gap-4 mt-3 text-card/60 text-xs">
              <span>{post.author}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
              <span>{formatTimeAgo(post.publishedAt)}</span>
              {hasVideo && (
                <span className="ml-auto flex items-center gap-1 text-white font-bold">
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Watch Video
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "horizontal") {
    return (
      <Link to={`/${post.section}/${post.category}/${post.id}`} className="card-news group flex gap-4">
        <div className="w-32 h-24 bg-muted shrink-0 rounded-sm" />
        <div className="flex flex-col justify-center py-1 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {section?.title}
          </span>
          <h3 className="article-headline text-sm mt-0.5 line-clamp-2 group-hover:text-alert transition-colors">
            {post.title}
          </h3>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
            <span>{formatTimeAgo(post.publishedAt)}</span>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{(post.viewCount / 1000).toFixed(1)}k</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link to={`/${post.section}/${post.category}/${post.id}`} className="group flex items-start gap-3 py-2">
        <span className="text-lg font-display font-bold text-muted-foreground/40 shrink-0 w-6 text-right">
          {/* rank number injected externally */}
        </span>
        <div className="min-w-0">
          <h4 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-alert transition-colors">
            {post.title}
          </h4>
          <span className="text-xs text-muted-foreground mt-0.5 block">{formatTimeAgo(post.publishedAt)}</span>
        </div>
      </Link>
    );
  }

  // Default card - Professional government design
  const hasVideo = (post as any).videoUrl || (post as any).video_url;
  
  return (
    <Link to={`/${post.section}/${post.category}/${post.id}`} className="group block bg-white hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-blue-900">
      <div className="aspect-[16/10] bg-gray-100 overflow-hidden relative">
        {post.image && (
          <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        )}
        {hasVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
            <div className="w-16 h-16 rounded-full bg-blue-900 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </div>
          </div>
        )}
        {hasVideo && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wide flex items-center gap-1">
            <Play className="w-3 h-3 fill-white" />
            Video
          </div>
        )}
      </div>
      <div className="p-5">
        <span className="inline-block px-3 py-1 bg-blue-900 text-white text-xs font-bold uppercase tracking-wide mb-3">
          {section?.title}
        </span>
        <h3 className="font-display font-bold text-lg leading-snug line-clamp-2 text-gray-900 group-hover:text-blue-900 transition-colors mb-2">
          {post.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{post.standfirst}</p>
        <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-gray-100">
          <span className="font-semibold text-gray-700">{post.author}</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-900" />{post.readTime}</span>
          {hasVideo && (
            <span className="ml-auto flex items-center gap-1 text-red-600 font-bold">
              <Play className="w-3.5 h-3.5 fill-red-600" />
              Watch
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
