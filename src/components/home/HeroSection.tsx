import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
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
          {/* Mobile: image top, text below. Desktop: text left, image right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

            {/* Image — top on mobile (order-1), right on desktop (order-2) */}
            <div className="w-full overflow-hidden order-1 md:order-2" style={{ minHeight: '220px' }}>
              {featuredPost.image ? (
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                  style={{ minHeight: '220px' }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center" style={{ minHeight: '220px' }}>
                  <span className="text-primary/20 font-black text-6xl">
                    {featuredPost.title[0]}
                  </span>
                </div>
              )}
            </div>

            {/* Text — below image on mobile (order-2), left on desktop (order-1) */}
            <div className="flex flex-col justify-center py-2 order-2 md:order-1">
              {featuredPost.isPinned && (
                <span className="inline-block bg-primary text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-widest mb-3 w-fit">
                  Featured
                </span>
              )}
              <h1 className="font-display font-black text-2xl md:text-3xl lg:text-4xl leading-[1.1] group-hover:text-primary transition-colors">
                {featuredPost.title}
              </h1>
              {/* Standfirst — always visible */}
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed line-clamp-3 md:line-clamp-4">
                {featuredPost.standfirst?.replace(/<[^>]*>/g, "") || ""}
              </p>
              <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(featuredPost.publishedAt)}
                </span>
                <span>·</span>
                <span>{featuredPost.author}</span>
              </div>
            </div>

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
