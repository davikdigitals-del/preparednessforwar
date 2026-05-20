import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DownloadButton } from "@/components/DownloadButton";
import { GraduationCap, Play, Clock, CheckCircle, BookOpen, TrendingUp, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CourseEnrollment, Course } from "@/types/monetization";

interface EnrollmentWithCourse extends CourseEnrollment {
  course?: Course;
}

export default function TrainingAcademy() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEnrollments();
    } else {
      navigate("/login");
    }
  }, [user]);

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

  const CourseCard = ({ enrollment }: { enrollment: EnrollmentWithCourse }) => (
    <Card className="hover:shadow-lg transition-all">
      {enrollment.course?.thumbnail_url && (
        <div className="aspect-video bg-gray-100 overflow-hidden relative">
          <img
            src={enrollment.course.thumbnail_url}
            alt={enrollment.course.title}
            className="w-full h-full object-cover"
          />
          {enrollment.is_completed && (
            <div className="absolute inset-0 bg-green-600/20 flex items-center justify-center">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
          )}
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{enrollment.course?.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              by {enrollment.course?.instructor_name}
            </p>
          </div>
          {enrollment.is_completed && (
            <Badge className="bg-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Complete
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!enrollment.is_completed && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{enrollment.progress_percentage}%</span>
            </div>
            <Progress value={enrollment.progress_percentage} />
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
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

        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={() => navigate(`/courses/${enrollment.course?.slug}/learn`)}
          >
            <Play className="w-4 h-4 mr-2" />
            {enrollment.progress_percentage === 0 ? 'Start' : 'Continue'}
          </Button>
          
          {enrollment.course && (
            <DownloadButton
              contentType="course"
              contentId={enrollment.course.id}
              contentTitle={enrollment.course.title}
              contentUrl={`/courses/${enrollment.course.slug}`}
              variant="outline"
              size="default"
            />
          )}
        </div>

        {enrollment.completed_at && (
          <p className="text-xs text-muted-foreground text-center">
            Completed {new Date(enrollment.completed_at).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading training academy...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold mb-2">Training Academy</h1>
        <p className="text-muted-foreground">
          Your survival and preparedness training courses
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold">{enrollments.length}</p>
            <p className="text-sm text-muted-foreground">Total Courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold">{inProgressCourses.length}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold">{Math.round(totalHoursLearned)}</p>
            <p className="text-sm text-muted-foreground">Hours Learned</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold">{completedCourses.length}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Courses Enrolled</h3>
            <p className="text-muted-foreground mb-6">
              Start your preparedness training by enrolling in a course
            </p>
            <Button onClick={() => navigate("/courses")}>
              Browse Training Courses
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="in-progress" className="space-y-6">
          <TabsList>
            <TabsTrigger value="in-progress">
              In Progress ({inProgressCourses.length})
            </TabsTrigger>
            <TabsTrigger value="not-started">
              Not Started ({notStartedCourses.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedCourses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="in-progress" className="space-y-6">
            {inProgressCourses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No courses in progress</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inProgressCourses.map(enrollment => (
                  <CourseCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="not-started" className="space-y-6">
            {notStartedCourses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No courses to start</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notStartedCourses.map(enrollment => (
                  <CourseCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {completedCourses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No completed courses yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCourses.map(enrollment => (
                  <CourseCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* CTA */}
      <Card className="mt-8 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="py-8 text-center">
          <Download className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="font-display text-2xl font-bold mb-2">Download for Offline Access</h3>
          <p className="text-muted-foreground mb-6">
            Save courses to your portal and access them without internet connection
          </p>
          <Button asChild variant="outline">
            <Link to="/dashboard/offline-content">
              Manage Offline Content
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
