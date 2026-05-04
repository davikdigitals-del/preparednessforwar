import { useParams, Link } from "react-router-dom";
import { navSections } from "@/data/mockData";
import { PostCard } from "@/components/PostCard";
import { SidebarModules } from "@/components/SidebarModules";
import { useData } from "@/contexts/DataContext";
import { ArrowRight } from "lucide-react";

const SectionPage = () => {
  const { section, category } = useParams<{ section: string; category?: string }>();
  const { publishedPosts } = useData();

  const allPosts = publishedPosts;
  const sectionData = navSections.find((s) => s.slug === section);

  const posts = allPosts.filter((p: any) => {
    const matchSection = p.section === section;
    const matchCategory = !category || p.category === category;
    return matchSection && matchCategory;
  });

  const categoryData = category ? sectionData?.categories.find((c) => c.slug === category) : null;
  const pageTitle =
    categoryData?.title ||
    sectionData?.title ||
    section?.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
    "Section";

  return (
    <div className="bg-white min-h-screen">
      {/* Section hero band */}
      <div className="bg-primary text-white">
        <div className="container py-8">
          <nav className="flex items-center gap-1.5 text-xs text-white/60 mb-3 flex-wrap">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>›</span>
            {sectionData && (
              <Link to={`/${section}`} className="hover:text-white transition-colors">
                {sectionData.title}
              </Link>
            )}
            {categoryData && (
              <>
                <span>›</span>
                <span className="text-white">{categoryData.title}</span>
              </>
            )}
          </nav>
          <h1 className="font-display font-black text-3xl md:text-4xl">{pageTitle}</h1>
          <p className="text-white/70 mt-2 text-sm">
            Latest articles and resources in {pageTitle.toLowerCase()}.
          </p>

          {/* Category pills */}
          {sectionData && !category && (
            <div className="flex flex-wrap gap-2 mt-5">
              <Link to={`/${section}`}
                className="px-3 py-1 bg-white text-primary text-xs font-bold uppercase tracking-wide">
                All
              </Link>
              {sectionData.categories.map((cat) => (
                <Link key={cat.slug} to={`/${section}/${cat.slug}`}
                  className="px-3 py-1 bg-white/10 text-white text-xs font-semibold uppercase tracking-wide hover:bg-white hover:text-primary transition-colors">
                  {cat.title}
                </Link>
              ))}
            </div>
          )}
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
                <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="font-display font-black text-2xl text-primary">{pageTitle[0]}</span>
                </div>
                <h2 className="font-bold text-lg mb-2">No articles yet</h2>
                <p className="text-sm text-muted-foreground mb-5">
                  No articles have been published in this section yet. Check back soon!
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

export default SectionPage;
