import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { publicSupabase } from "@/integrations/supabase/publicClient";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, CheckCircle, Play, FileText, HelpCircle, Download, Menu, X, Settings, RotateCcw, Trophy, Award, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CourseVideoPlayer } from "@/components/CourseVideoPlayer";
import type { Course, CourseModule, CourseLesson, CourseEnrollment, CourseQuiz, QuizQuestion } from "@/types/monetization";

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

  // Quiz state
  const [quiz, setQuiz] = useState<CourseQuiz | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [previousAttempt, setPreviousAttempt] = useState<{ score: number; passed: boolean } | null>(null);

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
        const initialLesson = lesson || modulesData[0]?.lessons?.[0] || null;
        setCurrentLesson(initialLesson);
        if (initialLesson?.content_type === "quiz") {
          fetchQuiz(initialLesson.id);
        }
      } else {
        const initialLesson = modulesData[0]?.lessons?.[0] || null;
        setCurrentLesson(initialLesson);
        if (initialLesson?.content_type === "quiz") {
          fetchQuiz(initialLesson.id);
        }
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
        // Issue certificate automatically
        issueCertificate(enrollment.id);
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
    // Reset quiz state when switching lessons
    setQuiz(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
    setPreviousAttempt(null);

    if (enrollment) {
      await supabase
        .from("course_enrollments")
        .update({ last_accessed_lesson_id: lesson.id })
        .eq("id", enrollment.id);
    }

    // If this is a quiz lesson, load the quiz data
    if (lesson.content_type === "quiz") {
      fetchQuiz(lesson.id);
    }
  };

  const fetchQuiz = async (lessonId: string) => {
    setQuizLoading(true);
    try {
      const { data: quizData, error: quizError } = await publicSupabase
        .from("course_quizzes")
        .select("*")
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (quizError) throw quizError;
      setQuiz(quizData || null);

      // Check for a previous attempt by this user
      if (quizData && enrollment) {
        const { data: attemptData } = await supabase
          .from("quiz_attempts")
          .select("score, passed")
          .eq("quiz_id", quizData.id)
          .eq("user_id", user!.id)
          .order("attempted_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (attemptData) {
          setPreviousAttempt({ score: attemptData.score, passed: attemptData.passed });
        }
      }
    } catch (error: any) {
      console.error("Failed to load quiz:", error);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (!quiz || !enrollment) return;
    const questions: QuizQuestion[] = quiz.questions;

    // Score the attempt
    let correct = 0;
    questions.forEach((q, i) => {
      if (quizAnswers[i] === q.correct_answer) correct++;
    });
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= quiz.passing_score;

    setQuizResult({ score, passed });
    setQuizSubmitted(true);

    try {
      // Save the attempt
      await supabase.from("quiz_attempts").insert([
        {
          quiz_id: quiz.id,
          user_id: user!.id,
          enrollment_id: enrollment.id,
          answers: quizAnswers,
          score,
          passed,
        },
      ]);

      // Auto-complete the lesson if passed
      if (passed) {
        const completedLessons = enrollment.completed_lessons || [];
        if (!completedLessons.includes(currentLesson!.id)) {
          const newCompleted = [...completedLessons, currentLesson!.id];
          const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
          const progress = Math.round((newCompleted.length / totalLessons) * 100);

          await supabase
            .from("course_enrollments")
            .update({
              completed_lessons: newCompleted,
              progress_percentage: progress,
              is_completed: progress === 100,
              completed_at: progress === 100 ? new Date().toISOString() : null,
            })
            .eq("id", enrollment.id);

          setEnrollment({
            ...enrollment,
            completed_lessons: newCompleted,
            progress_percentage: progress,
            is_completed: progress === 100,
          });
          if (progress === 100) issueCertificate(enrollment.id);
        }
        toast({ title: "Quiz passed!", description: `You scored ${score}% — lesson completed.` });
      } else {
        toast({
          title: "Quiz not passed",
          description: `You scored ${score}%. You need ${quiz.passing_score}% to pass.`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Failed to save quiz attempt:", error);
    }
  };

  const handleRetakeQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
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
      <div className="bg-white border-b border-gray-200 sticky top-0 z-[60]">
        <div className="px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="relative z-50"
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

      <div className="flex relative">
        {/* Sidebar overlay backdrop - only on mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            style={{ top: '57px' }}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}
        
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static
            left-0
            h-screen lg:h-auto
            w-80 lg:w-96
            bg-white border-r border-gray-200
            overflow-y-auto
            transform transition-transform duration-300 ease-in-out
            z-40 lg:z-10
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            ${sidebarOpen ? "lg:block" : "lg:hidden"}
          `}
          style={{ 
            top: "57px",
            height: "calc(100vh - 57px)",
          }}
        >          <div className="p-4">
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
        <main className="flex-1 min-w-0 w-full">
          <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
            {/* Lesson Header */}
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">{currentLesson.title}</h2>
              {currentLesson.description && (
                <p className="text-gray-600 text-sm sm:text-base">{currentLesson.description}</p>
              )}
            </div>

            {/* Lesson Content */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
              {currentLesson.content_type === "video" && currentLesson.video_url ? (
                <CourseVideoPlayer
                  url={currentLesson.video_url}
                  title={currentLesson.title}
                  thumbnail={course.thumbnail_url}
                  courseId={course.id}
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
                <div className="p-6 sm:p-8">
                  {quizLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : !quiz ? (
                    <div className="text-center py-12">
                      <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Quiz Yet</h3>
                      <p className="text-gray-500">The quiz for this lesson hasn't been set up yet. Check back soon.</p>
                    </div>
                  ) : quizSubmitted && quizResult ? (
                    /* ── Results screen ── */
                    <div className="max-w-lg mx-auto text-center">
                      {quizResult.passed ? (
                        <>
                          <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
                          <h3 className="text-2xl font-bold text-green-700 mb-2">Quiz Passed!</h3>
                        </>
                      ) : (
                        <>
                          <HelpCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
                          <h3 className="text-2xl font-bold text-red-700 mb-2">Not Quite</h3>
                        </>
                      )}
                      <p className="text-4xl font-bold mb-2">{quizResult.score}%</p>
                      <p className="text-gray-600 mb-6">
                        {quizResult.passed
                          ? "Great work — this lesson has been marked complete."
                          : `You need ${quiz.passing_score}% to pass. Give it another try!`}
                      </p>

                      {/* Answer review */}
                      <div className="text-left space-y-4 mb-8">
                        {(quiz.questions as QuizQuestion[]).map((q, i) => {
                          const selected = quizAnswers[i];
                          const correct = q.correct_answer;
                          const isCorrect = selected === correct;
                          return (
                            <div
                              key={i}
                              className={`border rounded-lg p-4 ${
                                isCorrect ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"
                              }`}
                            >
                              <p className="font-medium mb-2">
                                {i + 1}. {q.question}
                              </p>
                              {q.options.map((opt, oi) => (
                                <p
                                  key={oi}
                                  className={`text-sm py-1 px-2 rounded mb-1 ${
                                    oi === correct
                                      ? "bg-green-200 text-green-900 font-semibold"
                                      : oi === selected && !isCorrect
                                      ? "bg-red-200 text-red-900"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {oi === correct && "✓ "}
                                  {oi === selected && !isCorrect && "✗ "}
                                  {opt}
                                </p>
                              ))}
                              {q.explanation && (
                                <p className="text-xs text-gray-600 mt-2 italic">{q.explanation}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {!quizResult.passed && (
                        <Button onClick={handleRetakeQuiz}>
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Retake Quiz
                        </Button>
                      )}
                    </div>
                  ) : (
                    /* ── Quiz questions ── */
                    <div className="max-w-2xl mx-auto">
                      <div className="flex items-center gap-3 mb-6">
                        <HelpCircle className="w-8 h-8 text-blue-600 shrink-0" />
                        <div>
                          <h3 className="text-xl font-bold">{quiz.title}</h3>
                          {quiz.description && (
                            <p className="text-gray-600 text-sm mt-0.5">{quiz.description}</p>
                          )}
                        </div>
                      </div>

                      {previousAttempt && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6 text-sm text-blue-800">
                          Previous best: <strong>{previousAttempt.score}%</strong>{" "}
                          {previousAttempt.passed ? "— Passed ✓" : `— Need ${quiz.passing_score}% to pass`}
                        </div>
                      )}

                      <p className="text-sm text-gray-500 mb-6">
                        {(quiz.questions as QuizQuestion[]).length} questions · Passing score: {quiz.passing_score}%
                      </p>

                      <div className="space-y-6">
                        {(quiz.questions as QuizQuestion[]).map((q, i) => (
                          <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                            <p className="font-semibold mb-3">
                              {i + 1}. {q.question}
                            </p>
                            <div className="space-y-2">
                              {q.options.map((opt, oi) => (
                                <label
                                  key={oi}
                                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                    quizAnswers[i] === oi
                                      ? "bg-blue-50 border-blue-500 text-blue-900"
                                      : "bg-white border-gray-200 hover:bg-gray-50"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`q${i}`}
                                    value={oi}
                                    checked={quizAnswers[i] === oi}
                                    onChange={() =>
                                      setQuizAnswers(prev => ({ ...prev, [i]: oi }))
                                    }
                                    className="w-4 h-4 accent-blue-600"
                                  />
                                  <span className="text-sm">{opt}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 flex justify-end">
                        <Button
                          onClick={handleQuizSubmit}
                          disabled={
                            Object.keys(quizAnswers).length <
                            (quiz.questions as QuizQuestion[]).length
                          }
                          size="lg"
                        >
                          Submit Quiz
                        </Button>
                      </div>
                    </div>
                  )}
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
            <div className="flex items-center justify-between mb-6 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => previousLesson && handleLessonChange(previousLesson)}
                disabled={!previousLesson}
                className="shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>

              {!isLessonCompleted(currentLesson.id) && (
                <Button onClick={handleLessonComplete} size="sm" className="flex-1 sm:flex-none">
                  <CheckCircle className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Mark as Complete</span>
                  <span className="sm:hidden ml-1">Done</span>
                </Button>
              )}

              <Button
                size="sm"
                onClick={() => nextLesson && handleLessonChange(nextLesson)}
                disabled={!nextLesson}
                className="shrink-0"
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="w-4 h-4" />
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
