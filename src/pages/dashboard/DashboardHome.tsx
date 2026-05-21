import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { OfflineService } from "@/services/OfflineService";
import { 
  GraduationCap, 
  FileText, 
  Download, 
  TrendingUp, 
  Clock, 
  Award,
  AlertCircle,
  BookOpen,
  Shield,
  Target,
  Activity
} from "lucide-react";
import type { DashboardStats } from "@/types/memberPortal";

export default function DashboardHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data: enrollments } = await supabase.from("course_enrollments").select("*").eq("user_id", user.id);
      const { data: reports } = await supabase.from("member_reports").select("*").eq("user_id", user.id);
      const { data: notes } = await supabase.from("member_notes").select("id").eq("user_id", user.id);
      const { data: checklists } = await supabase.from("preparedness_checklists").select("*").eq("user_id", user.id);
      const { data: achievements } = await supabase.from("member_achievements").select("*").eq("user_id", user.id);
      const offlineStats = await OfflineService.getOfflineStats(user.id);

      const coursesEnrolled = enrollments?.length || 0;
      const coursesCompleted = enrollments?.filter(e => e.is_completed).length || 0;
      const totalLearningHours = enrollments?.reduce((sum, e) => sum + ((e.progress_percentage / 100) * 10), 0) || 0;

      setStats({
        coursesEnrolled,
        coursesCompleted,
        totalLearningHours: Math.round(totalLearningHours),
        offlineContentCount: offlineStats.totalItems,
        reportsSubmitted: reports?.length || 0,
        reportsApproved: reports?.filter(r => r.status === 'approved').length || 0,
        achievementsEarned: achievements?.length || 0,
        notesCount: notes?.length || 0,
        checklistsCount: checklists?.length || 0,
        completionRate: coursesEnrolled > 0 ? Math.round((coursesCompleted / coursesEnrolled) * 100) : 0,
      });

      const { data: activity } = await supabase
        .from("member_activity").select("*").eq("user_id", user.id)
        .order("created_at", { ascending: false }).limit(5);
      setRecentActivity(activity || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <div className="w-12 h-12 border-4 border-[#1d70b8] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#505a5f]">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f2f1]">
      <div className="container py-6 sm:py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0b0c0c] mb-1">Command Center</h1>
            <p className="text-[#505a5f] text-sm">{user?.email}</p>
          </div>
          <OfflineIndicator />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-[#b1b4b6] mb-6 sm:mb-8">
          {[
            { icon: GraduationCap, label: "Courses Completed", value: stats?.coursesCompleted || 0, sub: `${stats?.coursesEnrolled || 0} enrolled` },
            { icon: Clock, label: "Training Hours", value: `${stats?.totalLearningHours || 0}h`, sub: `${stats?.completionRate || 0}% rate` },
            { icon: Download, label: "Offline Content", value: stats?.offlineContentCount || 0, sub: "saved locally" },
            { icon: FileText, label: "Reports Published", value: stats?.reportsApproved || 0, sub: `${stats?.reportsSubmitted || 0} submitted` },
          ].map((s, i) => (
            <div key={s.label} className={`bg-white p-3 sm:p-4 ${i % 2 === 0 ? "border-r border-[#b1b4b6]" : ""} ${i < 2 ? "border-b border-[#b1b4b6] md:border-b-0" : ""} ${i === 1 ? "md:border-r border-[#b1b4b6]" : ""} ${i === 2 ? "md:border-r border-[#b1b4b6]" : ""}`}>
              <s.icon className="w-5 h-5 text-[#1d70b8] mb-2" />
              <p className="text-2xl font-bold text-[#0b0c0c]">{s.value}</p>
              <p className="text-xs font-semibold text-[#0b0c0c] mt-0.5">{s.label}</p>
              <p className="text-xs text-[#505a5f]">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Training Progress */}
          <div className="lg:col-span-2 bg-white border border-[#b1b4b6] p-5">
            <h2 className="text-base font-bold text-[#0b0c0c] mb-4 pb-2 border-b-2 border-[#1d70b8] flex items-center gap-2">
              <Target className="w-4 h-4 text-[#1d70b8]" />Training Progress
            </h2>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[#505a5f]">Overall Completion</span>
              <span className="font-bold text-[#0b0c0c]">{stats?.completionRate || 0}%</span>
            </div>
            <div className="w-full bg-[#f3f2f1] h-4 mb-5">
              <div className="h-4 bg-[#1d70b8] transition-all" style={{ width: `${stats?.completionRate || 0}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#f3f2f1] mb-5">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#1d70b8]">{stats?.coursesEnrolled || 0}</p>
                <p className="text-xs text-[#505a5f]">Enrolled</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#f47738]">{(stats?.coursesEnrolled || 0) - (stats?.coursesCompleted || 0)}</p>
                <p className="text-xs text-[#505a5f]">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#00703c]">{stats?.coursesCompleted || 0}</p>
                <p className="text-xs text-[#505a5f]">Completed</p>
              </div>
            </div>
            <Link to="/my-courses" className="inline-block bg-[#1d70b8] text-white text-sm font-bold px-4 py-2 hover:bg-[#003078] transition-colors">
              Continue Training
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-[#b1b4b6] p-5">
            <h2 className="text-base font-bold text-[#0b0c0c] mb-4 pb-2 border-b-2 border-[#1d70b8]">Quick Actions</h2>
            <div className="space-y-0 border border-[#b1b4b6]">
              {[
                { to: "/dashboard/submit-report", icon: FileText, label: "Submit Report" },
                { to: "/dashboard/offline-content", icon: Download, label: "Manage Offline" },
                { to: "/dashboard/my-bunker", icon: Shield, label: "My Bunker" },
                { to: "/courses", icon: BookOpen, label: "Browse Courses" },
              ].map((item, i) => (
                <Link key={item.to} to={item.to} className={`flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#1d70b8] hover:bg-[#e8f0f8] hover:text-[#003078] transition-colors ${i > 0 ? "border-t border-[#f3f2f1]" : ""}`}>
                  <item.icon className="w-4 h-4 flex-shrink-0" />{item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Secondary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Preparedness */}
          <div className="bg-white border border-[#b1b4b6] p-5">
            <h2 className="text-base font-bold text-[#0b0c0c] mb-4 pb-2 border-b-2 border-[#1d70b8] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#1d70b8]" />Preparedness
            </h2>
            <div className="space-y-3 mb-4">
              {[
                { label: "Notes", value: stats?.notesCount || 0 },
                { label: "Checklists", value: stats?.checklistsCount || 0 },
                { label: "Reports", value: stats?.reportsSubmitted || 0 },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-[#505a5f]">{item.label}</span>
                  <span className="font-bold text-[#0b0c0c]">{item.value}</span>
                </div>
              ))}
            </div>
            <Link to="/dashboard/my-bunker" className="text-sm text-[#1d70b8] hover:underline font-medium">View Bunker →</Link>
          </div>

          {/* Achievements */}
          <div className="bg-white border border-[#b1b4b6] p-5">
            <h2 className="text-base font-bold text-[#0b0c0c] mb-4 pb-2 border-b-2 border-[#1d70b8] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#1d70b8]" />Achievements
            </h2>
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-[#1d70b8] mb-1">{stats?.achievementsEarned || 0}</p>
              <p className="text-sm text-[#505a5f]">Badges Earned</p>
            </div>
            {stats?.achievementsEarned === 0 && (
              <p className="text-xs text-[#505a5f] text-center">Complete courses and submit reports to earn badges</p>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-[#b1b4b6] p-5">
            <h2 className="text-base font-bold text-[#0b0c0c] mb-4 pb-2 border-b-2 border-[#1d70b8] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#1d70b8]" />Recent Activity
            </h2>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-[#505a5f] text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-2">
                {recentActivity.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="text-xs border-b border-[#f3f2f1] pb-2">
                    <p className="font-semibold text-[#0b0c0c]">{activity.activity_type}</p>
                    <p className="text-[#505a5f]">{new Date(activity.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Alert Banner */}
        {stats && stats.coursesEnrolled === 0 && (
          <div className="mt-6 bg-white border-l-4 border-[#1d70b8] p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <AlertCircle className="w-6 h-6 text-[#1d70b8] flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-[#0b0c0c] mb-1">Start Your Training</h3>
              <p className="text-sm text-[#505a5f]">You haven't enrolled in any courses yet. Browse our survival and preparedness training to get started.</p>
            </div>
            <Link to="/courses" className="self-start sm:self-auto flex-shrink-0 bg-[#00703c] text-white text-sm font-bold px-4 py-2 hover:bg-[#005a30] transition-colors">
              Browse Courses
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
