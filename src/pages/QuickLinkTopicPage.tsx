import { useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { publicSupabase as supabase } from "@/integrations/supabase/publicClient";
import { navSections } from "@/data/mockData";

export default function QuickLinkTopicPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sectionSlug = String(params.section || '');
  const topicSlug = String(params.category || '');

  // Find the section and topic info safely
  let section = null;
  let topic = null;

  try {
    section = navSections.find(s => s.slug === sectionSlug) || null;
    if (section && section.tools) {
      topic = section.tools.find(t => t.slug === topicSlug) || null;
    }
  } catch (err) {
    console.error('Error finding section/topic:', err);
  }

  useEffect(() => {
    const loadPosts = async () => {
      if (!sectionSlug || !topicSlug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("posts")
          .select("*")
          .eq("section", sectionSlug)
          .eq("quick_link_topic", topicSlug)
          .eq("is_published", true)
          .order("published_at", { ascending: false });

        if (fetchError) {
          console.error("Error:", fetchError);
          setError(String(fetchError.message || 'Failed to load'));
          setPosts([]);
        } else {
          setPosts(data || []);
        }
      } catch (err) {
        console.error("Exception:", err);
        setError('Failed to load posts');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [sectionSlug, topicSlug]);

  // Redirect if invalid
  if (!section || !topic) {
    return <Navigate to="/404" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  const sectionTitle = String(section.title || 'Section');
  const topicTitle = String(topic.title || 'Topic');
  const postCount = posts.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <Link
            to={`/${sectionSlug}`}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to {sectionTitle}
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">{topicTitle}</h1>
        <p className="text-base sm:text-lg text-gray-600 mb-8">{sectionTitle} - {topicTitle}</p>
        <p className="text-sm text-gray-500 mb-8">{postCount} articles</p>

        {postCount === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <h3 className="text-lg font-semibold mb-2">No articles yet</h3>
            <p className="text-gray-600 mb-6">No articles assigned to this topic.</p>
            <Link
              to={`/${sectionSlug}`}
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Browse {sectionTitle}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const postId = String(post.id || '');
              const postTitle = String(post.title || 'Untitled');
              const postCategory = String(post.category || 'general');
              const postImage = post.image_url ? String(post.image_url) : null;
              const postExcerpt = post.excerpt ? String(post.excerpt) : null;
              const postAuthor = post.author ? String(post.author) : 'Staff Writer';

              return (
                <article key={postId} className="bg-white rounded-lg shadow-sm">
                  <Link to={`/${sectionSlug}/${postCategory}/${postId}`}>
                    {postImage && (
                      <div className="aspect-video rounded-t-lg overflow-hidden">
                        <img
                          src={postImage}
                          alt={postTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-3 sm:p-6">
                      <h2 className="text-sm sm:text-lg lg:text-xl font-semibold mb-2 line-clamp-2">{postTitle}</h2>
                      {postExcerpt && (
                        <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-3">{postExcerpt}</p>
                      )}
                      <p className="text-xs sm:text-sm text-gray-500">By {postAuthor}</p>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
