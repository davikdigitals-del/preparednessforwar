import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { natoCountries } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  User, Globe, Bell, Shield, LogOut, Crown,
  GraduationCap, FileText, Download, BookOpen,
  Headphones, Video, StickyNote, ListChecks,
  Users, Activity, ChevronRight, Wifi, WifiOff,
  Target, Award, Clock, TrendingUp, AlertCircle,
  Newspaper, Map, Megaphone, Handshake
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { OfflineService } from "@/services/OfflineService";
import { OfflineIndicator } from "@/components/OfflineIndicator";

export default function MemberDashboard() {
  const { user, logout, notifications, markAllNotificationsRead, loading, isAdmin } = useAuth();
  const { publishedPosts } = useData();
  const { isPremium, plan: currentPlan } = usePremiumStatus();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    coursesCompleted: 0,
    learningHours: 0,
    offlineItems: 0,
    reportsSubmitted: 0,
    reportsApproved: 0,
    notesCount: 0,
    checklistsCount: 0,
    completionRate: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;
    try {
      const [enrollments, reports, notes, checklists, offlineStats] = await Promise.all([
        supabase.from("course_enrollments").select("*").eq("user_id", user.id),
        supabase.from("member_reports").select("*").eq("user_id", user.id),
        supabase.from("member_notes").select("id").eq("user_id", user.id),
        supabase.from("preparedness_checklists").select("id").eq("user_id", user.id),
        OfflineService.getOfflineStats(user.id),
      ]);

      const enrolled = enrollments.data?.length || 0;
      const completed = enrollments.data?.filter(e => e.is_completed).length || 0;
      const hours = Math.round(enrollments.data?.reduce((sum, e) => {
        return sum + ((e.progress_percentage / 100) * 10);
      }, 0) || 0);

      setStats({
        coursesEnrolled: enrolled,
        coursesCompleted: completed,
        learningHours: hours,
        offlineItems: offlineStats.totalItems,
        reportsSubmitted: reports.data?.length || 0,
        reportsApproved: reports.data?.filter(r => r.status === 'approved').length || 0,
        notesCount: notes.data?.length || 0,
        checklistsCount: checklists.data?.length || 0,
        completionRate: enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0,
      });
    } catch (e) {
      console.error("Stats error:", e);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-300">Loading portal...</p>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  const userCountry = natoCountries.find(c => c.code === user.country);
  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* ── TOP COMMAND BAR ── */}
      <div className="bg-slate-900 border-b border-slate-700 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Left: identity */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-white leading-none">{user.name || user.email}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {userCountry && (
                    <span className="text-xs text-slate-400">{userCountry.flag} {userCountry.name}</span>
                  )}
                  {isPremium ? (
                    <Badge className="bg-yellow-500 text-black text-xs px-1.5 py-0">Premium</Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-400 border-slate-600 text-xs px-1.5 py-0">Free</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Center: portal title */}
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="font-bold text-white text-sm sm:text-base tracking-wide">MEMBER PORTAL</span>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2">
              <OfflineIndicator />
              {unreadNotifications.length > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="relative p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
              )}
              {isAdmin && (
                <Button variant="outline" size="sm" asChild className="border-slate-600 text-slate-300 hover:text-white hidden sm:flex">
                  <Link to="/admin"><Shield className="w-3 h-3 mr-1" />Admin</Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={logout} className="text-slate-400 hover:text-white">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">

        {/* ── SUBSCRIPTION BANNER ── */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-blue-900/60 to-blue-800/40 border border-blue-700 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-white">Upgrade to Premium</p>
                <p className="text-sm text-blue-200">Unlock all courses, exclusive content & offline access</p>
              </div>
            </div>
            <Button asChild size="sm" className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold flex-shrink-0">
              <Link to="/my-subscription"><Crown className="w-3 h-3 mr-1" />Upgrade</Link>
            </Button>
          </div>
        )}

        {isPremium && currentPlan && (
          <div className="bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/50 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-white">Premium Member — {currentPlan.name}</p>
                <p className="text-sm text-yellow-200">Full access to all content and features</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="border-yellow-700 text-yellow-300 hover:bg-yellow-900/30 flex-shrink-0">
              <Link to="/my-subscription">Manage</Link>
            </Button>
          </div>
        )}

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: GraduationCap, label: "Courses", value: stats.coursesEnrolled, sub: `${stats.coursesCompleted} done`, color: "text-blue-400" },
            { icon: Clock, label: "Hours Trained", value: `${stats.learningHours}h`, sub: `${stats.completionRate}% rate`, color: "text-green-400" },
            { icon: Download, label: "Offline", value: stats.offlineItems, sub: "saved items", color: "text-purple-400" },
            { icon: FileText, label: "Reports", value: stats.reportsSubmitted, sub: `${stats.reportsApproved} approved`, color: "text-orange-400" },
          ].map(s => (
            <Card key={s.label} className="bg-slate-800/60 border-slate-700">
              <CardContent className="p-4">
                <s.icon className={`w-6 h-6 ${s.color} mb-2`} />
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
                <p className="text-xs text-slate-500">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── TRAINING PROGRESS ── */}
        {stats.coursesEnrolled > 0 && (
          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2 text-base">
                <Target className="w-5 h-5 text-blue-400" />
                Training Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Overall Completion</span>
                <span className="text-white font-bold">{stats.completionRate}%</span>
              </div>
              <Progress value={stats.completionRate} className="h-2 bg-slate-700" />
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-700 text-center">
                <div>
                  <p className="text-xl font-bold text-blue-400">{stats.coursesEnrolled}</p>
                  <p className="text-xs text-slate-500">Enrolled</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-yellow-400">{stats.coursesEnrolled - stats.coursesCompleted}</p>
                  <p className="text-xs text-slate-500">In Progress</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-green-400">{stats.coursesCompleted}</p>
                  <p className="text-xs text-slate-500">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── MAIN PORTAL GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Training Academy */}
          <PortalCard
            icon={<GraduationCap className="w-6 h-6 text-blue-400" />}
            title="Training Academy"
            description="Access your survival & preparedness courses"
            badge={stats.coursesEnrolled > 0 ? `${stats.coursesEnrolled} enrolled` : undefined}
            links={[
              { label: "My Courses", to: "/dashboard/training" },
              { label: "Browse All Courses", to: "/courses" },
            ]}
            color="blue"
          />

          {/* Intelligence Hub */}
          <PortalCard
            icon={<Newspaper className="w-6 h-6 text-red-400" />}
            title="Intelligence Hub"
            description="Latest news, alerts & situation reports"
            badge={publishedPosts.length > 0 ? `${publishedPosts.length} articles` : undefined}
            links={[
              { label: "Latest News", to: "/latest" },
              { label: "Emergency News", to: "/emergency-news" },
            ]}
            color="red"
          />

          {/* Content Library */}
          <PortalCard
            icon={<BookOpen className="w-6 h-6 text-green-400" />}
            title="Content Library"
            description="Books, guides, and reference materials"
            links={[
              { label: "Library", to: "/library" },
              { label: "Encyclopaedia", to: "/encyclopaedia" },
            ]}
            color="green"
          />

          {/* Videos & Podcasts */}
          <PortalCard
            icon={<Video className="w-6 h-6 text-purple-400" />}
            title="Videos & Podcasts"
            description="Watch and listen to expert content"
            links={[
              { label: "Media Hub", to: "/media" },
              { label: "Browse Media", to: "/media" },
            ]}
            color="purple"
          />

          {/* Field Reports */}
          <PortalCard
            icon={<FileText className="w-6 h-6 text-orange-400" />}
            title="Field Reports"
            description="Submit and track your intelligence reports"
            badge={stats.reportsSubmitted > 0 ? `${stats.reportsSubmitted} submitted` : undefined}
            links={[
              { label: "Submit Report", to: "/dashboard/submit-report" },
              { label: "My Reports", to: "/dashboard/my-reports" },
              { label: "Community Reports", to: "/community-reports" },
            ]}
            color="orange"
          />

          {/* My Bunker */}
          <PortalCard
            icon={<Shield className="w-6 h-6 text-cyan-400" />}
            title="My Bunker"
            description="Personal notes, checklists & emergency contacts"
            badge={(stats.notesCount + stats.checklistsCount) > 0 ? `${stats.notesCount + stats.checklistsCount} items` : undefined}
            links={[
              { label: "Open Bunker", to: "/dashboard/my-bunker" },
            ]}
            color="cyan"
          />

          {/* Offline Content */}
          <PortalCard
            icon={<Download className="w-6 h-6 text-indigo-400" />}
            title="Offline Content"
            description="Manage content saved for offline access"
            badge={stats.offlineItems > 0 ? `${stats.offlineItems} saved` : undefined}
            links={[
              { label: "Manage Offline", to: "/dashboard/offline-content" },
            ]}
            color="indigo"
          />

          {/* Survival Guides */}
          <PortalCard
            icon={<Map className="w-6 h-6 text-yellow-400" />}
            title="Survival Guides"
            description="Tactical guides for every scenario"
            links={[
              { label: "Browse Guides", to: "/survival-guides" },
              { label: "Resources", to: "/resources" },
            ]}
            color="yellow"
          />

          {/* Advertise */}
          <PortalCard
            icon={<Megaphone className="w-6 h-6 text-pink-400" />}
            title="Advertise With Us"
            description="Place an ad — pay and go live immediately"
            links={[
              { label: "Browse Ad Placements", to: "/dashboard/advertise" },
              { label: "My Ads", to: "/dashboard/my-ads" },
            ]}
            color="pink"
          />

          {/* Sponsorship */}
          <PortalCard
            icon={<Handshake className="w-6 h-6 text-teal-400" />}
            title="Sponsorship"
            description="Partner with us — submit an inquiry, we'll contact you"
            links={[
              { label: "Submit Sponsorship Inquiry", to: "/dashboard/sponsorship" },
            ]}
            color="teal"
          />

          {/* Subscription */}
          <PortalCard
            icon={<Crown className="w-6 h-6 text-yellow-400" />}
            title="My Subscription"
            description={isPremium ? `${currentPlan?.name || 'Premium'} — Active` : "Free plan — Upgrade for full access"}
            links={[
              { label: isPremium ? "Manage Plan" : "Upgrade Now", to: "/my-subscription" },
            ]}
            color="yellow"
          />
        </div>

        {/* ── RECENT NOTIFICATIONS ── */}
        {unreadNotifications.length > 0 && (
          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Bell className="w-5 h-5 text-yellow-400" />
                  Notifications
                  <Badge className="bg-red-600 text-white">{unreadNotifications.length}</Badge>
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white text-xs" onClick={markAllNotificationsRead}>
                  Mark all read
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {unreadNotifications.slice(0, 3).map(n => (
                <div key={n.id} className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                  <p className="text-sm font-medium text-white">{n.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* ── LATEST POSTS ── */}
        {publishedPosts.length > 0 && (
          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Latest Intelligence
                </CardTitle>
                <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-white text-xs">
                  <Link to="/latest">View all <ChevronRight className="w-3 h-3 ml-1" /></Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {publishedPosts.slice(0, 4).map(post => (
                  <Link
                    key={post.id}
                    to={`/${post.section}/${post.category}/${post.id}`}
                    className="flex items-start gap-3 p-3 bg-slate-700/40 rounded-lg hover:bg-slate-700/70 transition-colors group"
                  >
                    {post.image && (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-16 h-12 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white line-clamp-2 group-hover:text-blue-300 transition-colors">
                        {post.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-400 px-1.5 py-0">
                          {post.section}
                        </Badge>
                        <span className="text-xs text-slate-500">{post.readTime}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 flex-shrink-0 mt-1 transition-colors" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── EMPTY STATE ── */}
        {stats.coursesEnrolled === 0 && !loadingStats && (
          <Card className="bg-blue-900/20 border-blue-700/50">
            <CardContent className="py-8">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-1">Start Your Training</h3>
                  <p className="text-sm text-slate-300 mb-4">
                    You haven't enrolled in any courses yet. Browse our survival and preparedness training to get started.
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <Button asChild size="sm">
                      <Link to="/courses">Browse Courses</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="border-slate-600 text-slate-300">
                      <Link to="/dashboard/submit-report">Submit a Report</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── FOOTER ── */}
        <div className="text-center py-4 text-xs text-slate-600 border-t border-slate-800">
          Preparedness For War — Member Portal • All content is for preparedness purposes only
        </div>
      </div>
    </div>
  );
}

// ── PORTAL CARD COMPONENT ──
interface PortalCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  links: { label: string; to: string }[];
  color: 'blue' | 'red' | 'green' | 'purple' | 'orange' | 'cyan' | 'indigo' | 'yellow' | 'pink' | 'teal';
}

const colorMap = {
  blue:   "border-blue-800/50 hover:border-blue-600",
  red:    "border-red-800/50 hover:border-red-600",
  green:  "border-green-800/50 hover:border-green-600",
  purple: "border-purple-800/50 hover:border-purple-600",
  orange: "border-orange-800/50 hover:border-orange-600",
  cyan:   "border-cyan-800/50 hover:border-cyan-600",
  indigo: "border-indigo-800/50 hover:border-indigo-600",
  yellow: "border-yellow-800/50 hover:border-yellow-600",
  pink:   "border-pink-800/50 hover:border-pink-600",
  teal:   "border-teal-800/50 hover:border-teal-600",
};

function PortalCard({ icon, title, description, badge, links, color }: PortalCardProps) {
  return (
    <Card className={`bg-slate-800/60 border transition-all duration-200 ${colorMap[color]}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-white text-base">{title}</CardTitle>
          </div>
          {badge && (
            <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs flex-shrink-0">
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-1">{description}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1.5">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-300 bg-slate-700/40 hover:bg-slate-700 rounded-lg transition-colors group"
            >
              <span>{link.label}</span>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
