import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFeaturedPosts } from "@/hooks/useFeaturedPosts";

export default function DebugFeaturedPosts() {
  const [rawData, setRawData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const featuredMap = useFeaturedPosts();

  useEffect(() => {
    const fetchData = async () => {
      console.log("🔍 Fetching all pinned posts...");
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, section, category, is_pinned, status, published_at")
        .eq("status", "published")
        .eq("is_pinned", true)
        .order("published_at", { ascending: false });

      if (error) {
        console.error("❌ Error:", error);
        setError(error.message);
      } else {
        console.log("✅ Data:", data);
        setRawData(data || []);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Featured Posts Debug</h1>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-red-900 mb-2">❌ Error</h2>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Raw Database Query */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">📊 Raw Database Query (Pinned Posts)</h2>
        <p className="text-sm text-gray-600 mb-4">
          Direct query: <code className="bg-gray-100 px-2 py-1 rounded">posts WHERE status='published' AND is_pinned=true</code>
        </p>
        
        {rawData.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <p className="text-yellow-800 font-semibold">⚠️ No pinned posts found!</p>
            <p className="text-sm text-yellow-700 mt-2">
              Either you haven't pinned any posts yet, or there's an RLS permission issue.
            </p>
            <p className="text-sm text-yellow-700 mt-2">
              <strong>Solution:</strong> Run the SQL script <code className="bg-yellow-100 px-1 rounded">database/FIX_FEATURED_POSTS_SIMPLE.sql</code> in Supabase.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-2 border">Title</th>
                  <th className="text-left p-2 border">Section</th>
                  <th className="text-left p-2 border">Category</th>
                  <th className="text-left p-2 border">Pinned</th>
                  <th className="text-left p-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {rawData.map((post) => (
                  <tr key={post.id} className="border-b">
                    <td className="p-2 border">{post.title}</td>
                    <td className="p-2 border">{post.section}</td>
                    <td className="p-2 border">{post.category}</td>
                    <td className="p-2 border">
                      <span className={`px-2 py-1 rounded text-xs ${post.is_pinned ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                        {post.is_pinned ? '✅ Yes' : '❌ No'}
                      </span>
                    </td>
                    <td className="p-2 border">{post.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Featured Map from Hook */}
      <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">🔧 Featured Map (from useFeaturedPosts hook)</h2>
        <p className="text-sm text-gray-600 mb-4">
          This is what the mega menu actually uses.
        </p>

        {Object.keys(featuredMap).length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <p className="text-yellow-800 font-semibold">⚠️ Featured map is empty!</p>
            <p className="text-sm text-yellow-700 mt-2">
              The hook didn't find any pinned posts. Check the raw query above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(featuredMap).map(([section, posts]) => (
              <div key={section} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-2 capitalize">{section}</h3>
                {posts.length === 0 ? (
                  <p className="text-gray-500 text-sm">No featured posts</p>
                ) : (
                  <ul className="space-y-2">
                    {posts.map((post) => (
                      <li key={post.id} className="flex items-start gap-3 text-sm">
                        {post.image && (
                          <img src={post.image} alt="" className="w-16 h-16 object-cover rounded" />
                        )}
                        <div>
                          <p className="font-semibold">{post.title}</p>
                          <p className="text-gray-600 text-xs">
                            Category: {post.category}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mt-8">
        <h2 className="text-xl font-bold text-blue-900 mb-4">📋 How to Fix</h2>
        <ol className="list-decimal list-inside space-y-3 text-blue-900">
          <li>Go to your Supabase Dashboard</li>
          <li>Navigate to <strong>SQL Editor</strong></li>
          <li>Run the script: <code className="bg-blue-100 px-2 py-1 rounded">database/FIX_FEATURED_POSTS_SIMPLE.sql</code></li>
          <li>Pin some posts in the <strong>Admin Posts</strong> page</li>
          <li>Refresh this page to see the results</li>
        </ol>
      </div>
    </div>
  );
}
