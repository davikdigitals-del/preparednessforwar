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
    await ensureUserBootstrap(supaUser).catch(() => undefined);

    let profile: any = null;
    let isAdmin = false;

    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", supaUser.id)
        .maybeSingle();
      profile = data;
    } catch { /* ignore */ }

    // Check is_admin flag first (most reliable)
    if (profile?.is_admin === true) {
      isAdmin = true;
    } else {
      try {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", supaUser.id);
        isAdmin = roles?.some((r: any) => r.role === "admin") ?? false;
      } catch { /* ignore */ }
    }

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
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setUser(null);
        setNotifications([]);
        setLoading(false);
        return;
      }

      const built = await buildUser(session.user);
      setUser(built);
      await fetchNotifications(session.user.id);
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const built = await buildUser(session.user);
      setUser(built);
      await fetchNotifications(session.user.id);
      setLoading(false);
    });

    return () => authListener.subscription.unsubscribe();
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return !error;
  };

  const adminLogin = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return false;

    const uid = data.user.id;

    // Mark this user as admin
    try {
      await ensureUserBootstrap(data.user, { isAdmin: true });
    } catch { /* ignore */ }

    // Ensure admin role in user_roles
    try {
      await supabase.from("user_roles").upsert(
        { user_id: uid, role: "admin" },
        { onConflict: "user_id,role" }
      );
    } catch { /* ignore */ }

    return true;
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

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setNotifications([]);
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
