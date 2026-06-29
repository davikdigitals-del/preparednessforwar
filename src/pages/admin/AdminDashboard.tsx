import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText,
  Image,
  Library,
  Eye,
  Plus,
  TrendingUp,
  Megaphone,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    premiumPosts: 0,
    totalMedia: 0,
    totalLibrary: 0,
  });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const dataPromise = Promise.all([
        supabase.from("posts").select("is_published, is_premium", { count: "exact" }),
        supabase.from("media_items").select("id", { count: "exact" }),
        supabase.from("library_items").select("id", { count: "exact" }),
      ]);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Dashboard load timeout")), 8000)
      );

      const [postsRes, mediaRes, libraryRes] = await Promise.race([
        dataPromise,
        timeoutPromise,
      ]) as any;

      const posts = postsRes.data || [];

      setStats({
        totalPosts: posts.length,
        publishedPosts: posts.filter((p: any) => p.is_published === true).length,
        draftPosts: posts.filter((p: any) => !p.is_published).length,
        premiumPosts: posts.filter((p: any) => p.is_premium).length,
        totalMedia: mediaRes.count || 0,
        totalLibrary: libraryRes.count || 0,
      });

      const recentPromise = supabase
        .from("posts")
        .select("id, title, status, created_at, is_premium")
        .order("created_at", { ascending: false })
        .limit(5);

      const recentTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Recent posts timeout")), 5000)
      );

      const { data: recent } = await Promise.race([
        recentPromise,
        recentTimeout,
      ]) as any;

      setRecentPosts(recent || []);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      setStats({
        totalPosts: 0,
        publishedPosts: 0,
        draftPosts: 0,
        premiumPosts: 0,
        totalMedia: 0,
        totalLibrary: 0,
      });
      setRecentPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Posts",
      value: stats.totalPosts,
      subtitle: `${stats.publishedPosts} published, ${stats.draftPosts} drafts`,
      icon: FileText,
      color: "bg-blue-500",
    },
    {
      title: "Premium Posts",
      value: stats.premiumPosts,
      subtitle: "Premium content",
      icon: TrendingUp,
      color: "bg-amber-500",
    },
    {
      title: "Media Items",
      value: stats.totalMedia,
      subtitle: "Videos & podcasts",
      icon: Image,
      color: "bg-purple-500",
    },
    {
      title: "Library Docs",
      value: stats.totalLibrary,
      subtitle: "PDFs & guides",
      icon: Library,
      color: "bg-green-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your admin portal</p>
        </div>
        <Link
          to="/admin/posts"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 w-fit"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.title}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.subtitle}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Recent Posts</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentPosts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No posts yet</div>
          ) : (
            recentPosts.map((post) => (
              <div key={post.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{post.title}</h3>
                    {post.is_premium && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                        Premium
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(post.created_at).toLocaleDateString()} •{" "}
                    <span className="capitalize">{post.status}</span>
                  </div>
                </div>
                <Link
                  to="/admin/posts"
                  className="text-sm text-primary hover:underline"
                >
                  Edit
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/posts"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:border-primary transition-colors"
        >
          <FileText className="w-8 h-8 text-primary mb-3" />
          <h3 className="font-semibold mb-1">Manage Posts</h3>
          <p className="text-sm text-gray-600">Create and edit articles</p>
        </Link>
        <Link
          to="/admin/banner"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:border-primary transition-colors"
        >
          <Megaphone className="w-8 h-8 text-orange-500 mb-3" />
          <h3 className="font-semibold mb-1">Banner</h3>
          <p className="text-sm text-gray-600">Manage site-wide banner</p>
        </Link>
        <Link
          to="/admin/analytics"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:border-primary transition-colors"
        >
          <Eye className="w-8 h-8 text-blue-500 mb-3" />
          <h3 className="font-semibold mb-1">Analytics</h3>
          <p className="text-sm text-gray-600">View performance metrics</p>
        </Link>
        <Link
          to="/admin/settings"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:border-primary transition-colors"
        >
          <FileText className="w-8 h-8 text-gray-500 mb-3" />
          <h3 className="font-semibold mb-1">Site Settings</h3>
          <p className="text-sm text-gray-600">Configure your site</p>
        </Link>
      </div>
    </div>
  );
}
