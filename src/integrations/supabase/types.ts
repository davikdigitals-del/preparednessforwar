export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          created_at: string
          title: string
          slug: string
          excerpt: string | null
          content: string
          featured_image: string | null
          category_id: string | null
          author_id: string | null
          published: boolean
          published_at: string | null
          views: number
          is_premium: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          slug: string
          excerpt?: string | null
          content: string
          featured_image?: string | null
          category_id?: string | null
          author_id?: string | null
          published?: boolean
          published_at?: string | null
          views?: number
          is_premium?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          featured_image?: string | null
          category_id?: string | null
          author_id?: string | null
          published?: boolean
          published_at?: string | null
          views?: number
          is_premium?: boolean
        }
      }
      categories: {
        Row: {
          id: string
          created_at: string
          name: string
          slug: string
          description: string | null
          color: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          slug: string
          description?: string | null
          color?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          slug?: string
          description?: string | null
          color?: string | null
        }
      }
      alerts: {
        Row: {
          id: string
          created_at: string
          title: string
          message: string
          severity: string
          active: boolean
          expires_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          message: string
          severity?: string
          active?: boolean
          expires_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          message?: string
          severity?: string
          active?: boolean
          expires_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
          is_premium: boolean
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          is_premium?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          is_premium?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
