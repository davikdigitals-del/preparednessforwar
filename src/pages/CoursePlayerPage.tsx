import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, CheckCircle, Lock, Play, FileText, HelpCircle, Download, Menu, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Course, CourseModule, CourseLesson, CourseEnrollment } from "@/types/monetization";

export default function CoursePlayerPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
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
      
      const courseResult = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .single();

      if (courseResult.error) throw courseResult.error;
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
      const modulesResult = await supabase
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

  if (!course || !currentLesson) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Course Not Available</h1>
        <Button onClick={() => navigate("/my-courses")}>Back to My Courses</Button>
      </div>
    );
  }

  const nextLesson = getNextLesson();
  const previousLesson = getPreviousLesson();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div>
              <h1 className="font-semibold text-lg">{course.title}</h1>
              <p className="text-sm text-gray-600">
                {enrollment?.progress_percentage}% Complete
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate("/my-courses")}>
            Exit Course
          </Button>
        </div>
        <Progress value={enrollment?.progress_percentage || 0} className="h-1 rounded-none" />
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed top-[73px] left-0 bottom-0 w-80 bg-white border-r border-gray-200 overflow-y-auto transition-transform z-10 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
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
        <main className={`flex-1 transition-all ${sidebarOpen ? "ml-80" : "ml-0"}`}>
          <div className="max-w-5xl mx-auto p-6">
            {/* Lesson Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">{currentLesson.title}</h2>
              {currentLesson.description && (
                <p className="text-gray-600">{currentLesson.description}</p>
              )}
            </div>

            {/* Lesson Content */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
              {currentLesson.content_type === "video" && currentLesson.video_url && (
                <div className="aspect-video bg-black">
                  <video
                    src={currentLesson.video_url}
                    controls
                    className="w-full h-full"
                    controlsList="nodownload noplaybackrate"
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

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
