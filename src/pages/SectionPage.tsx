import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { useNavSections } from "@/hooks/useNavSections";
import { PostCard } from "@/components/PostCard";
import { SidebarModules } from "@/components/SidebarModules";
import { ArrowRight } from "lucide-react";

const SectionPage = () => {
  const { section, category } = useParams<{ section: string; category?: string }>();
  const { publishedPosts, loading } = useData();
  const { sections: navSections } = useNavSections(); // Use database sections

  const allPosts = publishedPosts;
  const sectionData = navSections.find((s) => s.slug === section);

  const posts = allPosts.filter((p: any) => {
    const matchSection = p.section === section;
    const matchCategory = !category || p.category === category;
    return matchSection && matchCategory;
  });

  // Debug
  console.log(`📄 SectionPage: section="${section}" category="${category}"`);
  console.log(`📄 All posts:`, allPosts.map((p: any) => ({ section: p.section, category: p.category, title: p.title })));
  console.log(`📄 Filtered posts:`, posts.length);

  // Find category from sectionData categories (which now includes DB categories)
  const categoryData = category
    ? sectionData?.categories.find((c: any) => c.slug === category)
    : null;

  // Fallback: derive title from slug if category not found in sections
  const categoryTitle = categoryData?.title ||
    (category ? category.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : null);

  const pageTitle =
    categoryTitle ||
    sectionData?.title ||
    section?.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
    "Section";

  // Set page title
  useEffect(() => {
    document.title = `${pageTitle} | Preparedness For War`;

    // Reset title when leaving page
    return () => {
      document.title = "Preparedness For War - Latest News & Updates";
    };
  }, [pageTitle]);

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
            {categoryTitle && (
              <>
                <span>›</span>
                <span className="text-white">{categoryTitle}</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-6">
          <main>
            {/* Loading skeleton — prevents flash of empty state */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse border border-gray-200">
                    <div className="aspect-[16/10] bg-gray-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                      <div className="h-5 bg-gray-200 rounded w-full" />
                      <div className="h-5 bg-gray-200 rounded w-4/5" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
