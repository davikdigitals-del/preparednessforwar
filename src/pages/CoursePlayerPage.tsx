import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { publicSupabase } from "@/integrations/supabase/publicClient";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, CheckCircle, Play, FileText, HelpCircle, Download, Menu, X, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MediaPlayer } from "@/components/MediaPlayer";
import type { Course, CourseModule, CourseLesson, CourseEnrollment } from "@/types/monetization";

export default function CoursePlayerPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
  const [currentLesson, setCurrentLesson] = useState<CourseLesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (authLoading) return;
    if (slug && user) {
      fetchCourseData();
    } else if (!user) {
      navigate("/login");
    }
  }, [slug, user, authLoading]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Try exact slug match first, then prefix match (handles timestamp-suffixed slugs)
      let courseResult = await publicSupabase
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      // If not found by exact slug, try prefix match (e.g. "we-move" matches "we-move-lx7k2")
      if (!courseResult.error && !courseResult.data) {
        const prefixResult = await publicSupabase
          .from("courses")
          .select("*")
          .like("slug", `${slug}%`)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        courseResult = prefixResult;
      }

      if (courseResult.error) throw courseResult.error;
      
      if (!courseResult.data) {
        setCourse(null);
        setLoading(false);
        return;
      }
      
      setCourse(courseResult.data);

      // Check enrollment
      const enrollmentResult = await supabase
        .from("course_enrollments")
        .select("*")
        .eq("course_id", courseResult.data.id)
        .eq("user_id", user!.id)
        .single();

      if (enrollmentResult.error || !enrollmentResult.data) {
        toast({
          title: "Access Denied",
          description: "You must enroll in this course first",
          variant: "destructive",
        });
        navigate(`/courses/${slug}`);
        return;
      }

      setEnrollment(enrollmentResult.data);

      // Fetch modules and lessons
      const modulesResult = await publicSupabase
        .from("course_modules")
        .select(`
          *,
          lessons:course_lessons(*)
        `)
        .eq("course_id", courseResult.data.id)
        .eq("is_published", true)
        .order("order_index", { ascending: true });

      if (modulesResult.error) throw modulesResult.error;

      const modulesData = modulesResult.data || [];
      setModules(modulesData);

      // Set current lesson (last accessed or first lesson)
      if (enrollmentResult.data.last_accessed_lesson_id) {
        const lesson = modulesData
          .flatMap(m => m.lessons || [])
          .find(l => l.id === enrollmentResult.data.last_accessed_lesson_id);
        setCurrentLesson(lesson || modulesData[0]?.lessons?.[0] || null);
      } else {
        setCurrentLesson(modulesData[0]?.lessons?.[0] || null);
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLessonComplete = async () => {
    if (!currentLesson || !enrollment) return;

    try {
      const completedLessons = enrollment.completed_lessons || [];
      if (completedLessons.includes(currentLesson.id)) {
        toast({ title: "Already completed", description: "This lesson is already marked as complete" });
        return;
      }

      const newCompletedLessons = [...completedLessons, currentLesson.id];
      const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
      const progressPercentage = Math.round((newCompletedLessons.length / totalLessons) * 100);

      const { error } = await supabase
        .from("course_enrollments")
        .update({
          completed_lessons: newCompletedLessons,
          progress_percentage: progressPercentage,
          last_accessed_lesson_id: currentLesson.id,
          is_completed: progressPercentage === 100,
          completed_at: progressPercentage === 100 ? new Date().toISOString() : null,
        })
        .eq("id", enrollment.id);

      if (error) throw error;

      setEnrollment({
        ...enrollment,
        completed_lessons: newCompletedLessons,
        progress_percentage: progressPercentage,
        is_completed: progressPercentage === 100,
      });

      toast({ title: "Progress saved", description: "Lesson marked as complete!" });

      if (progressPercentage === 100) {
        toast({
          title: "🎉 Congratulations!",
          description: "You've completed the course!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLessonChange = async (lesson: CourseLesson) => {
    setCurrentLesson(lesson);

    if (enrollment) {
      await supabase
        .from("course_enrollments")
        .update({ last_accessed_lesson_id: lesson.id })
        .eq("id", enrollment.id);
    }
  };

  const getNextLesson = () => {
    if (!currentLesson) return null;
    
    const allLessons = modules.flatMap(m => m.lessons || []);
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
    return allLessons[currentIndex + 1] || null;
  };

  const getPreviousLesson = () => {
    if (!currentLesson) return null;
    
    const allLessons = modules.flatMap(m => m.lessons || []);
    const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
    return allLessons[currentIndex - 1] || null;
  };

  const isLessonCompleted = (lessonId: string) => {
    return enrollment?.completed_lessons?.includes(lessonId) || false;
  };

  const getLessonIcon = (lesson: CourseLesson) => {
    if (isLessonCompleted(lesson.id)) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    
    switch (lesson.content_type) {
      case "video": return <Play className="w-5 h-5 text-gray-400" />;
      case "text": return <FileText className="w-5 h-5 text-gray-400" />;
      case "quiz": return <HelpCircle className="w-5 h-5 text-gray-400" />;
      case "download": return <Download className="w-5 h-5 text-gray-400" />;
      default: return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Course Not Found</h1>
        <p className="text-gray-500 mb-6">This course doesn't exist or may have been removed.</p>
        <Button onClick={() => navigate("/courses")}>Browse Courses</Button>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="container py-16 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Play className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
        <p className="text-gray-500 mb-6">
          This course has no lessons yet. Check back soon.
        </p>
        {isAdmin && (
          <Link
            to={`/admin/courses/${course.id}/builder`}
            className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-900 text-white text-sm font-semibold rounded hover:bg-blue-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Add Lessons in Builder
          </Link>
        )}
        <div className="mt-3">
          <Button variant="outline" onClick={() => navigate("/my-courses")}>
            Back to My Courses
          </Button>
        </div>
      </div>
    );
  }

  const nextLesson = getNextLesson();
  const previousLesson = getPreviousLesson();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div
        className="bg-white border-b border-gray-200 sticky z-20"
        style={{ top: 'var(--header-height, 98px)' }}
      >
        <div className="px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="min-w-0">
              <h1 className="font-semibold text-sm sm:text-lg truncate">{course.title}</h1>
              <p className="text-xs sm:text-sm text-gray-600">
                {enrollment?.progress_percentage}% Complete
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/my-courses")} className="shrink-0">
            <span className="hidden sm:inline">Exit Course</span>
            <X className="w-4 h-4 sm:hidden" />
          </Button>
        </div>
        <Progress value={enrollment?.progress_percentage || 0} className="h-1 rounded-none" />
      </div>

      <div className="flex">
        {/* Sidebar — overlay on mobile, fixed on desktop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside
          className={`fixed left-0 bottom-0 w-72 sm:w-80 bg-white border-r border-gray-200 overflow-y-auto transition-transform z-20 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ top: 'calc(var(--header-height, 98px) + 57px)' }}
        >
          <div className="p-4">
            <h2 className="font-semibold text-lg mb-4">Course Content</h2>
            <div className="space-y-2">
              {modules.map((module, moduleIndex) => (
                <div key={module.id}>
                  <div className="font-medium text-sm text-gray-700 mb-2 px-2">
                    Module {moduleIndex + 1}: {module.title}
                  </div>
                  <div className="space-y-1">
                    {module.lessons?.map((lesson, lessonIndex) => (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonChange(lesson)}
                        className={`w-full text-left px-3 py-2 rounded flex items-center gap-3 transition-colors ${
                          currentLesson?.id === lesson.id
                            ? "bg-blue-50 text-blue-900 border border-blue-200"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {getLessonIcon(lesson)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {lessonIndex + 1}. {lesson.title}
                          </p>
                          {lesson.video_duration && (
                            <p className="text-xs text-gray-500">{lesson.video_duration} min</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all min-w-0 ${sidebarOpen ? "lg:ml-80" : "ml-0"}`}>
          <div className="max-w-5xl mx-auto p-3 sm:p-6">
            {/* Lesson Header */}
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-3xl font-bold mb-2">{currentLesson.title}</h2>
              {currentLesson.description && (
                <p className="text-gray-600 text-sm sm:text-base">{currentLesson.description}</p>
              )}
            </div>

            {/* Lesson Content */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
              {currentLesson.content_type === "video" && currentLesson.video_url ? (
                <MediaPlayer
                  url={currentLesson.video_url}
                  title={currentLesson.title}
                  isPremium={true}
                  type="video"
                  thumbnail={course.thumbnail_url}
                />
              ) : currentLesson.content_type === "video" && !currentLesson.video_url ? (
                <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Play className="w-12 h-12 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No video URL set for this lesson</p>
                  </div>
                </div>
              ) : null}

              {currentLesson.content_type === "text" && currentLesson.text_content && (
                <div className="p-8 prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: currentLesson.text_content }} />
                </div>
              )}

              {currentLesson.content_type === "quiz" && (
                <div className="p-8 text-center">
                  <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Quiz</h3>
                  <p className="text-gray-600 mb-4">Quiz functionality coming soon!</p>
                </div>
              )}

              {currentLesson.content_type === "download" && (
                <div className="p-8 text-center">
                  <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Course Resources</h3>
                  <p className="text-gray-600 mb-4">Additional materials for this lesson</p>
                  <p className="text-sm text-gray-500">Resources are viewable online only</p>
                </div>
              )}
            </div>

            {/* Lesson Actions */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                onClick={() => previousLesson && handleLessonChange(previousLesson)}
                disabled={!previousLesson}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {!isLessonCompleted(currentLesson.id) && (
                <Button onClick={handleLessonComplete}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Complete
                </Button>
              )}

              <Button
                onClick={() => nextLesson && handleLessonChange(nextLesson)}
                disabled={!nextLesson}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Course Completion */}
            {enrollment?.is_completed && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-900 mb-2">
                  🎉 Congratulations!
                </h3>
                <p className="text-green-700 mb-4">
                  You've completed this course!
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
