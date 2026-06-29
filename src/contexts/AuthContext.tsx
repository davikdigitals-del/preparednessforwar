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

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
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
    // Simple read-only approach - just get data from database
    let profile: any = null;
    let isAdmin = false;

    try {
      // Single attempt to get profile
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", supaUser.id)
        .maybeSingle();
      
      profile = data;

      // Check admin status from profile
      if (profile?.is_admin === true || profile?.role === "admin") {
        isAdmin = true;
        console.log("✅ Admin status confirmed:", profile.is_admin, profile.role);
        
        // Cache admin status in localStorage to survive refresh issues
        localStorage.setItem(`admin_status_${supaUser.id}`, 'true');
      } else {
        // Check localStorage cache as fallback
        const cachedAdmin = localStorage.getItem(`admin_status_${supaUser.id}`);
        if (cachedAdmin === 'true') {
          console.log("⚠️ Using cached admin status (database read failed)");
          isAdmin = true;
        }
      }
    } catch (err) {
      console.warn("Could not fetch profile:", err);
      
      // Fallback to cached admin status
      const cachedAdmin = localStorage.getItem(`admin_status_${supaUser.id}`);
      if (cachedAdmin === 'true') {
        console.log("⚠️ Using cached admin status (exception occurred)");
        isAdmin = true;
      }
    }

    console.log(`User ${supaUser.email} - isAdmin: ${isAdmin}, profile.is_admin: ${profile?.is_admin}, profile.role: ${profile?.role}`);

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

      // Ignore all auth events on the reset-password page —
      // that page manages its own session temporarily and signs out immediately after.
      if (window.location.pathname.includes("/reset-password")) {
        return;
      }

      // Immediately clear user on sign out
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESH_FAILED' || event === 'USER_DELETED') {
        lastProcessedUserId = null;
        if (mounted) {
          setUser(null);
          setNotifications([]);
          setLoading(false);
        }
        return;
      }

      // Skip duplicate SIGNED_IN events for the same user
      if (event === 'SIGNED_IN' && session?.user?.id && session.user.id === lastProcessedUserId) {
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

        lastProcessedUserId = session.user.id;
        const built = await buildUser(session.user);
        if (mounted) {
          setUser(built);
          await fetchNotifications(session.user.id);
          setLoading(false);
        }
      }, 300); // increased debounce
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;

      console.log("Initial session check:", session?.user?.email);
      
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
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
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

  const login = async (email: string, password: string) => {
    try {
      // Save last sign-in method
      localStorage.setItem('lastSignInMethod', 'email');
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error || !data.user) {
        console.error("Login failed:", error);
        return false;
      }

      // Explicitly build user to ensure state is set before navigation
      const built = await buildUser(data.user);
      setUser(built);
      
      console.log("Member login successful:", built.email, "role:", built.role);
      return true;
    } catch (error) {
      console.error("Login exception:", error);
      return false;
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      console.log("Admin login attempt for:", email);
      
      // Simple login - no retries, no profile updates
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error || !data.user) {
        console.error("Admin login failed:", error);
        return false;
      }

      console.log("Admin login - User authenticated:", data.user.id);
      
      // Just build the user from database - don't try to update anything
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
    const { data: signupData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name, country: data.country },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) return false;

    if (signupData.user) {
      // Member signup — is_admin = false
      await ensureUserBootstrap(signupData.user, {
        name: data.name,
        country: data.country,
        isAdmin: false,
      }).catch(() => undefined);
    }

    return true;
  };

  const signInWithGoogle = async () => {
    // Save last sign-in method
    localStorage.setItem('lastSignInMethod', 'google');
    
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          // Auto-create account if doesn't exist
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  };

  const signInWithApple = async () => {
    // Save last sign-in method
    localStorage.setItem('lastSignInMethod', 'apple');
    
    await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

  const signInWithDiscord = async () => {
    // Save last sign-in method
    localStorage.setItem('lastSignInMethod', 'discord');
    
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

  const logout = async () => {
    try {
      // Clear admin status cache
      if (user?.id) {
        localStorage.removeItem(`admin_status_${user.id}`);
      }
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear local state immediately
      setUser(null);
      setNotifications([]);
      
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout error:", error);
      // Clear state anyway
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
