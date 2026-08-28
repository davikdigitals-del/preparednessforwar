/**
 * Admin service for operations that require elevated permissions
 * Uses service role key to bypass RLS when needed
 */

import { createClient } from '@supabase/supabase-js';

// This would use a service role key with full permissions
// For now, we'll use the regular client but this shows the pattern
const adminClient = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY! // In production, use VITE_SUPABASE_SERVICE_ROLE_KEY
);

export class AdminService {
  /**
   * Delete a member report with full admin permissions
   * This bypasses RLS policies that might block admin operations
   */
  static async deleteMemberReport(reportId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First, delete related records to avoid foreign key constraints
      
      // Delete report comments
      const { error: commentsError } = await adminClient
        .from('report_comments')
        .delete()
        .eq('report_id', reportId);
      
      if (commentsError) {
        console.warn('Warning deleting comments:', commentsError);
      }
      
      // Delete report upvotes  
      const { error: upvotesError } = await adminClient
        .from('report_upvotes')
        .delete()
        .eq('report_id', reportId);
      
      if (upvotesError) {
        console.warn('Warning deleting upvotes:', upvotesError);
      }
      
      // Delete the main report
      const { error: reportError } = await adminClient
        .from('member_reports')
        .delete()
        .eq('id', reportId);
      
      if (reportError) {
        console.error('Error deleting report:', reportError);
        return { success: false, error: reportError.message };
      }
      
      return { success: true };
      
    } catch (error: any) {
      console.error('Admin delete service error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Force delete using raw SQL (last resort)
   * Only use if RLS policies are completely blocking deletion
   */
  static async forceDeleteMemberReport(reportId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Use RPC call to bypass RLS with a custom database function
      const { error } = await adminClient.rpc('admin_delete_member_report', { 
        report_id: reportId 
      });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
      
    } catch (error: any) {
      console.error('Force delete error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if current user has admin permissions
   */
  static async checkAdminPermissions(): Promise<boolean> {
    try {
      const { data: { user } } = await adminClient.auth.getUser();
      if (!user) return false;
      
      const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      return profile?.role === 'admin';
    } catch (error) {
      console.error('Error checking admin permissions:', error);
      return false;
    }
  }
}