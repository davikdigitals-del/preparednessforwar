import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Eye, Radio } from "lucide-react";
import { navSections, formatTimeAgo } from "@/data/mockData";
import { useData } from "@/contexts/DataContext";

export default function LatestPage() {
  const { publishedPosts } = useData();
  const allPosts = publishedPosts;
  const [sectionFilter, setSectionFilter] = useState("all");

  const sorted = [...allPosts]
    .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const filtered = sectionFilter === "all"
    ? sorted
    : sorted.filter((p: any) => p.section === sectionFilter);

  const isNew = (publishedAt: string) =>
    Date.now() - new Date(publishedAt).getTime() < 3 * 60 * 60 * 1000;

  return (
    <div className="bg-white min-h-screen">
      {/* Hero band */}
      <div className="bg-foreground text-white">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-2">
            <Radio className="w-5 h-5 text-red-400" />
            <h1 className="font-display font-black text-3xl md:text-4xl">Latest Stories</h1>
            <span className="w-2.5 h-2.5 bg-red-400 rounded-full animate-pulse" />
          </div>
          <p className="text-white/60 text-sm">All stories, newest first — updated in real time.</p>
        </div>
      </div>

      <div className="container py-6">
        {/* Section filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSectionFilter("all")}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${sectionFilter === "all" ? "bg-primary text-white" : "bg-white border border-border text-muted-foreground hover:border-primary hover:text-primary"}`}
          >
            All Sections
          </button>
          {navSections.map((s) => (
            <button
              key={s.slug}
              onClick={() => setSectionFilter(s.slug)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${sectionFilter === s.slug ? "bg-primary text-white" : "bg-white border border-border text-muted-foreground hover:border-primary hover:text-primary"}`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Post list */}
        <div className="bg-white border border-border divide-y divide-border">
          {filtered.map((post: any) => {
            const sec = navSections.find((s) => s.slug === post.section);
            const fresh = isNew(post.publishedAt);
            return (
              <Link
                key={post.id}
                to={`/${post.section}/${post.category}/${post.id}`}
                className="flex items-start gap-4 p-4 hover:bg-primary/5 transition-colors group"
              >
                {/* Thumbnail */}
                <div className="w-24 h-16 bg-muted shrink-0 overflow-hidden">
                  {post.image ? (
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <span className="text-primary/20 font-black text-xl">{sec?.title?.[0]}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {sec && (
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                        {sec.title}
                      </span>
                    )}
                    {fresh && (
                      <span className="flex items-center gap-1 text-[9px] font-black text-red-500 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        New
                      </span>
                    )}
                    {post.isPinned && (
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                        ★ Featured
                      </span>
                    )}
                  </div>
                  <h2 className="text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  {post.standfirst && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1 leading-relaxed">
                      {post.standfirst}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                    <span className="font-semibold text-foreground/60">{post.author}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTimeAgo(post.publishedAt)}
                    </span>
                    <span>{post.readTime}</span>
                    <span className="flex items-center gap-1 ml-auto">
                      <Eye className="w-2.5 h-2.5" />
                      {post.viewCount?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <p className="text-sm">No stories found for this section.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
