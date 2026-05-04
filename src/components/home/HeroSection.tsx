import { Link } from "react-router-dom";
import { Clock, Eye } from "lucide-react";
import { formatTimeAgo } from "@/data/mockData";

interface HeroSectionProps {
  featuredPost: any;
  sidebarPosts: any[];
  allPosts: any[];
}

export default function HeroSection({ featuredPost, sidebarPosts }: HeroSectionProps) {
  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* Main Featured */}
        <Link
          to={`/${featuredPost.section}/${featuredPost.category}/${featuredPost.id}`}
          className="group block"
        >
          <div className="aspect-[16/9] bg-muted overflow-hidden relative">
            {featuredPost.image ? (
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <span className="text-primary/20 font-black text-6xl">
                  {featuredPost.title[0]}
                </span>
              </div>
            )}
            {featuredPost.isPinned && (
              <span className="absolute top-3 left-3 bg-primary text-white px-2 py-1 text-[10px] font-black uppercase tracking-widest">
                Featured
              </span>
            )}
          </div>
          <h1 className="font-display font-black text-2xl md:text-3xl leading-tight mt-4 group-hover:text-primary transition-colors">
            {featuredPost.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
            {featuredPost.standfirst}
          </p>
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(featuredPost.publishedAt)}
            </span>
            <span>·</span>
            <span>{featuredPost.author}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {featuredPost.viewCount.toLocaleString()}
            </span>
          </div>
        </Link>

        {/* Sidebar Posts */}
        <div className="space-y-3">
          {sidebarPosts.map((post) => (
            <Link
              key={post.id}
              to={`/${post.section}/${post.category}/${post.id}`}
              className="group flex gap-3 pb-3 border-b border-border last:border-0"
            >
              <div className="w-24 h-20 bg-muted shrink-0 overflow-hidden">
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  {formatTimeAgo(post.publishedAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
