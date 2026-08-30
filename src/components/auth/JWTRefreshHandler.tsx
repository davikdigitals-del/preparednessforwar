import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

/**
 * Component to handle automatic JWT token refresh and auto-logout on expiration
 * Should be placed at the app root level to work globally
 */
export function JWTRefreshHandler() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    let refreshInterval: NodeJS.Timeout;
    let expirationCheckInterval: NodeJS.Timeout;

    const handleTokenExpiration = async () => {
      console.log('🔒 JWT token expired - logging out user');

      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });

      // Wait a moment for the toast to show
      setTimeout(async () => {
        await logout();
      }, 1000);
    };

    const checkTokenExpiration = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          console.log('⚠️ No active session found');
          await handleTokenExpiration();
          return;
        }

        // Parse JWT to check expiration
        const tokenPayload = JSON.parse(atob(session.access_token.split('.')[1]));
        const expirationTime = tokenPayload.exp * 1000;
        const currentTime = Date.now();

        // If token is expired, logout immediately
        if (currentTime >= expirationTime) {
          console.log('⚠️ Token is expired');
          await handleTokenExpiration();
        }
      } catch (error) {
        console.error('❌ Error checking token expiration:', error);
      }
    };

    const refreshToken = async () => {
      try {
        console.log('🔄 Attempting to refresh JWT token...');

        const { data, error } = await supabase.auth.refreshSession();

        if (error) {
          console.error('❌ Token refresh failed:', error);
          // If refresh fails, token might be expired - check and logout if needed
          await checkTokenExpiration();
          return;
        }

        if (data.session) {
          console.log('✅ JWT token refreshed successfully');
        } else {
          // No session returned - token likely expired
          await handleTokenExpiration();
        }
      } catch (error) {
        console.error('❌ Token refresh exception:', error);
        await checkTokenExpiration();
      }
    };

    const setupTokenRefresh = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          await handleTokenExpiration();
          return;
        }

        // Parse JWT to get expiration time
        const tokenPayload = JSON.parse(atob(session.access_token.split('.')[1]));
        const expirationTime = tokenPayload.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiry = expirationTime - currentTime;

        // If token is already expired, logout immediately
        if (timeUntilExpiry <= 0) {
          await handleTokenExpiration();
          return;
        }

        // Refresh token 15 minutes before expiration (or halfway through if less than 30 minutes)
        const refreshTime = Math.max(
          300000, // Minimum 5 minutes
          Math.min(900000, timeUntilExpiry / 2) // 15 minutes or half the remaining time
        );

        console.log(`🔄 JWT refresh scheduled in ${Math.floor(refreshTime / 1000)} seconds`);
        console.log(`🔒 Token expires in ${Math.floor(timeUntilExpiry / 1000)} seconds`);

        // Clear any existing intervals
        if (refreshInterval) {
          clearInterval(refreshInterval);
        }
        if (expirationCheckInterval) {
          clearInterval(expirationCheckInterval);
        }

        // Set up refresh interval
        refreshInterval = setInterval(refreshToken, refreshTime);

        // Check for expiration every minute as a safety net
        expirationCheckInterval = setInterval(checkTokenExpiration, 60000);

      } catch (error) {
        console.warn('Could not setup token refresh:', error);
        await handleTokenExpiration();
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
        if (expirationCheckInterval) {
          clearInterval(expirationCheckInterval);
        }
      }
    });

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      if (expirationCheckInterval) {
        clearInterval(expirationCheckInterval);
      }
      authListener.subscription.unsubscribe();
    };
  }, [user, logout, toast]);

  // This component doesn't render anything
  return null;
}