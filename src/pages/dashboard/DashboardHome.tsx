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
  Video,
  Headphones,
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
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch enrollments
      const { data: enrollments } = await supabase
        .from("course_enrollments")
        .select("*")
        .eq("user_id", user.id);

      // Fetch reports
      const { data: reports } = await supabase
        .from("member_reports")
        .select("*")
        .eq("user_id", user.id);

      // Fetch notes
      const { data: notes } = await supabase
        .from("member_notes")
        .select("id")
        .eq("user_id", user.id);

      // Fetch checklists
      const { data: checklists } = await supabase
        .from("preparedness_checklists")
        .select("*")
        .eq("user_id", user.id);

      // Fetch achievements
      const { data: achievements } = await supabase
        .from("member_achievements")
        .select("*")
        .eq("user_id", user.id);

      // Get offline content stats
      const offlineStats = await OfflineService.getOfflineStats(user.id);

      // Calculate stats
      const coursesEnrolled = enrollments?.length || 0;
      const coursesCompleted = enrollments?.filter(e => e.is_completed).length || 0;
      const totalLearningHours = enrollments?.reduce((sum, e) => {
        const courseHours = 10; // Default, should come from course data
        const progress = e.progress_percentage / 100;
        return sum + (courseHours * progress);
      }, 0) || 0;

      const dashboardStats: DashboardStats = {
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
      };

      setStats(dashboardStats);

      // Fetch recent activity
      const { data: activity } = await supabase
        .from("member_activity")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

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
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading command center...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">
              Command Center
            </h1>
            <p className="text-slate-300 text-sm sm:text-base">
              Mission Status: {user?.email}
            </p>
          </div>
          <OfflineIndicator />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <GraduationCap className="w-8 h-8 text-blue-400" />
                <Badge variant="secondary">{stats?.coursesEnrolled || 0}</Badge>
              </div>
              <p className="text-2xl font-bold text-white">{stats?.coursesCompleted || 0}</p>
              <p className="text-sm text-slate-400">Courses Completed</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats?.totalLearningHours || 0}h</p>
              <p className="text-sm text-slate-400">Training Hours</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Download className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats?.offlineContentCount || 0}</p>
              <p className="text-sm text-slate-400">Offline Content</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-8 h-8 text-orange-400" />
              </div>
              <p className="text-2xl font-bold text-white">{stats?.reportsApproved || 0}</p>
              <p className="text-sm text-slate-400">Reports Published</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Training Progress */}
          <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Target className="w-5 h-5 text-blue-400" />
                Training Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">Overall Completion</span>
                  <span className="font-semibold text-white">{stats?.completionRate || 0}%</span>
                </div>
                <Progress value={stats?.completionRate || 0} className="h-3" />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-400">{stats?.coursesEnrolled || 0}</p>
                  <p className="text-xs text-slate-400">Enrolled</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-400">
                    {(stats?.coursesEnrolled || 0) - (stats?.coursesCompleted || 0)}
                  </p>
                  <p className="text-xs text-slate-400">In Progress</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-400">{stats?.coursesCompleted || 0}</p>
                  <p className="text-xs text-slate-400">Completed</p>
                </div>
              </div>

              <Button asChild className="w-full">
                <Link to="/my-courses">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Continue Training
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start border-slate-600 text-white hover:bg-slate-700">
                <Link to="/dashboard/submit-report">
                  <FileText className="w-4 h-4 mr-2" />
                  Submit Report
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start border-slate-600 text-white hover:bg-slate-700">
                <Link to="/dashboard/offline-content">
                  <Download className="w-4 h-4 mr-2" />
                  Manage Offline
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start border-slate-600 text-white hover:bg-slate-700">
                <Link to="/dashboard/my-bunker">
                  <Shield className="w-4 h-4 mr-2" />
                  My Bunker
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start border-slate-600 text-white hover:bg-slate-700">
                <Link to="/courses">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Courses
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Preparedness Status */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="w-5 h-5 text-green-400" />
                Preparedness
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Notes</span>
                <Badge variant="secondary">{stats?.notesCount || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Checklists</span>
                <Badge variant="secondary">{stats?.checklistsCount || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Reports</span>
                <Badge variant="secondary">{stats?.reportsSubmitted || 0}</Badge>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full border-slate-600 text-white hover:bg-slate-700">
                <Link to="/dashboard/my-bunker">View Bunker</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Award className="w-5 h-5 text-yellow-400" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-yellow-400 mb-2">
                  {stats?.achievementsEarned || 0}
                </p>
                <p className="text-sm text-slate-400">Badges Earned</p>
              </div>
              {stats?.achievementsEarned === 0 && (
                <p className="text-xs text-slate-500 text-center">
                  Complete courses and submit reports to earn badges
                </p>
              )}
            </CardContent>
          </Card>

          {/* Activity */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="w-5 h-5 text-blue-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  No recent activity
                </p>
              ) : (
                <div className="space-y-2">
                  {recentActivity.slice(0, 3).map((activity) => (
                    <div key={activity.id} className="text-xs text-slate-400 border-b border-slate-700 pb-2">
                      <p className="font-medium text-slate-300">{activity.activity_type}</p>
                      <p className="text-slate-500">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Alert Banner */}
        {stats && stats.coursesEnrolled === 0 && (
          <Card className="mt-6 bg-blue-900/30 border-blue-700 backdrop-blur">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">Start Your Training</h3>
                  <p className="text-sm text-slate-300">
                    You haven't enrolled in any courses yet. Browse our survival and preparedness training to get started.
                  </p>
                </div>
                <Button asChild className="self-start sm:self-auto flex-shrink-0">
                  <Link to="/courses">Browse Courses</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
