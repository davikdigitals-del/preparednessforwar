// ============================================================================
// MEMBER PORTAL TYPES
// ============================================================================

// ============================================================================
// MEMBER REPORTS
// ============================================================================

export interface MemberReport {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  location?: string;
  images?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  rejection_reason?: string;
  admin_notes?: string;
  approved_by?: string;
  approved_at?: string;
  views_count: number;
  upvotes_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    full_name?: string;
  };
}

export interface ReportCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface ReportComment {
  id: string;
  report_id: string;
  user_id: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  user?: {
    email: string;
    full_name?: string;
  };
}

export interface ReportUpvote {
  id: string;
  report_id: string;
  user_id: string;
  created_at: string;
}

// ============================================================================
// OFFLINE CONTENT
// ============================================================================

export interface OfflineContent {
  id: string;
  user_id: string;
  content_type: 'course' | 'video' | 'podcast' | 'library' | 'article';
  content_id: string;
  content_title?: string;
  content_size?: number; // bytes
  downloaded_at: string;
  last_accessed_at: string;
}

export interface OfflineContentStats {
  totalItems: number;
  totalSize: number; // bytes
  byType: {
    course: number;
    video: number;
    podcast: number;
    library: number;
    article: number;
  };
}

// ============================================================================
// PERSONAL NOTES & BUNKER
// ============================================================================

export interface MemberNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface PreparednessChecklist {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  items: ChecklistItem[];
  category?: string;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  relationship?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// MEMBER ACTIVITY
// ============================================================================

export interface MemberActivity {
  id: string;
  user_id: string;
  activity_type: string;
  activity_data?: any;
  created_at: string;
}

export interface MemberAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_name: string;
  achievement_description?: string;
  earned_at: string;
}

// ============================================================================
// DASHBOARD STATS
// ============================================================================

export interface DashboardStats {
  coursesEnrolled: number;
  coursesCompleted: number;
  totalLearningHours: number;
  offlineContentCount: number;
  reportsSubmitted: number;
  reportsApproved: number;
  achievementsEarned: number;
  notesCount: number;
  checklistsCount: number;
  completionRate: number;
}

// ============================================================================
// FORM DATA
// ============================================================================

export interface ReportFormData {
  title: string;
  content: string;
  category: string;
  location?: string;
  images?: string[];
  status: 'draft' | 'pending';
}

export interface NoteFormData {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  is_pinned: boolean;
}

export interface ChecklistFormData {
  title: string;
  description?: string;
  category?: string;
  items: ChecklistItem[];
}

export interface EmergencyContactFormData {
  name: string;
  relationship?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  priority: number;
}
