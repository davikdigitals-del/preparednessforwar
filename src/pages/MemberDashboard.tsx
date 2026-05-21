import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { natoCountries } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  User, Bell, Shield, LogOut, Crown,
  GraduationCap, FileText, BookOpen,
  Video, Activity, ChevronRight,
  Clock, Newspaper, Map,
  Megaphone, Handshake, Download,
  AlertTriangle, CheckCircle, ExternalLink,
  Menu, X
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const up = () => setIsOnline(true);
    const down = () => setIsOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", down); };
  }, []);

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
    <div className="min-h-screen flex items-center justify-center bg-[#f3f2f1]">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-[#1d70b8] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[#505a5f] text-sm">Loading portal...</p>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  const userCountry = natoCountries.find(c => c.code === user.country);
  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <div className="min-h-screen bg-[#f3f2f1]">

      {/* ── TOP BAR ── */}
      <div className="bg-[#1d70b8] text-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden text-white hover:text-[#b1b4b6] transition-colors"
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                aria-label="Toggle navigation"
              >
                {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <Shield className="w-4 h-4 text-white" />
              <span className="text-sm font-bold tracking-widest uppercase">Preparedness For War</span>
              <span className="hidden sm:inline text-[#b1b4b6] text-sm">— Member Portal</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className={`flex items-center gap-1.5 text-xs ${isOnline ? "text-[#00703c]" : "text-[#d4351c]"}`}>
                <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-[#00703c]" : "bg-[#d4351c]"}`} />
                <span className="hidden sm:inline">{isOnline ? "Online" : "Offline"}</span>
              </div>
              {unreadNotifications.length > 0 && (
                <button onClick={markAllNotificationsRead} className="relative text-white hover:text-[#b1b4b6] transition-colors">
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#d4351c] rounded-full text-[9px] flex items-center justify-center font-bold">
                    {unreadNotifications.length}
                  </span>
                </button>
              )}
              {isAdmin && (
                <Link to="/admin" className="text-xs text-[#b1b4b6] hover:text-white transition-colors flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />Admin
                </Link>
              )}
              <button onClick={logout} className="text-xs text-[#b1b4b6] hover:text-white transition-colors flex items-center gap-1">
                <LogOut className="w-3 h-3" />Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── IDENTITY BAR ── */}
      <div className="bg-[#1d70b8] text-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[#b1b4b6] text-xs uppercase tracking-wider mb-1">Signed in as</p>
              <h1 className="text-lg sm:text-2xl font-bold">{user.name || user.email}</h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 text-sm text-[#b1b4b6]">
                {userCountry && <span>{userCountry.flag} {userCountry.name}</span>}
                <span>·</span>
                {isPremium
                  ? <span className="text-[#ffdd00] font-semibold">Premium Member</span>
                  : <span>Free Account</span>
                }
              </div>
            </div>
            {!isPremium && (
              <Link
                to="/my-subscription"
                className="flex-shrink-0 bg-[#ffdd00] text-[#0b0c0c] text-sm font-bold px-4 py-2 hover:bg-[#ffd700] transition-colors flex items-center gap-2"
              >
                <Crown className="w-4 h-4" />Upgrade
              </Link>
            )}
            {isPremium && (
              <div className="flex-shrink-0 text-right">
                <p className="text-[#ffdd00] font-bold text-sm">{currentPlan?.name || "Premium"}</p>
                <Link to="/my-subscription" className="text-xs text-[#b1b4b6] hover:text-white underline">Manage plan</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── OFFLINE BANNER ── */}
      {!isOnline && (
        <div className="bg-[#f47738] text-white">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span><strong>You are offline.</strong> All your saved content and bunker data is still accessible. Changes will sync when you reconnect.</span>
          </div>
        </div>
      )}

      {/* ── MOBILE SIDEBAR DRAWER ── */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-72 bg-white border-r border-[#b1b4b6] overflow-y-auto flex-shrink-0 shadow-xl">
            <div className="bg-[#1d70b8] px-4 py-3 flex items-center justify-between">
              <span className="text-white text-sm font-bold">Navigation</span>
              <button onClick={() => setMobileSidebarOpen(false)} className="text-[#b1b4b6] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4">
              <ul className="space-y-0 border-l-4 border-[#1d70b8]">
                {[
                  { label: "Overview", to: "/dashboard", icon: Activity },
                  { label: "Training Academy", to: "/dashboard/training", icon: GraduationCap },
                  { label: "Intelligence Hub", to: "/latest", icon: Newspaper },
                  { label: "Content Library", to: "/library", icon: BookOpen },
                  { label: "Videos & Podcasts", to: "/media", icon: Video },
                  { label: "Field Reports", to: "/dashboard/my-reports", icon: FileText },
                  { label: "My Bunker", to: "/dashboard/my-bunker", icon: Shield },
                  { label: "Survival Guides", to: "/survival-guides", icon: Map },
                  { label: "Advertise", to: "/dashboard/advertise", icon: Megaphone },
                  { label: "Sponsorship", to: "/dashboard/sponsorship", icon: Handshake },
                  { label: "My Subscription", to: "/my-subscription", icon: Crown },
                ].map(item => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setMobileSidebarOpen(false)}
                      className="flex items-center gap-2.5 pl-4 pr-3 py-3 text-sm text-[#1d70b8] hover:bg-[#e8f0f8] hover:text-[#003078] transition-colors font-medium border-b border-[#f3f2f1]"
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          {/* Backdrop */}
          <div className="flex-1 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex gap-8">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <nav>
              <p className="text-xs font-bold text-[#505a5f] uppercase tracking-wider mb-3">Navigation</p>
              <ul className="space-y-0 border-l-4 border-[#1d70b8]">
                {[
                  { label: "Overview", to: "/dashboard", icon: Activity },
                  { label: "Training Academy", to: "/dashboard/training", icon: GraduationCap },
                  { label: "Intelligence Hub", to: "/latest", icon: Newspaper },
                  { label: "Content Library", to: "/library", icon: BookOpen },
                  { label: "Videos & Podcasts", to: "/media", icon: Video },
                  { label: "Field Reports", to: "/dashboard/my-reports", icon: FileText },
                  { label: "My Bunker", to: "/dashboard/my-bunker", icon: Shield },
                  { label: "Survival Guides", to: "/survival-guides", icon: Map },
                  { label: "Advertise", to: "/dashboard/advertise", icon: Megaphone },
                  { label: "Sponsorship", to: "/dashboard/sponsorship", icon: Handshake },
                  { label: "My Subscription", to: "/my-subscription", icon: Crown },
                ].map(item => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="flex items-center gap-2.5 pl-4 pr-3 py-2.5 text-sm text-[#1d70b8] hover:bg-[#e8f0f8] hover:text-[#003078] transition-colors font-medium"
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Offline status */}
            <div className="mt-6 p-3 bg-white border border-[#b1b4b6]">
              <p className="text-xs font-bold text-[#0b0c0c] mb-1">Offline Access</p>
              <p className="text-xs text-[#505a5f]">{stats.offlineItems} items saved for offline use</p>
              <Link to="/dashboard/offline-content" className="text-xs text-[#1d70b8] hover:underline mt-1 block">
                Manage offline content →
              </Link>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main className="flex-1 min-w-0 space-y-6">

            {/* ── STATUS SUMMARY ── */}
            <section>
              <h2 className="text-lg font-bold text-[#0b0c0c] mb-4 pb-2 border-b-2 border-[#1d70b8]">
                Preparedness Status
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border border-[#b1b4b6]">
                {[
                  { label: "Courses Enrolled", value: stats.coursesEnrolled, sub: `${stats.coursesCompleted} completed` },
                  { label: "Training Hours", value: `${stats.learningHours}h`, sub: `${stats.completionRate}% rate` },
                  { label: "Field Reports", value: stats.reportsSubmitted, sub: `${stats.reportsApproved} approved` },
                  { label: "Offline Items", value: stats.offlineItems, sub: "saved locally" },
                ].map((s, i) => (
                  <div key={s.label} className={`bg-white p-3 sm:p-4 ${i % 2 === 0 ? "border-r border-[#b1b4b6]" : ""} ${i < 2 ? "border-b border-[#b1b4b6] sm:border-b-0" : ""} ${i === 1 || i === 2 ? "sm:border-r border-[#b1b4b6]" : ""}`}>
                    <p className="text-2xl font-bold text-[#0b0c0c]">{s.value}</p>
                    <p className="text-xs font-semibold text-[#0b0c0c] mt-0.5">{s.label}</p>
                    <p className="text-xs text-[#505a5f] mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ── TRAINING PROGRESS ── */}
            {stats.coursesEnrolled > 0 && (
              <section>
                <h2 className="text-lg font-bold text-[#0b0c0c] mb-4 pb-2 border-b-2 border-[#1d70b8]">
                  Training Progress
                </h2>
                <div className="bg-white border border-[#b1b4b6] p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-[#0b0c0c]">Overall completion</span>
                    <span className="text-sm font-bold text-[#0b0c0c]">{stats.completionRate}%</span>
                  </div>
                  <div className="w-full bg-[#f3f2f1] h-4 mb-4">
                    <div
                      className="h-4 bg-[#00703c] transition-all"
                      style={{ width: `${stats.completionRate}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#f3f2f1]">
                    <div>
                      <p className="text-xl font-bold text-[#1d70b8]">{stats.coursesEnrolled}</p>
                      <p className="text-xs text-[#505a5f]">Enrolled</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-[#f47738]">{stats.coursesEnrolled - stats.coursesCompleted}</p>
                      <p className="text-xs text-[#505a5f]">In progress</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-[#00703c]">{stats.coursesCompleted}</p>
                      <p className="text-xs text-[#505a5f]">Completed</p>
                    </div>
                  </div>
                  <Link to="/my-courses" className="inline-block mt-4 text-sm text-[#1d70b8] hover:underline font-medium">
                    View all courses →
                  </Link>
                </div>
              </section>
            )}

            {/* ── PORTAL SECTIONS ── */}
            <section>
              <h2 className="text-lg font-bold text-[#0b0c0c] mb-4 pb-2 border-b-2 border-[#1d70b8]">
                Portal Sections
              </h2>
              <div className="space-y-0 border border-[#b1b4b6]">
                {[
                  {
                    icon: GraduationCap,
                    title: "Training Academy",
                    desc: "Access your enrolled survival and preparedness courses. Track progress and continue training.",
                    links: [{ label: "My courses", to: "/dashboard/training" }, { label: "Browse all courses", to: "/courses" }],
                    tag: stats.coursesEnrolled > 0 ? `${stats.coursesEnrolled} enrolled` : null,
                  },
                  {
                    icon: Shield,
                    title: "My Bunker",
                    desc: "Personal command centre. Emergency contacts, supply inventory, bug-out plan, saved articles. Works offline.",
                    links: [{ label: "Open bunker", to: "/dashboard/my-bunker" }],
                    tag: "Offline ready",
                    tagColor: "text-[#00703c]",
                  },
                  {
                    icon: Newspaper,
                    title: "Intelligence Hub",
                    desc: "Latest news, emergency alerts, situation reports and intelligence from across NATO member states.",
                    links: [{ label: "Latest news", to: "/latest" }, { label: "Emergency news", to: "/emergency-news" }],
                    tag: publishedPosts.length > 0 ? `${publishedPosts.length} articles` : null,
                  },
                  {
                    icon: BookOpen,
                    title: "Content Library",
                    desc: "Reference books, survival guides, encyclopaedia entries and downloadable resources.",
                    links: [{ label: "Library", to: "/library" }, { label: "Encyclopaedia", to: "/encyclopaedia" }],
                    tag: null,
                  },
                  {
                    icon: Video,
                    title: "Videos & Podcasts",
                    desc: "Expert-led video content and podcast episodes on preparedness, tactics and survival.",
                    links: [{ label: "Media hub", to: "/media" }],
                    tag: null,
                  },
                  {
                    icon: FileText,
                    title: "Field Reports",
                    desc: "Submit intelligence reports from the field. Approved reports are published to the community.",
                    links: [{ label: "Submit report", to: "/dashboard/submit-report" }, { label: "My reports", to: "/dashboard/my-reports" }, { label: "Community reports", to: "/community-reports" }],
                    tag: stats.reportsSubmitted > 0 ? `${stats.reportsSubmitted} submitted` : null,
                  },
                  {
                    icon: Map,
                    title: "Survival Guides",
                    desc: "Tactical guides, checklists, templates and resources for every emergency scenario.",
                    links: [{ label: "Browse guides", to: "/survival-guides" }, { label: "Resources", to: "/resources" }],
                    tag: null,
                  },
                  {
                    icon: Megaphone,
                    title: "Advertise With Us",
                    desc: "Place an advertisement on the platform. Pay and your ad goes live immediately.",
                    links: [{ label: "Browse placements", to: "/dashboard/advertise" }, { label: "My ads", to: "/dashboard/my-ads" }],
                    tag: null,
                  },
                  {
                    icon: Handshake,
                    title: "Sponsorship",
                    desc: "Partner with Preparedness For War. Submit an inquiry and our team will contact you.",
                    links: [{ label: "Submit inquiry", to: "/dashboard/sponsorship" }],
                    tag: null,
                  },
                  {
                    icon: Crown,
                    title: "My Subscription",
                    desc: isPremium ? `You are on the ${currentPlan?.name || "Premium"} plan with full access to all content.` : "You are on the free plan. Upgrade to access all courses, exclusive content and offline features.",
                    links: [{ label: isPremium ? "Manage subscription" : "Upgrade now", to: "/my-subscription" }],
                    tag: isPremium ? "Active" : "Free",
                    tagColor: isPremium ? "text-[#00703c]" : "text-[#505a5f]",
                  },
                ].map((section, i) => (
                  <div key={section.title} className={`bg-white p-4 sm:p-5 flex gap-3 sm:gap-4 ${i > 0 ? "border-t border-[#b1b4b6]" : ""}`}>
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#f3f2f1] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <section.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#1d70b8]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-[#0b0c0c] text-sm sm:text-base">{section.title}</h3>
                        {section.tag && (
                          <span className={`text-xs font-semibold flex-shrink-0 ${section.tagColor || "text-[#505a5f]"}`}>
                            {section.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#505a5f] mb-3 leading-relaxed">{section.desc}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {section.links.map((link, li) => (
                          <Link
                            key={link.to}
                            to={link.to}
                            className={`text-sm font-medium hover:underline flex items-center gap-1 ${li === 0 ? "text-[#1d70b8]" : "text-[#505a5f] hover:text-[#1d70b8]"}`}
                          >
                            {link.label}
                            {li === 0 && <ChevronRight className="w-3 h-3" />}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── LATEST INTELLIGENCE ── */}
            {publishedPosts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-[#1d70b8]">
                  <h2 className="text-lg font-bold text-[#0b0c0c]">Latest Intelligence</h2>
                  <Link to="/latest" className="text-sm text-[#1d70b8] hover:underline font-medium">
                    View all →
                  </Link>
                </div>
                <div className="space-y-0 border border-[#b1b4b6]">
                  {publishedPosts.slice(0, 5).map((post, i) => (
                    <Link
                      key={post.id}
                      to={`/${post.section}/${post.category}/${post.id}`}
                      className={`flex items-start gap-4 bg-white p-4 hover:bg-[#f3f2f1] transition-colors group ${i > 0 ? "border-t border-[#b1b4b6]" : ""}`}
                    >
                      {post.image && (
                        <img src={post.image} alt={post.title} className="w-16 sm:w-20 h-12 sm:h-14 object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#0b0c0c] line-clamp-2 group-hover:text-[#1d70b8] transition-colors">
                          {post.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-[#505a5f] uppercase tracking-wide font-medium">{post.section}</span>
                          <span className="text-xs text-[#b1b4b6]">{post.readTime}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#b1b4b6] group-hover:text-[#1d70b8] flex-shrink-0 mt-1 transition-colors" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ── NOTIFICATIONS ── */}
            {unreadNotifications.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-[#1d70b8]">
                  <h2 className="text-lg font-bold text-[#0b0c0c]">
                    Notifications
                    <span className="ml-2 bg-[#d4351c] text-white text-xs px-2 py-0.5 font-bold">{unreadNotifications.length}</span>
                  </h2>
                  <button onClick={markAllNotificationsRead} className="text-sm text-[#1d70b8] hover:underline font-medium">
                    Mark all as read
                  </button>
                </div>
                <div className="space-y-0 border border-[#b1b4b6]">
                  {unreadNotifications.slice(0, 3).map((n, i) => (
                    <div key={n.id} className={`bg-white p-4 flex items-start gap-3 ${i > 0 ? "border-t border-[#b1b4b6]" : ""}`}>
                      <div className="w-2 h-2 bg-[#1d70b8] rounded-full mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-[#0b0c0c]">{n.title}</p>
                        <p className="text-xs text-[#505a5f] mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── EMPTY STATE ── */}
            {stats.coursesEnrolled === 0 && !loadingStats && (
              <section className="bg-white border-l-4 border-[#1d70b8] p-5">
                <h3 className="font-bold text-[#0b0c0c] mb-2">Begin your training</h3>
                <p className="text-sm text-[#505a5f] mb-4">
                  You have not enrolled in any courses yet. Browse our survival and preparedness training catalogue to get started.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/courses" className="bg-[#00703c] text-white text-sm font-bold px-4 py-2 hover:bg-[#005a30] transition-colors text-center">
                    Browse courses
                  </Link>
                  <Link to="/dashboard/submit-report" className="bg-white text-[#0b0c0c] text-sm font-bold px-4 py-2 border-2 border-[#0b0c0c] hover:bg-[#f3f2f1] transition-colors text-center">
                    Submit a report
                  </Link>
                </div>
              </section>
            )}

            {/* ── FOOTER ── */}
            <div className="pt-4 border-t border-[#b1b4b6]">
              <p className="text-xs text-[#505a5f]">
            
              </p>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
