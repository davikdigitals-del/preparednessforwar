import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { Button } from "@/components/ui/button";
import { Clock, Users, Star, BookOpen, Globe, Award, CheckCircle, Play, Lock, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Course, CourseModule, CourseReview } from "@/types/monetization";

export default function CourseDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = usePremiumStatus();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      fetchCourseData();
    }
  }, [slug, user]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);

      // Try exact slug match first, then prefix match for timestamp-suffixed slugs
      let courseResult = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

      if (!courseResult.error && !courseResult.data) {
        const prefixResult = await supabase
          .from("courses")
          .select("*")
          .like("slug", `${slug}%`)
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        courseResult = prefixResult;
      }

      if (courseResult.error) throw courseResult.error;

      const [modulesResult, reviewsResult] = await Promise.all([
        supabase
          .from("course_modules")
          .select(`*, lessons:course_lessons(*)`)
          .eq("is_published", true)
          .order("order_index", { ascending: true }),
        supabase
          .from("course_reviews")
          .select(`*, user:profiles(email, full_name)`)
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);
      
      setCourse(courseResult.data);
      
      if (courseResult.data) {
        const modulesData = modulesResult.data?.filter(m => m.course_id === courseResult.data.id) || [];
        setModules(modulesData);
        
        const reviewsData = reviewsResult.data?.filter(r => r.course_id === courseResult.data.id) || [];
        setReviews(reviewsData);

        // Check if user is enrolled
        if (user) {
          const { data: enrollmentData } = await supabase
            .from("course_enrollments")
            .select("*")
            .eq("course_id", courseResult.data.id)
            .eq("user_id", user.id)
            .single();
          
          setEnrollment(enrollmentData);
        }
      }
    } catch (error: any) {
      console.error("Error fetching course:", error);
      toast({
        title: "Error",
        description: "Course not found",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (course?.is_free || isPremium) {
      // Free course OR premium subscriber â€” enroll for free
      createFreeEnrollment();
    } else {
      // Redirect to subscribe page
      navigate(`/subscribe`);
    }
  };

  const createFreeEnrollment = async () => {
    if (!course || !user) return;

    try {
      const { error } = await supabase.from("course_enrollments").insert([
        {
          course_id: course.id,
          user_id: user.id,
          payment_status: "completed",
          payment_amount: 0,
          payment_currency: course.currency,
          progress_percentage: 0,
          completed_lessons: [],
        },
      ]);

      if (error) throw error;

      toast({ title: "Success", description: "You're enrolled! Start learning now." });
      navigate(`/courses/${course.slug}/learn`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
        <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate("/courses")}>Browse All Courses</Button>
      </div>
    );
  }

  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  const previewLessons = modules.flatMap(m => m.lessons?.filter(l => l.is_preview) || []);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 text-white py-12">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Course Info */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <Link to="/courses" className="text-red-200 hover:text-white text-sm">
                  â† Back to Training Programs
                </Link>
              </div>
              
              <h1 className="font-display text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-blue-100 mb-6">{course.short_description}</p>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{course.rating.toFixed(1)}</span>
                  <span className="text-blue-200">({course.review_count} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{course.enrollment_count.toLocaleString()} students</span>
                </div>
                {course.duration_hours && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{course.duration_hours} hours</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  <span className="capitalize">{course.language}</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur p-4 rounded-lg">
                {course.instructor_image_url ? (
                  <img
                    src={course.instructor_image_url}
                    alt={course.instructor_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-red-800 flex items-center justify-center text-white font-bold">
                    {course.instructor_name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm text-red-200">Expert Instructor</p>
                  <p className="font-semibold">{course.instructor_name}</p>
                </div>
              </div>
            </div>

            {/* Right: Enrollment Card */}
            <div className="lg:col-span-1">
              <div className="bg-white text-gray-900 rounded-lg p-6 shadow-xl sticky top-4">
                {course.thumbnail_url && (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full aspect-video object-cover rounded-lg mb-4"
                  />
                )}
                
                <div className="mb-4">
                  {course.is_free ? (
                    <p className="text-3xl font-bold text-green-600">FREE</p>
                  ) : isPremium ? (
                    <div>
                      <p className="text-3xl font-bold text-primary flex items-center gap-2">
                        <Crown className="w-7 h-7" /> Premium
                      </p>
                      <p className="text-sm text-green-600 font-medium mt-1">Included in your subscription</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Crown className="w-5 h-5 text-primary" />
                        <span className="text-sm font-semibold text-primary">Premium Members Only</span>
                      </div>
                      <p className="text-3xl font-bold">£{course.price}</p>
                      <p className="text-sm text-gray-500 mt-1">or subscribe for unlimited access</p>
                    </div>
                  )}
                </div>

                {enrollment ? (
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="font-semibold text-green-900">You're Enrolled!</p>
                      <p className="text-sm text-green-700">Progress: {enrollment.progress_percentage}%</p>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => navigate(`/courses/${course.slug}/learn`)}
                    >
                      Continue Learning
                    </Button>
                  </div>
                ) : course.is_free || isPremium ? (
                  <Button className="w-full" size="lg" onClick={handleEnroll}>
                    {course.is_free ? "Enroll for Free" : "Start Learning"}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button className="w-full" size="lg" onClick={handleEnroll}>
                      <Crown className="w-4 h-4 mr-2" />
                      Subscribe to Access
                    </Button>
                    <p className="text-xs text-center text-gray-500">
                      Get unlimited access to all courses
                    </p>
                  </div>
                )}

                <div className="mt-6 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-gray-600" />
                    <span>{totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span>Lifetime access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            {course.what_you_learn && course.what_you_learn.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h2 className="font-display text-2xl font-bold mb-4">What You'll Master</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.what_you_learn.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h2 className="font-display text-2xl font-bold mb-4">About This Training Program</h2>
              <div className="prose max-w-none text-gray-700">
                {course.description}
              </div>
            </div>

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-bold mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {course.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-blue-600 mt-1">â€¢</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Curriculum */}
            <div>
              <h2 className="font-display text-2xl font-bold mb-4">Course Curriculum</h2>
              <div className="space-y-3">
                {modules.map((module, moduleIndex) => (
                  <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4">
                      <h3 className="font-semibold">
                        Module {moduleIndex + 1}: {module.title}
                      </h3>
                      {module.description && (
                        <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        {module.lessons?.length || 0} lessons
                      </p>
                    </div>
                    <div className="divide-y">
                      {module.lessons?.map((lesson, lessonIndex) => (
                        <div key={lesson.id} className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {lesson.is_preview ? (
                              <Play className="w-5 h-5 text-green-600" />
                            ) : (
                              <Lock className="w-5 h-5 text-gray-400" />
                            )}
                            <div>
                              <p className="font-medium">
                                {lessonIndex + 1}. {lesson.title}
                              </p>
                              <p className="text-sm text-gray-600 capitalize">{lesson.content_type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {lesson.video_duration && (
                              <span className="text-sm text-gray-600">{lesson.video_duration} min</span>
                            )}
                            {lesson.is_preview && (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Preview</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-bold mb-4">Student Reviews</h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold">
                            {review.user?.full_name?.charAt(0) || review.user?.email.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold">{review.user?.full_name || "Student"}</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? "text-yellow-500 fill-yellow-500"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.review_text && (
                        <p className="text-gray-700">{review.review_text}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Instructor Bio */}
            {course.instructor_bio && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-lg mb-3">About the Instructor</h3>
                <div className="flex items-center gap-3 mb-3">
                  {course.instructor_image_url ? (
                    <img
                      src={course.instructor_image_url}
                      alt={course.instructor_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-900 flex items-center justify-center text-white text-xl font-bold">
                      {course.instructor_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{course.instructor_name}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{course.instructor_bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
