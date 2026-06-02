import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Award, TrendingUp, Play, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CourseEnrollment, Course } from "@/types/monetization";
import { PortalBreadcrumb } from "@/components/PortalBreadcrumb";

interface EnrollmentWithCourse extends CourseEnrollment {
  course?: Course;
}

export default function MyCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return; // wait for auth to finish loading
    if (user) {
      fetchEnrollments();
    } else {
      navigate("/login");
    }
  }, [user, authLoading]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("course_enrollments")
        .select(`
          *,
          course:courses(*)
        `)
        .eq("user_id", user!.id)
        .order("enrolled_at", { ascending: false });

      if (error) throw error;
      setEnrollments(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const inProgressCourses = enrollments.filter(e => !e.is_completed && e.progress_percentage > 0);
  const completedCourses = enrollments.filter(e => e.is_completed);
  const notStartedCourses = enrollments.filter(e => e.progress_percentage === 0);

  const totalHoursLearned = enrollments.reduce((sum, e) => {
    const courseHours = e.course?.duration_hours || 0;
    const progress = e.progress_percentage / 100;
    return sum + (courseHours * progress);
  }, 0);

  const certificatesEarned = enrollments.filter(e => e.certificate_issued).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container pt-6">
        <PortalBreadcrumb items={[{ label: "My Courses" }]} />
      </div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-8 sm:py-12">
        <div className="container px-4">
          <h1 className="font-display text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">My Learning Dashboard</h1>
          <p className="text-sm sm:text-xl text-blue-100">Track your progress and continue your learning journey</p>
        </div>
      </div>

      <div className="container px-4 py-8 sm:py-12">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold">{enrollments.length}</p>
            <p className="text-gray-600">Enrolled Courses</p>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold">{inProgressCourses.length}</p>
            <p className="text-gray-600">In Progress</p>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold">{Math.round(totalHoursLearned)}</p>
            <p className="text-gray-600">Hours Learned</p>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold">{completedCourses.length}</p>
            <p className="text-gray-600">Completed</p>
          </div>
        </div>

        {enrollments.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Courses Yet</h2>
            <p className="text-gray-600 mb-6">Start your learning journey by enrolling in a course</p>
            <Button onClick={() => navigate("/courses")}>
              Browse Courses
            </Button>
          </div>
        ) : (
          <>
            {/* Continue Learning */}
            {inProgressCourses.length > 0 && (
              <div className="mb-12">
                <h2 className="font-display text-3xl font-bold mb-6">Continue Learning</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inProgressCourses.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-900 hover:shadow-lg transition-all"
                    >
                      {enrollment.course?.thumbnail_url && (
                        <div className="aspect-video bg-gray-100 overflow-hidden">
                          <img
                            src={enrollment.course.thumbnail_url}
                            alt={enrollment.course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">
                          {enrollment.course?.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          by {enrollment.course?.instructor_name}
                        </p>
                        
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-semibold">{enrollment.progress_percentage}%</span>
                          </div>
                          <Progress value={enrollment.progress_percentage} />
                        </div>

                        <Button
                          className="w-full"
                          onClick={() => navigate(`/courses/${enrollment.course?.slug}/learn`)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Continue Learning
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Not Started */}
            {notStartedCourses.length > 0 && (
              <div className="mb-12">
                <h2 className="font-display text-3xl font-bold mb-6">Start Learning</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {notStartedCourses.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-900 hover:shadow-lg transition-all"
                    >
                      {enrollment.course?.thumbnail_url && (
                        <div className="aspect-video bg-gray-100 overflow-hidden">
                          <img
                            src={enrollment.course.thumbnail_url}
                            alt={enrollment.course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">
                          {enrollment.course?.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          by {enrollment.course?.instructor_name}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                          {enrollment.course?.duration_hours && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {enrollment.course.duration_hours}h
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {enrollment.course?.level}
                          </div>
                        </div>

                        <Button
                          className="w-full"
                          onClick={() => navigate(`/courses/${enrollment.course?.slug}/learn`)}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Course
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Courses */}
            {completedCourses.length > 0 && (
              <div>
                <h2 className="font-display text-3xl font-bold mb-6">Completed Courses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedCourses.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="bg-white border-2 border-green-200 rounded-lg overflow-hidden hover:shadow-lg transition-all"
                    >
                      {enrollment.course?.thumbnail_url && (
                        <div className="aspect-video bg-gray-100 overflow-hidden relative">
                          <img
                            src={enrollment.course.thumbnail_url}
                            alt={enrollment.course.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-green-600/20 flex items-center justify-center">
                            <CheckCircle className="w-16 h-16 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-semibold text-green-600">Completed</span>
                        </div>
                        
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">
                          {enrollment.course?.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          by {enrollment.course?.instructor_name}
                        </p>

                        {enrollment.completed_at && (
                          <p className="text-xs text-gray-500 mb-4">
                            Completed on {new Date(enrollment.completed_at).toLocaleDateString()}
                          </p>
                        )}

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => navigate(`/courses/${enrollment.course?.slug}/learn`)}
                          >
                            Review
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div className="mt-12 bg-blue-50 border-2 border-blue-900 rounded-lg p-8 text-center">
          <h2 className="font-display text-3xl font-bold mb-4">Ready to Learn More?</h2>
          <p className="text-lg text-gray-700 mb-6">
            Explore our full catalog of survival and preparedness courses
          </p>
          <Button size="lg" onClick={() => navigate("/courses")}>
            Browse All Courses
          </Button>
        </div>
      </div>
    </div>
  );
}
