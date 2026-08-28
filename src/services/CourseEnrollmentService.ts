import { supabase } from "@/integrations/supabase/client";
import type { CourseEnrollment } from "@/types/monetization";

export class CourseEnrollmentService {
  /**
   * Create a new course enrollment
   */
  static async createEnrollment(
    courseId: string,
    userId: string,
    paymentAmount: number,
    paymentCurrency: string,
    stripePaymentId?: string
  ): Promise<{ data: CourseEnrollment | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("course_enrollments")
        .insert([
          {
            course_id: courseId,
            user_id: userId,
            payment_status: "completed",
            payment_amount: paymentAmount,
            payment_currency: paymentCurrency,
            stripe_payment_id: stripePaymentId,
            progress_percentage: 0,
            completed_lessons: [],
            is_completed: false,
          },
        ])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get user's enrollment for a specific course
   */
  static async getEnrollment(
    courseId: string,
    userId: string
  ): Promise<{ data: CourseEnrollment | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("course_enrollments")
        .select("*")
        .eq("course_id", courseId)
        .eq("user_id", userId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get all enrollments for a user
   */
  static async getUserEnrollments(
    userId: string
  ): Promise<{ data: CourseEnrollment[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("course_enrollments")
        .select(`
          *,
          course:courses(*)
        `)
        .eq("user_id", userId)
        .order("enrolled_at", { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update enrollment progress
   */
  static async updateProgress(
    enrollmentId: string,
    completedLessons: string[],
    totalLessons: number
  ): Promise<{ data: any; error: any }> {
    try {
      const progressPercentage = Math.round((completedLessons.length / totalLessons) * 100);
      const isCompleted = progressPercentage === 100;

      const { data, error } = await supabase
        .from("course_enrollments")
        .update({
          completed_lessons: completedLessons,
          progress_percentage: progressPercentage,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq("id", enrollmentId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Mark a lesson as complete
   */
  static async completeLesson(
    enrollmentId: string,
    lessonId: string,
    totalLessons: number
  ): Promise<{ data: any; error: any }> {
    try {
      // Get current enrollment
      const { data: enrollment, error: fetchError } = await supabase
        .from("course_enrollments")
        .select("completed_lessons")
        .eq("id", enrollmentId)
        .single();

      if (fetchError) throw fetchError;

      const completedLessons = enrollment.completed_lessons || [];
      
      // Add lesson if not already completed
      if (!completedLessons.includes(lessonId)) {
        completedLessons.push(lessonId);
      }

      // Update progress
      return await this.updateProgress(enrollmentId, completedLessons, totalLessons);
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update last accessed lesson
   */
  static async updateLastAccessedLesson(
    enrollmentId: string,
    lessonId: string
  ): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase
        .from("course_enrollments")
        .update({ last_accessed_lesson_id: lessonId })
        .eq("id", enrollmentId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Issue certificate for completed course
   */
  static async issueCertificate(
    enrollmentId: string,
    certificateUrl: string
  ): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase
        .from("course_enrollments")
        .update({
          certificate_issued: true,
          certificate_url: certificateUrl,
        })
        .eq("id", enrollmentId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Process refund
   */
  static async processRefund(enrollmentId: string): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase
        .from("course_enrollments")
        .update({ payment_status: "refunded" })
        .eq("id", enrollmentId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get enrollment statistics for a course
   */
  static async getCourseStats(courseId: string): Promise<{
    totalEnrollments: number;
    completedEnrollments: number;
    averageProgress: number;
    revenue: number;
  }> {
    try {
      const { data: enrollments } = await supabase
        .from("course_enrollments")
        .select("*")
        .eq("course_id", courseId);

      if (!enrollments || enrollments.length === 0) {
        return {
          totalEnrollments: 0,
          completedEnrollments: 0,
          averageProgress: 0,
          revenue: 0,
        };
      }

      const totalEnrollments = enrollments.length;
      const completedEnrollments = enrollments.filter((e) => e.is_completed).length;
      const averageProgress =
        enrollments.reduce((sum, e) => sum + e.progress_percentage, 0) / totalEnrollments;
      const revenue = enrollments
        .filter((e) => e.payment_status === "completed")
        .reduce((sum, e) => sum + e.payment_amount, 0);

      return {
        totalEnrollments,
        completedEnrollments,
        averageProgress: Math.round(averageProgress),
        revenue,
      };
    } catch (error) {
      console.error("Error getting course stats:", error);
      return {
        totalEnrollments: 0,
        completedEnrollments: 0,
        averageProgress: 0,
        revenue: 0,
      };
    }
  }
}
