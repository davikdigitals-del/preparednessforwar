import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * PUBLIC DATA CLIENT
 * 
 * This is a separate Supabase client ONLY for public data (posts, alerts, etc.)
 * It's completely isolated from authentication to prevent auth issues from
 * affecting public content visibility.
 * 
 * Use this client in DataContext for:
 * - Posts
 * - Alerts
 * - Media items
 * - Library items
 * - Encyclopaedia entries
 * - Banner settings
 * 
 * DO NOT use this for:
 * - User authentication
 * - Admin operations
 * - User profiles
 */
export const publicSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // No session persistence - pure data client
    autoRefreshToken: false, // No token refresh
    detectSessionInUrl: false, // Don't detect auth in URL
    storageKey: 'prw-public-data', // Different storage key from auth client
  },
  global: {
    headers: {
      'X-Client-Info': 'prw-public-data-client',
    },
  },
});
