import { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { publicSupabase as supabase } from "@/integrations/supabase/publicClient";
import { navSections } from "@/data/mockData";
import { Clock, Eye, ArrowLeft } from "lucide-react";

export default function QuickLinkTopicPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  
  const sectionSlug = params.section || '';
  const topicSlug = params.category || '';
  
  // Find the section and topic info
  const section = navSections.find(s => s.slug === sectionSlug);
  const topic = section?.tools?.find(t => t.slug === topicSlug);

  useEffect(() => {
    const loadTopicPosts = async () => {
      if (!sectionSlug || !topicSlug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("section", sectionSlug)
          .eq("quick_link_topic", topicSlug)
          .eq("is_published", true)
          .order("published_at", { ascending: false });

        if (error) {
          console.error("Error loading topic posts:", error);
          setPosts([]);
        } else {
          setPosts(data || []);
        }
      } catch (err) {
        console.error("Exception loading topic posts:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadTopicPosts();
  }, [sectionSlug, topicSlug]);

  // If section or topic doesn't exist, redirect to 404
  if (!section || !topic) {
    return <Navigate to="/404" replace />;
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <Link 
            to={`/${sectionSlug}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {section.title}
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{topic.title}</h1>
          <p className="text-xl text-gray-600 mb-4">
            {section.title} - {topic.title}
          </p>
          <div className="text-sm text-gray-500">
            {posts.length} article{posts.length !== 1 ? 's' : ''}
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <h3 className="text-lg font-semibold mb-2">No articles yet</h3>
            <p className="text-gray-600 mb-6">
              No articles have been assigned to this topic.
            </p>
            <Link 
              to={`/${sectionSlug}`}
              className="inline-flex bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Browse {section.title}
            </Link>
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
                        alt={post.title || 'Article'}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      {post.published_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(post.published_at)}
                        </span>
                      )}
                      {post.view_count && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.view_count}
                        </span>
                      )}
                    </div>
                    
                    <h2 className="text-xl font-semibold mb-2 line-clamp-2 hover:text-blue-600">
                      {post.title || 'Untitled'}
                    </h2>
                    
                    {post.excerpt && (
                      <p className="text-gray-600 line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {post.author || 'Staff Writer'}
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
