import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { PostCard } from "@/components/PostCard";
import { SidebarModules } from "@/components/SidebarModules";
import { ArrowRight, Tag } from "lucide-react";

const TagPage = () => {
  const { tag } = useParams<{ tag: string }>();
  const { publishedPosts } = useData();

  // Decode URL-encoded tag
  const decodedTag = tag ? decodeURIComponent(tag) : "";

  // Set page title
  useEffect(() => {
    document.title = `${decodedTag} | Preparedness For War`;
    
    return () => {
      document.title = "Preparedness For War - Latest News & Updates";
    };
  }, [decodedTag]);

  // Filter posts by tag
  const posts = publishedPosts.filter((p: any) => 
    p.tags && p.tags.some((t: string) => 
      t.toLowerCase() === decodedTag.toLowerCase()
    )
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Tag hero band */}
      <div className="bg-primary text-white">
        <div className="container py-8">
          <nav className="flex items-center gap-1.5 text-xs text-white/60 mb-3 flex-wrap">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>›</span>
            <span className="text-white">Tag: {decodedTag}</span>
          </nav>
          <div className="flex items-center gap-3">
            <Tag className="w-8 h-8" />
            <h1 className="font-display font-black text-3xl md:text-4xl">{decodedTag}</h1>
          </div>
          <p className="text-white/70 mt-2 text-sm">
            {posts.length} {posts.length === 1 ? 'article' : 'articles'} tagged with "{decodedTag}"
          </p>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <main>
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {posts.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-border p-12 text-center">
                <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto mb-4 rounded-full">
                  <Tag className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-bold text-lg mb-2">No articles found</h2>
                <p className="text-sm text-muted-foreground mb-5">
                  No articles have been tagged with "{decodedTag}" yet.
                </p>
                <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                  Back to Home <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </main>

          <div className="hidden lg:block">
            <SidebarModules />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagPage;
