import { Link } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { formatTimeAgo, navSections } from "@/data/mockData";
import { Clock, Play } from "lucide-react";

const Index = () => {
  const { publishedPosts, mediaItems, loading } = useData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const sortedPosts = [...publishedPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const heroPost = sortedPosts[0];
  const topStories = sortedPosts.slice(1, 4);
  const gridStories = sortedPosts.slice(4, 16);
  const justInPosts = sortedPosts.slice(0, 15);
  const mostReadPosts = [...publishedPosts].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* LEFT COLUMN - Main Content */}
          <div>
            {/* HERO SECTION */}
            {heroPost && (
              <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 mb-6">
                {/* Large Story */}
                <Link to={`/${heroPost.section}/${heroPost.category}/${heroPost.id}`} className="group">
                  <h1 className="text-4xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors">
                    {heroPost.title}
                  </h1>
                  <p className="text-gray-600 text-base leading-relaxed mb-3">
                    {heroPost.standfirst}
                  </p>
                </Link>

                {/* Hero Image */}
                <Link to={`/${heroPost.section}/${heroPost.category}/${heroPost.id}`} className="group">
                  <div className="aspect-[4/3] bg-gray-200 overflow-hidden relative">
                    {heroPost.image ? (
                      <img
                        src={heroPost.image}
                        alt={heroPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10" />
                    )}
                    <div className="absolute bottom-2 right-2 bg-primary rounded-full w-12 h-12 flex items-center justify-center">
                      <Play className="w-5 h-5 text-white fill-white ml-1" />
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* 3 TOP STORIES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {topStories.map((post) => {
                const section = navSections.find((s) => s.slug === post.section);
                return (
                  <Link
                    key={post.id}
                    to={`/${post.section}/${post.category}/${post.id}`}
                    className="group"
                  >
                    <div className="aspect-video bg-gray-200 overflow-hidden mb-2 relative">
                      {post.image ? (
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/10" />
                      )}
                      <div className="absolute bottom-2 right-2 bg-primary rounded-full w-10 h-10 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-primary uppercase block mb-1">
                      {section?.title}
                    </span>
                    <h3 className="text-sm font-bold leading-snug group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                );
              })}
            </div>

            {/* GRID OF STORIES (2 columns side by side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-8">
              {gridStories.map((post) => {
                const section = navSections.find((s) => s.slug === post.section);
                return (
                  <Link
                    key={post.id}
                    to={`/${post.section}/${post.category}/${post.id}`}
                    className="group flex gap-3"
                  >
                    <div className="w-32 h-24 bg-gray-200 shrink-0 overflow-hidden relative">
                      {post.image ? (
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-primary/10" />
                      )}
                      {post.section === "media" && (
                        <div className="absolute bottom-1 right-1 bg-primary rounded-full w-8 h-8 flex items-center justify-center">
                          <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-gray-500 uppercase block mb-1">
                        {section?.title}
                      </span>
                      <h3 className="text-sm font-bold leading-snug group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* SECTION BLOCKS */}
            {navSections.slice(0, 4).map((section) => {
              const sectionPosts = sortedPosts
                .filter((p) => p.section === section.slug)
                .slice(0, 4);

              if (sectionPosts.length === 0) return null;

              return (
                <div key={section.slug} className="mb-12">
                  <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {sectionPosts.map((post) => (
                      <Link
                        key={post.id}
                        to={`/${post.section}/${post.category}/${post.id}`}
                        className="group"
                      >
                        <div className="aspect-video bg-gray-200 overflow-hidden mb-2">
                          {post.image ? (
                            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-primary/10" />
                          )}
                        </div>
                        <h3 className="text-sm font-bold leading-snug group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* MOST READ SECTION */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Most read</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {mostReadPosts.map((post, index) => (
                  <Link
                    key={post.id}
                    to={`/${post.section}/${post.category}/${post.id}`}
                    className="group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-5xl font-black text-primary/20 group-hover:text-primary/40 transition-colors leading-none">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="text-sm font-bold leading-snug group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Just In Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white border border-gray-200">
              <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h2 className="font-bold text-sm">Just in</h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {justInPosts.map((post) => {
                  const section = navSections.find((s) => s.slug === post.section);
                  return (
                    <Link
                      key={post.id}
                      to={`/${post.section}/${post.category}/${post.id}`}
                      className="block p-4 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-xs text-gray-500 shrink-0">
                          {new Date(post.publishedAt).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        <span className="text-xs font-bold text-primary uppercase">
                          {section?.title}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                    </Link>
                  );
                })}
              </div>
              <div className="p-4 border-t border-gray-200 text-center">
                <Link to="/latest" className="text-sm text-primary font-semibold hover:underline">
                  See more →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Index;
