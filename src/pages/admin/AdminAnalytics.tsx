import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  Eye, 
  FileText, 
  Users, 
  Calendar,
  ArrowUp,
  ArrowDown,
  Crown
} from "lucide-react";

interface AnalyticsData {
  totalPosts: number;
  totalViews: number;
  totalMembers: number;
  premiumMembers: number;
  postsThisMonth: number;
  viewsThisMonth: number;
  topPosts: Array<{
    id: string;
    title: string;
    view_count: number;
    section: string;
  }>;
  postsBySection: Array<{
    section: string;
    count: number;
  }>;
  recentActivity: Array<{
    date: string;
    views: number;
  }>;
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    let mounted = true;

    const loadAnalytics = async () => {
      setLoading(true);
      
      try {
        // Get total posts
        const { count: totalPosts } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true });

        // Get total views
        const { data: viewsData } = await supabase
          .from('posts')
          .select('view_count');
        const totalViews = viewsData?.reduce((sum, post) => sum + (post.view_count || 0), 0) || 0;

        // Get total members
        const { count: totalMembers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Get premium members
        const { count: premiumMembers } = await supabase
          .from('user_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // Get posts this month
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        firstDayOfMonth.setHours(0, 0, 0, 0);

        const { count: postsThisMonth } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', firstDayOfMonth.toISOString());

        // Get top posts by views
        const { data: topPosts } = await supabase
          .from('posts')
          .select('id, title, view_count, section')
          .order('view_count', { ascending: false })
          .limit(10);

        // Get posts by section
        const { data: allPosts } = await supabase
          .from('posts')
          .select('section');
        
        const postsBySection = allPosts?.reduce((acc: any[], post) => {
          const existing = acc.find(item => item.section === post.section);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ section: post.section, count: 1 });
          }
          return acc;
        }, []) || [];

        if (mounted) {
          setData({
            totalPosts: totalPosts || 0,
            totalViews,
            totalMembers: totalMembers || 0,
            premiumMembers: premiumMembers || 0,
            postsThisMonth: postsThisMonth || 0,
            viewsThisMonth: totalViews, // Simplified for now
            topPosts: topPosts || [],
            postsBySection: postsBySection.sort((a, b) => b.count - a.count),
            recentActivity: [], // Simplified for now
          });
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      mounted = false;
    };
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Posts',
      value: data.totalPosts,
      change: `+${data.postsThisMonth} this month`,
      icon: FileText,
      color: 'bg-blue-500',
      trend: 'up'
    },
    {
      title: 'Total Views',
      value: data.totalViews.toLocaleString(),
      change: `${data.viewsThisMonth.toLocaleString()} this month`,
      icon: Eye,
      color: 'bg-green-500',
      trend: 'up'
    },
    {
      title: 'Total Members',
      value: data.totalMembers,
      change: 'All time',
      icon: Users,
      color: 'bg-purple-500',
      trend: 'neutral'
    },
    {
      title: 'Premium Members',
      value: data.premiumMembers,
      change: `${Math.round((data.premiumMembers / Math.max(data.totalMembers, 1)) * 100)}% of total`,
      icon: Crown,
      color: 'bg-amber-500',
      trend: 'up'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your site performance and engagement</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '7d' ? 'Last 7 days' : range === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {stat.trend === 'up' && (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <ArrowUp className="w-4 h-4" />
                    <span>Growth</span>
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.title}</div>
              <div className="text-xs text-gray-500 mt-2">{stat.change}</div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Posts */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Top Posts by Views
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {data.topPosts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No posts yet
              </div>
            ) : (
              data.topPosts.map((post, index) => (
                <div key={post.id} className="p-4 hover:bg-gray-50 flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-300 w-8">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-1">{post.title}</h3>
                    <p className="text-xs text-gray-500 capitalize">{post.section}</p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span className="font-semibold">{post.view_count?.toLocaleString() || 0}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Posts by Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Posts by Section
            </h2>
          </div>
          <div className="p-6">
            {data.postsBySection.length === 0 ? (
              <div className="text-center text-gray-500">
                No posts yet
              </div>
            ) : (
              <div className="space-y-4">
                {data.postsBySection.map((item) => {
                  const percentage = (item.count / data.totalPosts) * 100;
                  return (
                    <div key={item.section}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">
                          {item.section.replace(/-/g, ' ')}
                        </span>
                        <span className="text-sm text-gray-600">
                          {item.count} posts ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-4">Quick Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-2xl sm:text-3xl font-bold">
              {data.totalPosts > 0 ? Math.round(data.totalViews / data.totalPosts) : 0}
            </div>
            <div className="text-sm opacity-90">Average views per post</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold">
              {data.postsThisMonth}
            </div>
            <div className="text-sm opacity-90">Posts published this month</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold">
              {data.postsBySection.length}
            </div>
            <div className="text-sm opacity-90">Active sections</div>
          </div>
        </div>
      </div>
    </div>
  );
}
