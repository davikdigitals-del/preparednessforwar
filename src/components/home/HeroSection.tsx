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

        {/* Main Featured — newspaper style: text left, image right */}
        <Link
          to={`/${featuredPost.section}/${featuredPost.category}/${featuredPost.id}`}
          className="group block"
        >
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-6 items-start">
            {/* Left: Text */}
            <div className="flex flex-col justify-start">
              {featuredPost.isPinned && (
                <span className="inline-block bg-primary text-white px-2 py-0.5 text-[10px] font-black uppercase tracking-widest mb-3 w-fit">
                  Featured
                </span>
              )}
              <h1 className="font-display font-black text-2xl md:text-3xl lg:text-4xl leading-tight group-hover:text-primary transition-colors">
                {featuredPost.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed line-clamp-3">
                {featuredPost.standfirst}
              </p>
              <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
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
            </div>

            {/* Right: Image */}
            <div className="aspect-[4/3] bg-muted overflow-hidden">
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
