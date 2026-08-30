import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { publicSupabase as supabase } from "@/integrations/supabase/publicClient";
import { navSections } from "@/data/mockData";
import { Clock, Eye, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useData } from "@/contexts/DataContext";

export default function QuickLinkTopicPage() {
  const params = useParams<{ section?: string; category?: string }>();
  const sectionSlug = params.section;
  const topicSlug = params.category;
  const { publishedPosts, loading: dataLoading } = useData();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);

  // Find the section and topic info
  const section = sectionSlug ? navSections.find(s => s.slug === sectionSlug) : undefined;
  const topic = section?.tools?.find(t => t.slug === topicSlug);

  // If section or topic doesn't exist, redirect to 404
  if (!sectionSlug || !topicSlug || !section || !topic) {
    return <Navigate to="/404" replace />;
  }

  useEffect(() => {
    const loadTopicPosts = async () => {
      try {
        setLoading(true);

        // Get posts assigned to this specific quick link topic
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("section", sectionSlug)
          .eq("quick_link_topic", topicSlug)
          .eq("is_published", true)
          .order("published_at", { ascending: false });

        if (error) {
          console.error("Error loading topic posts:", error);
          return;
        }

        setPosts(data || []);
      } catch (err) {
        console.error("Exception loading topic posts:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTopicPosts();
  }, [sectionSlug, topicSlug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to={`/${sectionSlug}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {section.title}
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{topic.title}</h1>
          <p className="text-xl text-gray-600">
            Articles and resources about {topic.title.toLowerCase()} in {section.title.toLowerCase()}
          </p>
          <div className="mt-4 text-sm text-gray-500">
            {posts.length} article{posts.length !== 1 ? 's' : ''} available
          </div>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles yet</h3>
              <p className="text-gray-600 mb-6">
                No articles have been assigned to this topic yet. Check back later for updates.
              </p>
              <Link
                to={`/${sectionSlug}`}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse {section.title}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article key={post.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Link to={`/${sectionSlug}/${post.category}/${post.id}`}>
                  {post.image_url && (
                    <div className="aspect-video rounded-t-lg overflow-hidden">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(post.published_at)}
                      </span>
                      {post.view_count && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.view_count}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                      {post.title}
                    </h2>

                    {post.excerpt && (
                      <p className="text-gray-600 line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        By {post.author || 'Staff Writer'}
                      </span>
                      <span className="text-blue-600 font-medium">
                        Read more →
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}