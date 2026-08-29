import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Component to handle automatic JWT token refresh
 * Should be placed at the app root level to work globally
 */
export function JWTRefreshHandler() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    let refreshInterval: NodeJS.Timeout;

    const refreshToken = async () => {
      try {
        console.log('🔄 Attempting to refresh JWT token...');

        const { data, error } = await supabase.auth.refreshSession();

        if (error) {
          console.error('❌ Token refresh failed:', error);
          return;
        }

        if (data.session) {
          console.log('✅ JWT token refreshed successfully');
        }
      } catch (error) {
        console.error('❌ Token refresh exception:', error);
      }
    };

    const setupTokenRefresh = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) return;

        // Parse JWT to get expiration time
        const tokenPayload = JSON.parse(atob(session.access_token.split('.')[1]));
        const expirationTime = tokenPayload.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiry = expirationTime - currentTime;

        // Refresh token 15 minutes before expiration (or halfway through if less than 30 minutes)
        const refreshTime = Math.max(
          300000, // Minimum 5 minutes
          Math.min(900000, timeUntilExpiry / 2) // 15 minutes or half the remaining time
        );

        console.log(`🔄 JWT refresh scheduled in ${Math.floor(refreshTime / 1000)} seconds`);

        // Clear any existing interval
        if (refreshInterval) {
          clearInterval(refreshInterval);
        }

        // Set up refresh interval
        refreshInterval = setInterval(refreshToken, refreshTime);

      } catch (error) {
        console.warn('Could not setup token refresh:', error);
      }
    };

    // Setup refresh on mount
    setupTokenRefresh();

    // Listen for auth state changes to reset refresh timing
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED' && session) {
        console.log('🔄 Token was refreshed, resetting refresh timer');
        setupTokenRefresh();
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        if (refreshInterval) {
          clearInterval(refreshInterval);
        }
      }
    });

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      authListener.subscription.unsubscribe();
    };
  }, [user]);

  // This component doesn't render anything
  return null;
}