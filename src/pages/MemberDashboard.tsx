import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { natoCountries } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  User, Bell, Shield, LogOut, Crown,
  GraduationCap, FileText, Download, BookOpen,
  Video, Activity, ChevronRight,
  Clock, AlertCircle, Newspaper, Map,
  Megaphone, Handshake, ArrowUpRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { OfflineService } from "@/services/OfflineService";

export default function MemberDashboard() {
  const { user, logout, notifications, markAllNotificationsRead, loading, isAdmin } = useAuth();
  const { publishedPosts } = useData();
  const { isPremium, plan: currentPlan } = usePremiumStatus();

  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    coursesCompleted: 0,
    learningHours: 0,
    offlineItems: 0,
    reportsSubmitted: 0,
    reportsApproved: 0,
    completionRate: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;
    try {
      const [enrollments, reports, offlineStats] = await Promise.all([
        supabase.from("course_enrollments").select("*").eq("user_id", user.id),
        supabase.from("member_reports").select("id, status").eq("user_id", user.id),
        OfflineService.getOfflineStats(user.id),
      ]);
      const enrolled = enrollments.data?.length || 0;
      const completed = enrollments.data?.filter(e => e.is_completed).length || 0;
      const hours = Math.round(enrollments.data?.reduce((s, e) => s + ((e.progress_percentage / 100) * 10), 0) || 0);
      setStats({
        coursesEnrolled: enrolled,
        coursesCompleted: completed,
        learningHours: hours,
        offlineItems: offlineStats.totalItems,
        reportsSubmitted: reports.data?.length || 0,
        reportsApproved: reports.data?.filter(r => r.status === "approved").length || 0,
        completionRate: enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0,
      });
    } catch (e) {
      console.error("Stats error:", e);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading your portal...</p>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  const userCountry = natoCountries.find(c => c.code === user.country);
  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HEADER ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                {(user.name || user.email || "M")[0].toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="font-semibold text-gray-900 text-sm leading-tight">{user.name || user.email}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {userCountry && <span className="text-xs text-gray-500">{userCountry.flag} {userCountry.name}</span>}
                  {isPremium
                    ? <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs px-1.5 py-0">Premium</Badge>
                    : <Badge variant="outline" className="text-gray-400 text-xs px-1.5 py-0">Free</Badge>
                  }
                </div>
              </div>
            </div>

            {/* Center */}
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-gray-900 text-sm sm:text-base tracking-wide">Member Portal</span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-1">
              {unreadNotifications.length > 0 && (
                <button onClick={markAllNotificationsRead} className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>
              )}
              {isAdmin && (
                <Button variant="outline" size="sm" asChild className="hidden sm:flex text-xs">
                  <Link to="/admin"><Shield className="w-3 h-3 mr-1" />Admin</Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={logout} className="text-gray-500 hover:text-gray-900">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* ── WELCOME + SUBSCRIPTION ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Here's your preparedness overview</p>
          </div>
          {!isPremium ? (
            <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">
              <Link to="/my-subscription">
                <Crown className="w-4 h-4 mr-2" />Upgrade to Premium
              </Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
              <Crown className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">{currentPlan?.name || "Premium"}</span>
              <Link to="/my-subscription" className="text-xs text-amber-600 hover:underline ml-1">Manage</Link>
            </div>
          )}
        </div>

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Courses Enrolled", value: stats.coursesEnrolled, sub: `${stats.coursesCompleted} completed`, icon: GraduationCap, color: "bg-blue-50 text-blue-600" },
            { label: "Training Hours", value: `${stats.learningHours}h`, sub: `${stats.completionRate}% completion`, icon: Clock, color: "bg-green-50 text-green-600" },
            { label: "Offline Content", value: stats.offlineItems, sub: "items saved", icon: Download, color: "bg-purple-50 text-purple-600" },
            { label: "Field Reports", value: stats.reportsSubmitted, sub: `${stats.reportsApproved} approved`, icon: FileText, color: "bg-orange-50 text-orange-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm font-medium text-gray-700 mt-0.5">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* ── TRAINING PROGRESS ── */}
        {stats.coursesEnrolled > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Training Progress</h2>
              <Link to="/my-courses" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                View courses <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <Progress value={stats.completionRate} className="flex-1 h-2" />
              <span className="text-sm font-bold text-gray-900 w-10 text-right">{stats.completionRate}%</span>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-center">
              <div>
                <p className="text-lg font-bold text-blue-600">{stats.coursesEnrolled}</p>
                <p className="text-xs text-gray-500">Enrolled</p>
              </div>
              <div>
                <p className="text-lg font-bold text-amber-500">{stats.coursesEnrolled - stats.coursesCompleted}</p>
                <p className="text-xs text-gray-500">In Progress</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">{stats.coursesCompleted}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
          </div>
        )}

        {/* ── MAIN GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">

          <NavCard
            icon={GraduationCap}
            iconBg="bg-blue-50 text-blue-600"
            title="Training Academy"
            description="Survival & preparedness courses"
            badge={stats.coursesEnrolled > 0 ? `${stats.coursesEnrolled} enrolled` : undefined}
            primary={{ label: "My Courses", to: "/dashboard/training" }}
            secondary={{ label: "Browse Courses", to: "/courses" }}
          />

          <NavCard
            icon={Newspaper}
            iconBg="bg-red-50 text-red-600"
            title="Intelligence Hub"
            description="Latest news, alerts & situation reports"
            badge={publishedPosts.length > 0 ? `${publishedPosts.length} articles` : undefined}
            primary={{ label: "Latest News", to: "/latest" }}
            secondary={{ label: "Emergency News", to: "/emergency-news" }}
          />

          <NavCard
            icon={BookOpen}
            iconBg="bg-green-50 text-green-600"
            title="Content Library"
            description="Books, guides & reference materials"
            primary={{ label: "Library", to: "/library" }}
            secondary={{ label: "Encyclopaedia", to: "/encyclopaedia" }}
          />

          <NavCard
            icon={Video}
            iconBg="bg-purple-50 text-purple-600"
            title="Videos & Podcasts"
            description="Watch and listen to expert content"
            primary={{ label: "Open Media Hub", to: "/media" }}
          />

          <NavCard
            icon={FileText}
            iconBg="bg-orange-50 text-orange-600"
            title="Field Reports"
            description="Submit & track intelligence reports"
            badge={stats.reportsSubmitted > 0 ? `${stats.reportsSubmitted} reports` : undefined}
            primary={{ label: "Submit Report", to: "/dashboard/submit-report" }}
            secondary={{ label: "My Reports", to: "/dashboard/my-reports" }}
          />

          <NavCard
            icon={Shield}
            iconBg="bg-cyan-50 text-cyan-600"
            title="My Bunker"
            description="Notes, checklists & emergency contacts"
            primary={{ label: "Open Bunker", to: "/dashboard/my-bunker" }}
          />

          <NavCard
            icon={Download}
            iconBg="bg-indigo-50 text-indigo-600"
            title="Offline Content"
            description="Manage saved content for offline access"
            badge={stats.offlineItems > 0 ? `${stats.offlineItems} saved` : undefined}
            primary={{ label: "Manage Offline", to: "/dashboard/offline-content" }}
          />

          <NavCard
            icon={Map}
            iconBg="bg-yellow-50 text-yellow-600"
            title="Survival Guides"
            description="Tactical guides for every scenario"
            primary={{ label: "Browse Guides", to: "/survival-guides" }}
            secondary={{ label: "Resources", to: "/resources" }}
          />

          <NavCard
            icon={Megaphone}
            iconBg="bg-pink-50 text-pink-600"
            title="Advertise With Us"
            description="Place an ad — pay and go live instantly"
            primary={{ label: "Browse Placements", to: "/dashboard/advertise" }}
            secondary={{ label: "My Ads", to: "/dashboard/my-ads" }}
          />

          <NavCard
            icon={Handshake}
            iconBg="bg-teal-50 text-teal-600"
            title="Sponsorship"
            description="Partner with us — we'll contact you"
            primary={{ label: "Submit Inquiry", to: "/dashboard/sponsorship" }}
          />

          <NavCard
            icon={Crown}
            iconBg="bg-amber-50 text-amber-600"
            title="My Subscription"
            description={isPremium ? `${currentPlan?.name || "Premium"} — Active` : "Free plan — Upgrade for full access"}
            primary={{ label: isPremium ? "Manage Plan" : "Upgrade Now", to: "/my-subscription" }}
          />

        </div>

        {/* ── LATEST POSTS ── */}
        {publishedPosts.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Latest Intelligence
              </h2>
              <Link to="/latest" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                View all <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {publishedPosts.slice(0, 5).map(post => (
                <Link
                  key={post.id}
                  to={`/${post.section}/${post.category}/${post.id}`}
                  className="flex items-start gap-4 py-4 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors group"
                >
                  {post.image && (
                    <img src={post.image} alt={post.title} className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{post.section}</span>
                      <span className="text-xs text-gray-400">{post.readTime}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 flex-shrink-0 mt-1 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {unreadNotifications.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-gray-600" />
                Notifications
                <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unreadNotifications.length}</span>
              </h2>
              <button onClick={markAllNotificationsRead} className="text-xs text-blue-600 hover:underline">
                Mark all read
              </button>
            </div>
            <div className="space-y-3">
              {unreadNotifications.slice(0, 3).map(n => (
                <div key={n.id} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {stats.coursesEnrolled === 0 && !loadingStats && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Start Your Training</h3>
              <p className="text-sm text-gray-600 mb-4">
                You haven't enrolled in any courses yet. Browse our survival and preparedness training to get started.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button asChild size="sm">
                  <Link to="/courses">Browse Courses</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/dashboard/submit-report">Submit a Report</Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div className="text-center py-6 text-xs text-gray-400 border-t border-gray-200 mt-8">
          Preparedness For War — Member Portal · All content is for preparedness purposes only
        </div>
      </div>
    </div>
  );
}

// ── NAV CARD COMPONENT ──
interface NavCardProps {
  icon: React.ElementType;
  iconBg: string;
  title: string;
  description: string;
  badge?: string;
  primary: { label: string; to: string };
  secondary?: { label: string; to: string };
}

function NavCard({ icon: Icon, iconBg, title, description, badge, primary, secondary }: NavCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        {badge && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{badge}</span>
        )}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 mb-4 leading-relaxed">{description}</p>
      <div className="flex gap-2">
        <Link
          to={primary.to}
          className="flex-1 text-center text-sm font-medium bg-gray-900 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          {primary.label}
        </Link>
        {secondary && (
          <Link
            to={secondary.to}
            className="flex-1 text-center text-sm font-medium bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {secondary.label}
          </Link>
        )}
      </div>
    </div>
  );
}
