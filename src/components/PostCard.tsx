import { Link } from "react-router-dom";
import { Clock, Eye } from "lucide-react";
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
    return (
      <Link to={`/${post.section}/${post.category}/${post.id}`} className="card-news group block">
        <div className="aspect-[16/9] bg-muted relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
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

  // Default card
  return (
    <Link to={`/${post.section}/${post.category}/${post.id}`} className="card-news group block">
      <div className="aspect-[16/10] bg-muted" />
      <div className="p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {section?.title}
        </span>
        <h3 className="article-headline text-base mt-1 line-clamp-2 group-hover:text-alert transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{post.standfirst}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          <span>{post.author}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
        </div>
      </div>
    </Link>
  );
}
