// ============================================================================
// MONETIZATION SYSTEM TYPES
// ============================================================================

// ============================================================================
// COURSES
// ============================================================================

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  instructor_name: string;
  instructor_bio?: string;
  instructor_image_url?: string;
  thumbnail_url?: string;
  preview_video_url?: string;
  
  // Pricing
  price: number;
  currency: string;
  is_free: boolean;
  
  // Details
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  duration_hours?: number;
  language: string;
  
  // Content
  what_you_learn: string[];
  requirements: string[];
  
  // Status
  is_published: boolean;
  is_featured: boolean;
  
  // Stats
  enrollment_count: number;
  rating: number;
  review_count: number;
  
  // Geographic
  country_codes?: string[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
  lessons?: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  description?: string;
  
  // Content
  content_type: 'video' | 'text' | 'quiz' | 'assignment' | 'download';
  video_url?: string;
  video_duration?: number;
  text_content?: string;
  downloadable_resources?: Array<{
    name: string;
    url: string;
    size?: string;
  }>;
  
  // Settings
  is_preview: boolean;
  order_index: number;
  is_published: boolean;
  
  created_at: string;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  user_id: string;
  
  // Payment
  payment_status: 'pending' | 'completed' | 'refunded';
  payment_amount: number;
  payment_currency: string;
  stripe_payment_id?: string;
  
  // Progress
  progress_percentage: number;
  completed_lessons: string[];
  last_accessed_lesson_id?: string;
  
  // Completion
  is_completed: boolean;
  completed_at?: string;
  certificate_issued: boolean;
  certificate_url?: string;
  
  // Timestamps
  enrolled_at: string;
  expires_at?: string;
}

export interface CourseReview {
  id: string;
  course_id: string;
  user_id: string;
  enrollment_id: string;
  rating: number;
  review_text?: string;
  is_published: boolean;
  created_at: string;
  user?: {
    email: string;
    full_name?: string;
  };
}

export interface CourseQuiz {
  id: string;
  lesson_id: string;
  course_id: string;
  title: string;
  description?: string;
  passing_score: number;
  questions: QuizQuestion[];
  created_at: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  enrollment_id: string;
  answers: Record<number, number>;
  score: number;
  passed: boolean;
  attempted_at: string;
}

// ============================================================================
// AFFILIATE
// ============================================================================

export interface AffiliateProduct {
  id: string;
  name: string;
  description?: string;
  category: string;
  image_url?: string;
  images?: string[];
  video_url?: string;

  // Affiliate
  affiliate_url: string;
  affiliate_network: string;
  commission_rate?: number;
  
  // Pricing
  price?: number;
  currency: string;
  
  // Status
  is_active: boolean;
  is_featured: boolean;
  
  // Geographic
  country_codes?: string[];
  
  // Stats
  click_count: number;
  conversion_count: number;
  revenue_generated: number;
  
  created_at: string;
  updated_at: string;
}

export interface AffiliateClick {
  id: string;
  product_id: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  country_code?: string;
  converted: boolean;
  conversion_amount?: number;
  converted_at?: string;
  clicked_at: string;
}

// ============================================================================
// ADVERTISING
// ============================================================================

export interface AdSpace {
  id: string;
  name: string;
  slug: string;
  location: string;
  dimensions?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface Sponsor {
  id: string;
  company_name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  website_url?: string;
  logo_url?: string;
  
  // Contract
  contract_start_date?: string;
  contract_end_date?: string;
  monthly_fee?: number;
  currency: string;
  
  is_active: boolean;
  target_countries?: string[];
  
  created_at: string;
  updated_at: string;
}

export interface Advertisement {
  id: string;
  sponsor_id: string;
  ad_space_id: string;
  
  // Content
  title?: string;
  image_url?: string;
  destination_url: string;
  html_content?: string;
  
  // Scheduling
  start_date: string;
  end_date: string;
  
  // Targeting
  target_countries?: string[];
  target_sections?: string[];
  
  priority: number;
  is_active: boolean;
  
  // Stats
  impression_count: number;
  click_count: number;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  sponsor?: Sponsor;
  ad_space?: AdSpace;
}

export interface SponsoredPost {
  id: string;
  post_id: string;
  sponsor_id: string;
  sponsorship_fee: number;
  currency: string;
  sponsor_label: string;
  sponsor_disclosure?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  sponsor?: Sponsor;
}

// ============================================================================
// REVENUE
// ============================================================================

export interface RevenueTransaction {
  id: string;
  transaction_type: 'course_sale' | 'subscription' | 'affiliate_commission' | 'sponsorship' | 'advertisement';
  
  // Related IDs
  course_id?: string;
  enrollment_id?: string;
  affiliate_product_id?: string;
  sponsor_id?: string;
  ad_id?: string;
  
  // Amount
  amount: number;
  currency: string;
  
  // Payment
  payment_method?: string;
  payment_reference?: string;
  
  status: 'pending' | 'completed' | 'refunded' | 'failed';
  country_code?: string;
  
  transaction_date: string;
  completed_at?: string;
}

// ============================================================================
// ADMIN FORMS
// ============================================================================

export interface CourseFormData {
  title: string;
  slug: string;
  description: string;
  short_description: string;
  instructor_name: string;
  instructor_bio?: string;
  instructor_image_url?: string;
  thumbnail_url?: string;
  preview_video_url?: string;
  price: number;
  currency: string;
  is_free: boolean;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  duration_hours?: number;
  language: string;
  what_you_learn: string[];
  requirements: string[];
  is_published: boolean;
  is_featured: boolean;
  country_codes?: string[];
}

export interface AffiliateProductFormData {
  name: string;
  description?: string;
  category: string;
  image_url?: string;
  images?: string[];
  video_url?: string;
  affiliate_url: string;
  affiliate_network: string;
  commission_rate?: number;
  price?: number;
  currency: string;
  is_active: boolean;
  is_featured: boolean;
  country_codes?: string[];
  // Emergency supplier fields
  is_emergency_supplier?: boolean;
  supplier_phone?: string;
  supplier_address?: string;
  supplier_city?: string;
  supplier_postcode?: string;
  supplier_opening_hours?: string;
  supplier_accepts_cash?: boolean;
  supplier_coordinates?: string;
}

export interface AdvertisementFormData {
  sponsor_id: string;
  ad_space_id: string;
  title?: string;
  image_url?: string;
  destination_url: string;
  html_content?: string;
  start_date: string;
  end_date: string;
  target_countries?: string[];
  target_sections?: string[];
  priority: number;
  is_active: boolean;
}
