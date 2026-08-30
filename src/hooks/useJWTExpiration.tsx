import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface JWTExpirationInfo {
  timeUntilExpiry: number | null;
  isExpiringSoon: boolean;
  isExpired: boolean;
}

export function useJWTExpiration() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [jwtInfo, setJwtInfo] = useState<JWTExpirationInfo>({
    timeUntilExpiry: null,
    isExpiringSoon: false,
    isExpired: false,
  });

  useEffect(() => {
    if (!user) {
      setJwtInfo({
        timeUntilExpiry: null,
        isExpiringSoon: false,
        isExpired: false,
      });
      return;
    }

    let interval: NodeJS.Timeout;
    let warningShown = false;

    const checkJWTStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          setJwtInfo({
            timeUntilExpiry: null,
            isExpiringSoon: false,
            isExpired: true,
          });
          return;
        }

        // Parse JWT payload
        const tokenPayload = JSON.parse(atob(session.access_token.split('.')[1]));
        const expirationTime = tokenPayload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const timeUntilExpiry = expirationTime - currentTime;

        const isExpired = timeUntilExpiry <= 0;
        const isExpiringSoon = timeUntilExpiry > 0 && timeUntilExpiry <= 600000; // 10 minutes

        setJwtInfo({
          timeUntilExpiry,
          isExpiringSoon,
          isExpired,
        });

        // Show warning when session expires in 5 minutes (only once)
        if (!warningShown && timeUntilExpiry <= 300000 && timeUntilExpiry > 0) {
          warningShown = true;
          toast({
            title: "⏰ Session Expiring Soon",
            description: "Your session will expire in 5 minutes. Please save any work and refresh the page to extend your session.",
            variant: "default",
          });
        }

        // Auto-logout when expired
        if (isExpired) {
          console.log('🔒 JWT has expired - auto-logging out');

          toast({
            title: "🔒 Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          });

          // Wait a moment for toast to show, then logout
          setTimeout(() => {
            logout();

            // Redirect appropriately
            const isAdminPath = window.location.pathname.startsWith('/admin');
            if (isAdminPath) {
              window.location.href = '/admin/login';
            } else {
              window.location.href = '/login';
            }
          }, 2000);
        }

      } catch (error) {
        console.warn('JWT status check failed:', error);
        setJwtInfo({
          timeUntilExpiry: null,
          isExpiringSoon: false,
          isExpired: false,
        });
      }
    };

    // Check immediately
    checkJWTStatus();

    // Then check every 30 seconds
    interval = setInterval(checkJWTStatus, 30000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [user, logout, toast]);

  return jwtInfo;
}

// Helper function to get time remaining in a human-readable format
export function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) return 'Expired';

  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

// Component to display session status (useful for admin dashboard)
export function SessionStatus() {
  const { timeUntilExpiry, isExpiringSoon, isExpired } = useJWTExpiration();
  const { user } = useAuth();

  if (!user || timeUntilExpiry === null) return null;

  return (
    <div className={`text-xs px-2 py-1 rounded ${isExpired ? 'bg-red-100 text-red-800' :
      isExpiringSoon ? 'bg-amber-100 text-amber-800' :
        'bg-gray-100 text-gray-600'
      }`}>
      {isExpired ? '🔒 Expired' :
        isExpiringSoon ? `⏰ ${formatTimeRemaining(timeUntilExpiry)}` :
          '⚪ Active'}
    </div>
  );
}