import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, TrendingUp, Award, DollarSign, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CourseEnrollment, Course } from "@/types/monetization";

interface EnrollmentWithDetails extends CourseEnrollment {
  course?: Course;
  user?: {
    email: string;
    full_name?: string;
  };
}

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [enrollmentsResult, coursesResult] = await Promise.all([
        supabase
          .from("course_enrollments")
          .select(`
            *,
            course:courses(*)
          `)
          .order("enrolled_at", { ascending: false }),
        supabase.from("courses").select("*"),
      ]);

      if (enrollmentsResult.error) throw enrollmentsResult.error;
      if (coursesResult.error) throw coursesResult.error;

      setEnrollments(enrollmentsResult.data || []);
      setCourses(coursesResult.data || []);
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

  const handleIssueCertificate = async (enrollmentId: string) => {
    try {
      const certificateUrl = `https://certificates.preparednessforwar.com/${enrollmentId}`;
      
      const { error } = await supabase
        .from("course_enrollments")
        .update({
          certificate_issued: true,
          certificate_url: certificateUrl,
        })
        .eq("id", enrollmentId);

      if (error) throw error;
      
      toast({ title: "Success", description: "Certificate issued successfully" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRefund = async (enrollmentId: string) => {
    if (!confirm("Are you sure you want to refund this enrollment?")) return;

    try {
      const { error } = await supabase
        .from("course_enrollments")
        .update({
          payment_status: "refunded",
        })
        .eq("id", enrollmentId);

      if (error) throw error;
      
      toast({ title: "Success", description: "Enrollment refunded successfully" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch = 
      enrollment.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.course?.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = courseFilter === "all" || enrollment.course_id === courseFilter;
    const matchesStatus = statusFilter === "all" || enrollment.payment_status === statusFilter;
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const totalRevenue = enrollments
    .filter(e => e.payment_status === "completed")
    .reduce((sum, e) => sum + e.payment_amount, 0);

  const completionRate = enrollments.length > 0
    ? ((enrollments.filter(e => e.is_completed).length / enrollments.length) * 100).toFixed(1)
    : "0.0";

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Course Enrollments</h1>
          <p className="text-muted-foreground mt-1">Manage student enrollments and progress</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Enrollments</p>
              <p className="text-2xl font-bold">{enrollments.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{enrollments.filter(e => e.is_completed).length}</p>
            </div>
            <Award className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold">{completionRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by student or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Enrollments Table */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No enrollments found
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">{enrollment.user?.full_name || "Unknown"}</div>
                        <div className="text-sm text-gray-500">{enrollment.user?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{enrollment.course?.title}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${enrollment.progress_percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{enrollment.progress_percentage}%</span>
                      </div>
                      {enrollment.is_completed && (
                        <div className="text-xs text-green-600 mt-1">
                          Completed {new Date(enrollment.completed_at!).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-semibold">
                        ${enrollment.payment_amount.toFixed(2)}
                      </div>
                      <div className="text-gray-500">{enrollment.payment_currency}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {enrollment.payment_status === "completed" && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 block w-fit">
                            Paid
                          </span>
                        )}
                        {enrollment.payment_status === "pending" && (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 block w-fit">
                            Pending
                          </span>
                        )}
                        {enrollment.payment_status === "refunded" && (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 block w-fit">
                            Refunded
                          </span>
                        )}
                        {enrollment.certificate_issued && (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 block w-fit">
                            Certified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {enrollment.is_completed && !enrollment.certificate_issued && (
                          <Button
                            size="sm"
                            onClick={() => handleIssueCertificate(enrollment.id)}
                          >
                            <Award className="w-4 h-4 mr-1" />
                            Issue Certificate
                          </Button>
                        )}
                        {enrollment.certificate_issued && enrollment.certificate_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(enrollment.certificate_url, "_blank")}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Certificate
                          </Button>
                        )}
                        {enrollment.payment_status === "completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRefund(enrollment.id)}
                          >
                            Refund
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
