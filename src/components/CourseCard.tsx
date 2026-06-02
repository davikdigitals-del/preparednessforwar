import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, Users, Star, BookOpen, Crown, Play, ChevronDown, ChevronUp, Lock, FileText, HelpCircle, Download, X, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MediaPlayer } from "@/components/MediaPlayer";
import type { Course, CourseModule, CourseLesson } from "@/types/monetization";

interface CourseCardProps {
  course: Course;
  featured?: boolean;
}

export function CourseCard({ course, featured = false }: CourseCardProps) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [playingLesson, setPlayingLesson] = useState<CourseLesson | null>(null);

  // Fetch episodes when expanded
  useEffect(() => {
    if (!expanded || modules.length > 0) return;
    fetchModules();
  }, [expanded]);

  // Check enrollment
  useEffect(() => {
    if (!user) return;
    supabase
      .from("course_enrollments")
      .select("id")
      .eq("course_id", course.id)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setEnrolled(!!data));
  }, [user, course.id]);

  const fetchModules = async () => {
    setLoadingModules(true);
    try {
      const { data } = await supabase
        .from("course_modules")
        .select("*, lessons:course_lessons(*)")
        .eq("course_id", course.id)
        .eq("is_published", true)
        .order("order_index", { ascending: true });
      setModules(data || []);
    } finally {
      setLoadingModules(false);
    }
  };

  const allLessons = modules.flatMap(m =>
    (m.lessons || [])
      .filter(l => l.is_published)
      .sort((a, b) => a.order_index - b.order_index)
  );

  const canPlay = (lesson: CourseLesson) =>
    course.is_free || lesson.is_preview || enrolled;

  const handlePlay = (lesson: CourseLesson) => {
    if (!canPlay(lesson)) return;
    setPlayingLesson(lesson);
  };

  const lessonIcon = (lesson: CourseLesson) => {
    switch (lesson.content_type) {
      case "video":    return <Play className="w-3.5 h-3.5" />;
      case "text":     return <FileText className="w-3.5 h-3.5" />;
      case "quiz":     return <HelpCircle className="w-3.5 h-3.5" />;
      case "download": return <Download className="w-3.5 h-3.5" />;
      default:         return <FileText className="w-3.5 h-3.5" />;
    }
  };

  return (
    <>
      <div className={`bg-white border-2 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl ${
        featured ? "border-blue-900" : "border-gray-200 hover:border-blue-900"
      }`}>

        {/* ── Thumbnail ── */}
        <Link to={`/courses/${course.slug}`} className="block aspect-video bg-gray-100 overflow-hidden relative group">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
              <BookOpen className="w-16 h-16 text-white opacity-50" />
            </div>
          )}

          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
              <Play className="w-6 h-6 text-blue-900 fill-blue-900 ml-1" />
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {course.is_free ? (
              <span className="px-2.5 py-0.5 bg-green-600 text-white text-xs font-bold uppercase rounded">FREE</span>
            ) : (
              <span className="px-2.5 py-0.5 bg-primary text-white text-xs font-bold uppercase rounded flex items-center gap-1">
                <Crown className="w-3 h-3" /> PREMIUM
              </span>
            )}
            {featured && (
              <span className="px-2.5 py-0.5 bg-yellow-500 text-white text-xs font-bold uppercase rounded">Featured</span>
            )}
          </div>
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-0.5 bg-white/90 backdrop-blur text-gray-900 text-xs font-semibold rounded capitalize">
              {course.level}
            </span>
          </div>
        </Link>

        {/* ── Info ── */}
        <div className="p-4">
          <Link to={`/courses/${course.slug}`}>
            <h3 className="font-bold text-lg leading-snug mb-1 line-clamp-2 hover:text-blue-900 transition-colors">
              {course.title}
            </h3>
          </Link>
          <p className="text-gray-500 text-sm line-clamp-2 mb-3">
            {course.short_description || course.description}
          </p>

          {/* Instructor row */}
          <div className="flex items-center gap-2 mb-3">
            {course.instructor_image_url ? (
              <img src={course.instructor_image_url} alt={course.instructor_name}
                className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-blue-900 flex items-center justify-center text-white text-xs font-bold">
                {course.instructor_name.charAt(0)}
              </div>
            )}
            <span className="text-sm text-gray-600 font-medium">{course.instructor_name}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold text-gray-700">{course.rating.toFixed(1)}</span>
                <span>({course.review_count})</span>
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {course.enrollment_count.toLocaleString()}
              </span>
            </div>
            {course.duration_hours && course.duration_hours > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {course.duration_hours}h
              </span>
            )}
          </div>

          {/* ── CTA button ── */}
          {course.course_type === 'episode' ? (
            <>
              {/* Episodes toggle button — only for episode type */}
              <button
                onClick={() => setExpanded(e => !e)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-900 transition-all"
              >
                <span className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  {expanded ? "Hide Episodes" : "View Episodes"}
                </span>
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* ── Episodes list ── */}
              {expanded && (
                <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                  {loadingModules ? (
                    <div className="py-6 text-center">
                      <div className="w-6 h-6 border-2 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : allLessons.length === 0 ? (
                    <p className="py-4 text-center text-sm text-gray-400">No episodes available yet</p>
                  ) : (
                    <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                      {allLessons.map((lesson, idx) => {
                        const playable = canPlay(lesson);
                        const isVideo = lesson.content_type === "video" && !!lesson.video_url;
                        return (
                          <div
                            key={lesson.id}
                            onClick={() => isVideo && handlePlay(lesson)}
                            className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${
                              isVideo && playable
                                ? "cursor-pointer hover:bg-blue-50 group"
                                : "cursor-default"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                              isVideo && playable
                                ? "bg-blue-100 text-blue-900 group-hover:bg-blue-900 group-hover:text-white"
                                : "bg-gray-100 text-gray-400"
                            }`}>
                              {!playable ? (
                                <Lock className="w-3.5 h-3.5" />
                              ) : isVideo ? (
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              ) : (
                                lessonIcon(lesson)
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${playable ? "text-gray-800" : "text-gray-400"}`}>
                                {idx + 1}. {lesson.title}
                              </p>
                              <p className="text-xs text-gray-400 capitalize flex items-center gap-1">
                                {lesson.content_type}
                                {lesson.video_duration ? ` · ${lesson.video_duration} min` : ""}
                                {lesson.is_preview && (
                                  <span className="ml-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-semibold">FREE</span>
                                )}
                              </p>
                            </div>
                            {!playable && <Lock className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {!enrolled && !course.is_free && (
                    <div className="p-3 bg-blue-50 border-t border-blue-100 text-center">
                      <p className="text-xs text-gray-600 mb-2">
                        {course.price > 0 ? `£${course.price} · ` : ""}Enroll to access all episodes
                      </p>
                      <Link
                        to={`/courses/${course.slug}`}
                        className="inline-block px-4 py-1.5 bg-blue-900 text-white text-xs font-semibold rounded hover:bg-blue-800 transition-colors"
                      >
                        Enroll Now
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Regular course — just a link to the detail page */
            <Link
              to={`/courses/${course.slug}`}
              className="w-full block text-center px-3 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              View Course
            </Link>
          )}
        </div>
      </div>

      {/* ── Direct Play Modal ── */}
      <Dialog open={!!playingLesson} onOpenChange={(open) => !open && setPlayingLesson(null)}>
        <DialogContent className="max-w-4xl w-full p-0 gap-0 overflow-hidden rounded-xl" aria-describedby={undefined}>
          {playingLesson && (
            <div className="flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white">
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">{course.title}</p>
                  <h3 className="font-bold truncate">{playingLesson.title}</h3>
                </div>
                <button
                  onClick={() => setPlayingLesson(null)}
                  className="ml-4 shrink-0 p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Player */}
              {playingLesson.content_type === "video" && playingLesson.video_url ? (
                <MediaPlayer
                  url={playingLesson.video_url}
                  title={playingLesson.title}
                  isPremium={!playingLesson.is_preview}
                  type="video"
                  thumbnail={course.thumbnail_url}
                />
              ) : playingLesson.content_type === "text" && playingLesson.text_content ? (
                <div className="p-6 prose max-w-none overflow-y-auto max-h-[70vh]"
                  dangerouslySetInnerHTML={{ __html: playingLesson.text_content }} />
              ) : (
                <div className="aspect-video bg-gray-900 flex items-center justify-center text-gray-400">
                  <p className="text-sm">No content available for this lesson</p>
                </div>
              )}

              {/* Episode navigation strip */}
              {allLessons.length > 1 && (
                <div className="bg-gray-900 px-4 py-3 border-t border-gray-700">
                  <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">Episodes</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {allLessons.map((lesson, idx) => {
                      const playable = canPlay(lesson);
                      const active = lesson.id === playingLesson.id;
                      return (
                        <button
                          key={lesson.id}
                          disabled={!playable || lesson.content_type !== "video" || !lesson.video_url}
                          onClick={() => playable && setPlayingLesson(lesson)}
                          className={`shrink-0 w-36 text-left px-2.5 py-2 rounded-lg border transition-all text-xs ${
                            active
                              ? "bg-blue-900 border-blue-700 text-white"
                              : playable
                                ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                                : "bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed"
                          }`}
                        >
                          <p className="font-semibold truncate">{idx + 1}. {lesson.title}</p>
                          <p className="text-[10px] mt-0.5 opacity-70 flex items-center gap-1">
                            {!playable && <Lock className="w-2.5 h-2.5" />}
                            {lesson.video_duration ? `${lesson.video_duration} min` : lesson.content_type}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Enroll prompt for locked lessons */}
              {!enrolled && !course.is_free && (
                <div className="bg-white px-4 py-3 border-t flex items-center justify-between gap-4">
                  <p className="text-sm text-gray-600">
                    Watching a preview. Enroll to access all {allLessons.length} episodes.
                  </p>
                  <Link
                    to={`/courses/${course.slug}`}
                    className="shrink-0 px-4 py-2 bg-blue-900 text-white text-sm font-semibold rounded hover:bg-blue-800 transition-colors"
                    onClick={() => setPlayingLesson(null)}
                  >
                    Enroll Now
                  </Link>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
