import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "member";
  country: string;
  avatar?: string;
  joinedAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "post" | "alert" | "system";
}

// Structured result from login() so callers can show specific error messages
export interface LoginResult {
  success: boolean;
  // "wrong_provider" = account exists but was created with a different sign-in method
  // "no_account"     = no account found with this email at all
  // any other string = a human-readable error message
  error?: "wrong_provider" | "no_account" | string;
  // Which OAuth provider they signed up with (only set when error === "wrong_provider")
  provider?: "google" | "apple" | "discord" | "unknown";
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  signup: (data: { email: string; password: string; name: string; country: string }) => Promise<boolean>;
  signInWithGoogle: (isSignup?: boolean) => Promise<void>;
  signInWithApple: (isSignup?: boolean) => Promise<void>;
  signInWithDiscord: (isSignup?: boolean) => Promise<void>;
  logout: () => void;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  unreadCount: number;
}

const AuthContext = createContext<AuthContextType | null>(null);

// localStorage key for caching which provider an email signed up with
const providerKey = (email: string) => `signup_provider_${email.toLowerCase()}`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const ensureUserBootstrap = async (
    supaUser: SupabaseUser,
    overrides?: { name?: string; country?: string; isAdmin?: boolean }
  ) => {
    const displayName = overrides?.name || supaUser.user_metadata?.name || supaUser.email?.split("@")[0] || "Member";
    const country = overrides?.country || supaUser.user_metadata?.country || null;
    const isAdmin = overrides?.isAdmin ?? false;

    await supabase.from("profiles").upsert(
      {
        id: supaUser.id,
        email: supaUser.email || "",
        name: displayName,
        country,
        is_admin: isAdmin,
        role: isAdmin ? "admin" : "member",
      },
      { onConflict: "id" }
    );

    await supabase.from("user_roles").upsert(
      { user_id: supaUser.id, role: isAdmin ? "admin" : "member" } as any,
      { onConflict: "user_id,role" }
    );
  };

  const buildUser = async (supaUser: SupabaseUser): Promise<User> => {
    let profile: any = null;
    let isAdmin = false;

    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", supaUser.id)
        .maybeSingle();

      profile = data;

      // Admin status from DB profile
      if (profile?.is_admin === true || profile?.role === "admin") {
        isAdmin = true;
      }
    } catch (err) {
      console.warn("Could not fetch profile:", err);
    }

    // Fallback: check user metadata if profile read failed or returned no admin
    if (!isAdmin) {
      const metaIsAdmin = supaUser.user_metadata?.is_admin === true ||
        (supaUser as any).raw_user_meta_data?.is_admin === true;
      if (metaIsAdmin) isAdmin = true;
    }

    console.log(`User ${supaUser.email} - isAdmin: ${isAdmin}, profile.role: ${profile?.role}`);

    return {
      id: supaUser.id,
      email: supaUser.email || "",
      name: profile?.name || supaUser.user_metadata?.name || supaUser.email?.split("@")[0] || "",
      role: isAdmin ? "admin" : "member",
      country: profile?.country || null,
      avatar: profile?.avatar_url || undefined,
      joinedAt: profile?.created_at || supaUser.created_at,
    };
  };

  const fetchNotifications = async (userId: string) => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order("timestamp", { ascending: false })
      .limit(100);

    if (!data) {
      setNotifications([]);
      return;
    }

    setNotifications(
      data.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        timestamp: n.timestamp,
        read: n.read || false,
        type: (n.type as "post" | "alert" | "system") || "system",
      }))
    );
  };

  useEffect(() => {
    let mounted = true;
    let debounceTimer: NodeJS.Timeout | null = null;
    let lastProcessedUserId: string | null = null;
    // Temporarily disable JWT checking to fix course table issue
    // let jwtCheckInterval: NodeJS.Timeout | null = null;
    let jwtCheckInterval: NodeJS.Timeout | null = null; // FIX: Declare it even if not used

    // Function to check JWT expiration and handle automatic logout
    const checkJWTExpiration = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          return; // No session, nothing to check
        }

        // Parse JWT payload to check expiration
        try {
          const tokenPayload = JSON.parse(atob(session.access_token.split('.')[1]));
          const expirationTime = tokenPayload.exp * 1000; // Convert to milliseconds
          const currentTime = Date.now();
          const timeUntilExpiry = expirationTime - currentTime;

          console.log(`JWT expires in ${Math.floor(timeUntilExpiry / 1000)} seconds`);

          // If JWT expires in the next 5 minutes or has already expired
          if (timeUntilExpiry <= 300000) { // 5 minutes = 300000ms
            console.log('🔒 JWT expired or expiring soon - logging out gracefully');

            // Clear user state first
            if (mounted) {
              setUser(null);
              setNotifications([]);
              setLoading(false);
            }

            // Clear localStorage
            Object.keys(localStorage)
              .filter(k => k.startsWith("admin_status_") || k.startsWith("signup_provider_") || k.includes("oauth_intent"))
              .forEach(k => localStorage.removeItem(k));

            // Sign out from Supabase
            await supabase.auth.signOut();

            // Show friendly message and redirect
            const currentPath = window.location.pathname;
            const isAdminPath = currentPath.startsWith('/admin');

            // Only show alert if we're not already on login/signup pages
            if (!currentPath.includes('/login') && !currentPath.includes('/register') && !currentPath.includes('/auth')) {
              alert(`Your session has expired. Please ${isAdminPath ? 'sign in again as an administrator' : 'log in again'}.`);

              // Redirect appropriately
              if (isAdminPath) {
                window.location.href = '/admin-login';
              } else {
                window.location.href = '/login';
              }
            }
          }
        } catch (parseError) {
          console.warn('Could not parse JWT token:', parseError);
        }
      } catch (error) {
        console.warn('JWT expiration check failed:', error);
      }
    };

    const handleAuthChange = async (event: string, session: any) => {
      if (debounceTimer) clearTimeout(debounceTimer);

      if (window.location.pathname.includes("/reset-password")) {
        return;
      }

      if (event === "SIGNED_OUT" || event === "TOKEN_REFRESH_FAILED" || event === "USER_DELETED") {
        lastProcessedUserId = null;
        if (mounted) {
          setUser(null);
          setNotifications([]);
          setLoading(false);
        }

        // Clear JWT check interval when signed out
        if (jwtCheckInterval) {
          clearInterval(jwtCheckInterval);
          jwtCheckInterval = null;
        }
        return;
      }

      if (event === "SIGNED_IN" && session?.user?.id && session.user.id === lastProcessedUserId) {
        return;
      }

      debounceTimer = setTimeout(async () => {
        if (!mounted) return;
        console.log("Auth state changed:", event, session?.user?.email);

        if (!session?.user) {
          setUser(null);
          setNotifications([]);
          setLoading(false);

          // Clear JWT check interval when no user
          if (jwtCheckInterval) {
            clearInterval(jwtCheckInterval);
            jwtCheckInterval = null;
          }
          return;
        }

        // Temporarily disable JWT checking - it may be causing course table errors
        /*
        // Start JWT expiration checking when user is signed in
        if (!jwtCheckInterval) {
          // Check JWT expiration every 30 seconds
          jwtCheckInterval = setInterval(checkJWTExpiration, 30000);
          // Also check immediately
          checkJWTExpiration();
        }
        */

        // When a user signs in via OAuth, cache their provider and ensure member role
        if (event === "SIGNED_IN" && session.user.email) {
          const identities: any[] = session.user.identities || [];
          if (identities.length > 0 && identities[0].provider !== "email") {
            const oauthProvider = identities[0].provider as "google" | "apple" | "discord";
            localStorage.setItem(providerKey(session.user.email), oauthProvider);
            localStorage.setItem("lastSignInMethod", oauthProvider);

            // Check if this is a brand-new user (created within last 30 seconds)
            const createdAt = new Date(session.user.created_at).getTime();
            const isNewUser = Date.now() - createdAt < 30000;

            // Check if they came from sign-in page (not sign-up)
            // Check both localStorage (set before redirect) and URL param (more reliable)
            const urlParams = new URLSearchParams(window.location.search);
            const urlIntent = urlParams.get("oauth_intent");
            const localIntent = localStorage.getItem("oauth_intent") || "signin";
            const oauthIntent = urlIntent || localIntent;
            localStorage.removeItem("oauth_intent");

            if (isNewUser && oauthIntent === "signin") {
              try {
                // Call edge function to delete the auth account using userId
                await fetch(
                  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-unsubscribed-user`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                    },
                    body: JSON.stringify({ userId: session.user.id }),
                  }
                );
              } catch (e) {
                console.warn('Could not delete unsubscribed user:', e);
              }

              await supabase.auth.signOut();
              if (mounted) {
                setUser(null);
                setNotifications([]);
                setLoading(false);
                window.location.href = `${window.location.origin}/subscribe?from=signup`;
              }
              return;
            }
          }
        }

        lastProcessedUserId = session.user.id;
        const built = await buildUser(session.user);
        if (mounted) {
          setUser(built);
          await fetchNotifications(session.user.id);
          setLoading(false);
        }
      }, 300);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthChange);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;

      console.log("Initial session check:", session?.user?.email);

      // Skip on reset-password — let ResetPasswordPage extract tokens from the URL hash itself
      if (window.location.pathname.includes("/reset-password")) {
        setLoading(false);
        return;
      }

      if (!session?.user) {
        setLoading(false);
        return;
      }

      // Temporarily disable JWT checking in initial session 
      /*
      // Start JWT checking for initial session
      if (!jwtCheckInterval) {
        jwtCheckInterval = setInterval(checkJWTExpiration, 30000);
        checkJWTExpiration();
      }
      */

      const built = await buildUser(session.user);
      if (mounted) {
        setUser(built);
        await fetchNotifications(session.user.id);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      if (debounceTimer) clearTimeout(debounceTimer);
      if (jwtCheckInterval) clearInterval(jwtCheckInterval);
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("notifications-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, (payload) => {
        const event = payload.eventType;
        const row = (event === "DELETE" ? payload.old : payload.new) as any;
        if (!row) return;

        const isRelevant = row.user_id === null || row.user_id === user.id;
        if (!isRelevant) return;

        if (event === "DELETE") {
          setNotifications((prev) => prev.filter((n) => n.id !== row.id));
          return;
        }

        const normalized: AppNotification = {
          id: row.id,
          title: row.title,
          message: row.message,
          timestamp: row.timestamp,
          read: row.read || false,
          type: (row.type as "post" | "alert" | "system") || "system",
        };

        setNotifications((prev) => {
          const existingIndex = prev.findIndex((n) => n.id === normalized.id);
          if (existingIndex === -1) return [normalized, ...prev];
          const next = [...prev];
          next[existingIndex] = normalized;
          return next;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // ── Auth methods ──────────────────────────────────────────────────────────

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error("Login failed:", error);

        // "Invalid login credentials" fires both for wrong password AND for accounts
        // that were created via OAuth (they have no password set).
        if (error.message.includes("Invalid login credentials")) {
          // Check if an account with this email exists in profiles
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", email.toLowerCase())
            .maybeSingle();

          if (!profile) {
            // No account at all — tell them to sign up
            return { success: false, error: "no_account" };
          }

          // Account exists — check if we know which OAuth provider they used
          const cachedProvider = localStorage.getItem(providerKey(email)) as
            | "google"
            | "apple"
            | "discord"
            | null;

          return {
            success: false,
            error: "wrong_provider",
            provider: cachedProvider ?? "unknown",
          };
        }

        if (error.message.includes("Email not confirmed")) {
          return {
            success: false,
            error: "Please confirm your email before signing in. Check your inbox.",
          };
        }

        return { success: false, error: error.message || "Invalid credentials. Please try again." };
      }

      if (!data.user) {
        return { success: false, error: "Invalid credentials. Please try again." };
      }

      // Login succeeded — cache the email provider as "email" for future mismatch checks
      localStorage.setItem("lastSignInMethod", "email");
      if (data.user.email) {
        localStorage.setItem(providerKey(data.user.email), "email");
      }

      const built = await buildUser(data.user);
      setUser(built);

      console.log("Member login successful:", built.email, "role:", built.role);
      return { success: true };
    } catch (err) {
      console.error("Login exception:", err);
      return { success: false, error: "An error occurred. Please try again." };
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      // Get the current session — don't sign in again if already authenticated
      const { data: { session } } = await supabase.auth.getSession();

      const supaUser = session?.user;
      if (!supaUser) {
        // No existing session — sign in
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) return false;
        const built = await buildUser(data.user);
        setUser(built);
        return true;
      }

      // Already signed in — just build the user
      const built = await buildUser(supaUser);
      setUser(built);
      return true;
    } catch (error) {
      console.error("Admin login exception:", error);
      return false;
    }
  };

  const signup = async (data: { email: string; password: string; name: string; country: string }) => {
    try {
      const { data: signupData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { name: data.name, country: data.country, is_admin: false },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        console.error("Signup error:", error.message);
        return false;
      }

      // Supabase returns a fake user with no identities when email is already registered
      // This prevents email enumeration but we can detect it this way
      if (signupData.user && signupData.user.identities?.length === 0) {
        console.warn("Email already registered");
        return false;
      }

      if (signupData.user) {
        localStorage.setItem(providerKey(data.email), "email");
        localStorage.setItem("lastSignInMethod", "email");

        // Profile is created by the DB trigger (handle_new_user)
        // which runs server-side and bypasses RLS — no client upsert needed
      }

      return true;
    } catch (err) {
      console.error("Signup exception:", err);
      return false;
    }
  };

  const signInWithGoogle = async (isSignup = false) => {
    localStorage.setItem("lastSignInMethod", "google");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?intent=${isSignup ? 'signup' : 'signin'}`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
  };

  const signInWithApple = async (isSignup = false) => {
    localStorage.setItem("lastSignInMethod", "apple");
    await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?intent=${isSignup ? 'signup' : 'signin'}`,
      },
    });
  };

  const signInWithDiscord = async (isSignup = false) => {
    localStorage.setItem("lastSignInMethod", "discord");
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?intent=${isSignup ? 'signup' : 'signin'}`,
      },
    });
  };

  const logout = async () => {
    try {
      // Clear any stale admin cache keys
      Object.keys(localStorage)
        .filter(k => k.startsWith("admin_status_"))
        .forEach(k => localStorage.removeItem(k));
      await supabase.auth.signOut();
      setUser(null);
      setNotifications([]);
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
      setNotifications([]);
    }
  };

  const markNotificationRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  };

  const markAllNotificationsRead = async () => {
    if (!user) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await supabase
      .from("notifications")
      .update({ read: true })
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .eq("read", false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        login,
        adminLogin,
        signup,
        signInWithGoogle,
        signInWithApple,
        signInWithDiscord,
        logout,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        unreadCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
