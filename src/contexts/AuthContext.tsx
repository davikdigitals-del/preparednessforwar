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
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithDiscord: () => Promise<void>;
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
    const country = overrides?.country || supaUser.user_metadata?.country || "GB";
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

      // Admin status comes ONLY from the database — no localStorage fallback
      if (profile?.is_admin === true || profile?.role === "admin") {
        isAdmin = true;
      }
    } catch (err) {
      console.warn("Could not fetch profile:", err);
    }

    console.log(`User ${supaUser.email} - isAdmin: ${isAdmin}, profile.role: ${profile?.role}`);

    return {
      id: supaUser.id,
      email: supaUser.email || "",
      name: profile?.name || supaUser.email?.split("@")[0] || "",
      role: isAdmin ? "admin" : "member",
      country: profile?.country || "GB",
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
          return;
        }

        // When a user signs in via OAuth, cache their provider and ensure member role
        if (event === "SIGNED_IN" && session.user.email) {
          const identities: any[] = session.user.identities || [];
          if (identities.length > 0 && identities[0].provider !== "email") {
            const oauthProvider = identities[0].provider as "google" | "apple" | "discord";
            localStorage.setItem(providerKey(session.user.email), oauthProvider);
            localStorage.setItem("lastSignInMethod", oauthProvider);

            // For brand-new OAuth signups, ensure they are created as member (not admin)
            // Check if this is a new user (created_at within last 30 seconds)
            const createdAt = new Date(session.user.created_at).getTime();
            const isNewUser = Date.now() - createdAt < 30000;
            if (isNewUser) {
              await supabase.from("profiles").upsert(
                {
                  id: session.user.id,
                  email: session.user.email,
                  name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email.split("@")[0],
                  is_admin: false,
                  role: "member",
                  country: "GB",
                },
                { onConflict: "id" }
              );
              await supabase
                .from("user_roles")
                .upsert({ user_id: session.user.id, role: "member" } as any, { onConflict: "user_id,role" });
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
      console.log("Admin login attempt for:", email);

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error || !data.user) {
        console.error("Admin login failed:", error);
        return false;
      }

      console.log("Admin login - User authenticated:", data.user.id);

      const built = await buildUser(data.user);
      setUser(built);

      console.log("Admin login complete - Role:", built.role, "isAdmin:", built.role === "admin");
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

  const signInWithGoogle = async () => {
    localStorage.setItem("lastSignInMethod", "google");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  };

  const signInWithApple = async () => {
    localStorage.setItem("lastSignInMethod", "apple");
    await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

  const signInWithDiscord = async () => {
    localStorage.setItem("lastSignInMethod", "discord");
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
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
