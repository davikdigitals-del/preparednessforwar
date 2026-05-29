import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { publicSupabase as supabase } from "@/integrations/supabase/publicClient";
import type { Tables } from "@/integrations/supabase/types";

/**
 * DATA CONTEXT
 * 
 * This context manages ALL public data (posts, alerts, media, library, etc.)
 * 
 * IMPORTANT: Uses publicSupabase client which is completely isolated from
 * authentication. This ensures posts and other public content are NEVER
 * affected by admin login issues or auth state changes.
 * 
 * Posts will always be visible even if:
 * - Admin can't login
 * - Auth session breaks
 * - Lock conflicts occur
 * - User is not authenticated
 */

/* ── Types matching DB rows ────────────────── */
export type DbPost = Tables<"posts">;
export type DbAlert = Tables<"alerts">;
export type DbMediaItem = Tables<"media_items">;
export type DbLibraryItem = Tables<"library_items">;
export type DbEncEntry = Tables<"encyclopaedia_entries">;
export type DbBanner = Tables<"banner_settings">;

export type PostStatus = "published" | "draft" | "archived";

export interface AdminPost {
  id: string;
  title: string;
  standfirst: string;
  section: string;
  category: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  image: string;
  tags: string[];
  viewCount: number;
  readTime: string;
  isPinned?: boolean;
  isPremium?: boolean;
  status: PostStatus;
  body: string;
  countryCodes: string[];
  videoUrl?: string;
}

export interface MediaItem {
  id: string;
  title: string;
  description: string;
  type: "podcast" | "video";
  duration: string;
  views: number;
  publishedAt: string;
  thumbnail?: string;
  url?: string;
  author: string;
  tags: string[];
  countryCodes: string[];
  isPremium?: boolean;
}

export interface LibraryItem {
  id: string;
  title: string;
  author: string;
  category: string;
  pages: number;
  format: string;
  description: string;
  fileUrl: string;
  coverColor: string;
  coverImageUrl: string;
  countryCodes: string[];
}

export interface EncEntry {
  id: string;
  title: string;
  letter: string;
  content: string;
}

export interface BannerSettings {
  id?: string;
  enabled: boolean;
  text: string;
  priority: "high" | "medium" | "low";
}

const mapPost = (p: DbPost & { country_codes?: string[] }): AdminPost => ({
  id: p.id,
  title: p.title,
  standfirst: p.standfirst || p.body?.substring(0, 200) || "",
  section: p.section,
  category: p.category,
  author: p.author,
  publishedAt: p.published_at || p.created_at,
  updatedAt: p.updated_at || p.created_at,
  image: p.image_url || p.image || "",
  tags: p.tags || [],
  viewCount: p.view_count || 0,
  readTime: p.read_time || "5 min",
  isPinned: p.is_pinned || false,
  isPremium: p.is_premium || false,
  status: (p.is_published ? "published" : p.status || "draft") as PostStatus,
  body: p.content || p.body || "",
  countryCodes: p.country_codes || [],
  videoUrl: p.video_url || undefined,
});

const mapMedia = (m: DbMediaItem & { country_codes?: string[] }): MediaItem => ({
  id: m.id,
  title: m.title,
  description: m.description || "",
  type: m.type as "podcast" | "video",
  duration: m.duration || "",
  views: m.views || 0,
  publishedAt: m.published_at,
  thumbnail: m.thumbnail || "",
  url: m.url || "",
  author: m.author || "",
  tags: m.tags || [],
  countryCodes: m.country_codes || [],
  isPremium: (m as any).is_premium || false,
});

const mapLibrary = (l: DbLibraryItem & { country_codes?: string[]; cover_image_url?: string }): LibraryItem => ({
  id: l.id,
  title: l.title,
  author: l.author || "",
  category: l.category || "",
  pages: l.pages || 0,
  format: l.format || "PDF",
  description: l.description || "",
  fileUrl: l.file_url || "",
  coverColor: l.cover_color || "bg-primary",
  coverImageUrl: l.cover_image_url || "",
  countryCodes: l.country_codes || [],
});

const mapEnc = (e: DbEncEntry): EncEntry => ({
  id: e.id,
  title: e.title,
  letter: e.letter,
  content: e.content || "",
});

const mapBanner = (b: DbBanner): BannerSettings => ({
  id: b.id,
  enabled: b.enabled ?? true,
  text: b.text,
  priority: b.priority as "high" | "medium" | "low",
});

interface DataContextType {
  posts: AdminPost[];
  alerts: { id: string; text: string; priority: "high" | "medium" | "low"; timestamp: string }[];
  mediaItems: MediaItem[];
  libraryItems: LibraryItem[];
  encEntries: EncEntry[];
  banner: BannerSettings;
  publishedPosts: AdminPost[];
  loading: boolean;
  createPost: (post: Omit<AdminPost, "id">) => Promise<void>;
  updatePost: (id: string, post: Partial<AdminPost>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  incrementView: (postId: string) => Promise<void>;
  createAlert: (alert: { text: string; priority: string }) => Promise<void>;
  updateAlert: (id: string, alert: { text?: string; priority?: string }) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  createMediaItem: (item: Omit<MediaItem, "id">) => Promise<void>;
  updateMediaItem: (id: string, item: Partial<MediaItem>) => Promise<void>;
  deleteMediaItem: (id: string) => Promise<void>;
  createLibraryItem: (item: Omit<LibraryItem, "id">) => Promise<void>;
  updateLibraryItem: (id: string, item: Partial<LibraryItem>) => Promise<void>;
  deleteLibraryItem: (id: string) => Promise<void>;
  createEncEntry: (entry: Omit<EncEntry, "id">) => Promise<void>;
  updateEncEntry: (id: string, entry: Partial<EncEntry>) => Promise<void>;
  deleteEncEntry: (id: string) => Promise<void>;
  updateBanner: (banner: Partial<BannerSettings>) => Promise<void>;
  setPosts: React.Dispatch<React.SetStateAction<AdminPost[]>>;
  setAlerts: React.Dispatch<React.SetStateAction<any[]>>;
  setMediaItems: React.Dispatch<React.SetStateAction<MediaItem[]>>;
  setLibraryItems: React.Dispatch<React.SetStateAction<LibraryItem[]>>;
  setEncEntries: React.Dispatch<React.SetStateAction<EncEntry[]>>;
  setBanner: React.Dispatch<React.SetStateAction<BannerSettings>>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [alerts, setAlerts] = useState<{ id: string; text: string; priority: "high" | "medium" | "low"; timestamp: string }[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [encEntries, setEncEntries] = useState<EncEntry[]>([]);
  const [banner, setBanner] = useState<BannerSettings>({ enabled: true, text: "", priority: "high" });
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const refreshPosts = useCallback(async () => {
    try {
      // Load posts from database with error handling
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      
      if (error) {
        console.error("Error loading posts:", error);
        // Don't clear existing posts on error - keep showing what we have
        return;
      }
      
      if (data) {
        setPosts(data.map((row) => mapPost(row as DbPost & { country_codes?: string[] })));
      }
    } catch (err) {
      console.error("Exception loading posts:", err);
      // Don't clear posts on exception
    }
  }, []);

  const refreshAlerts = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("alerts").select("*").eq("is_active", true).order("timestamp", { ascending: false });
      if (error) {
        console.error("Error loading alerts:", error);
        return;
      }
      if (data) setAlerts(data.map((a) => ({ id: a.id, text: a.text, priority: a.priority as "high" | "medium" | "low", timestamp: a.timestamp })));
    } catch (err) {
      console.error("Exception loading alerts:", err);
    }
  }, []);

  const refreshMedia = useCallback(async () => {
    const { data } = await supabase.from("media_items").select("*").order("published_at", { ascending: false });
    if (data) setMediaItems(data.map((row) => mapMedia(row as DbMediaItem & { country_codes?: string[] })));
  }, []);

  const refreshLibrary = useCallback(async () => {
    const { data } = await supabase.from("library_items").select("*");
    if (data) {
      setLibraryItems(data.map((row) => mapLibrary(row as DbLibraryItem & { country_codes?: string[]; cover_image_url?: string })));
    }
  }, []);

  const refreshEncyclopaedia = useCallback(async () => {
    const { data } = await supabase.from("encyclopaedia_entries").select("*").order("title");
    if (data) setEncEntries(data.map(mapEnc));
  }, []);

  const refreshBanner = useCallback(async () => {
    const { data } = await supabase.from("banner_settings").select("*").limit(1).maybeSingle();
    if (data) setBanner(mapBanner(data));
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      
      // Load only critical data first (posts and alerts for homepage)
      await Promise.all([
        refreshPosts(),
        refreshAlerts(),
        refreshBanner(),
      ]);
      
      setLoading(false);
      setInitialLoadComplete(true);
      
      // Load remaining data in background
      Promise.all([
        refreshMedia(),
        refreshLibrary(),
        refreshEncyclopaedia(),
      ]).catch(console.error);
    };
    fetchAll();
  }, [refreshAlerts, refreshBanner, refreshEncyclopaedia, refreshLibrary, refreshMedia, refreshPosts]);

  useEffect(() => {
    const channel = supabase
      .channel("data-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, refreshPosts)
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, refreshAlerts)
      .on("postgres_changes", { event: "*", schema: "public", table: "media_items" }, refreshMedia)
      .on("postgres_changes", { event: "*", schema: "public", table: "library_items" }, refreshLibrary)
      .on("postgres_changes", { event: "*", schema: "public", table: "encyclopaedia_entries" }, refreshEncyclopaedia)
      .on("postgres_changes", { event: "*", schema: "public", table: "banner_settings" }, refreshBanner)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshAlerts, refreshBanner, refreshEncyclopaedia, refreshLibrary, refreshMedia, refreshPosts]);

  const publishedPosts = posts.filter((p) => p.status === "published");

  const createPost = async (post: Omit<AdminPost, "id">) => {
    await (supabase.from("posts") as any).insert({
      title: post.title,
      standfirst: post.standfirst,
      section: post.section,
      category: post.category,
      author: post.author,
      image: post.image,
      tags: post.tags,
      read_time: post.readTime,
      is_pinned: post.isPinned,
      is_premium: post.isPremium || false,
      status: post.status,
      body: post.body,
      published_at: post.publishedAt,
      country_codes: post.countryCodes,
    });
    await refreshPosts();
  };

  const updatePost = async (id: string, post: Partial<AdminPost>) => {
    const update: Record<string, unknown> = {};
    if (post.title !== undefined) update.title = post.title;
    if (post.standfirst !== undefined) update.standfirst = post.standfirst;
    if (post.section !== undefined) update.section = post.section;
    if (post.category !== undefined) update.category = post.category;
    if (post.author !== undefined) update.author = post.author;
    if (post.image !== undefined) update.image = post.image;
    if (post.tags !== undefined) update.tags = post.tags;
    if (post.readTime !== undefined) update.read_time = post.readTime;
    if (post.isPinned !== undefined) update.is_pinned = post.isPinned;
    if (post.isPremium !== undefined) update.is_premium = post.isPremium;
    if (post.status !== undefined) update.status = post.status;
    if (post.body !== undefined) update.body = post.body;
    if (post.viewCount !== undefined) update.view_count = post.viewCount;
    if (post.publishedAt !== undefined) update.published_at = post.publishedAt;
    if (post.countryCodes !== undefined) update.country_codes = post.countryCodes;

    await (supabase.from("posts") as any).update(update).eq("id", id);
    await refreshPosts();
  };

  const deletePost = async (id: string) => {
    await supabase.from("posts").delete().eq("id", id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const incrementView = useCallback(async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const nextViews = post.viewCount + 1;
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, viewCount: nextViews } : p)));
    
    try {
      await supabase.from("posts").update({ view_count: nextViews }).eq("id", postId);
    } catch (error) {
      console.error("Error incrementing view count:", error);
    }
  }, [posts]);

  const createAlert = async (alert: { text: string; priority: string }) => {
    await supabase.from("alerts").insert({ text: alert.text, priority: alert.priority });
    await refreshAlerts();
  };

  const updateAlert = async (id: string, alert: { text?: string; priority?: string }) => {
    await supabase.from("alerts").update(alert).eq("id", id);
    await refreshAlerts();
  };

  const deleteAlert = async (id: string) => {
    await supabase.from("alerts").delete().eq("id", id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const createMediaItem = async (item: Omit<MediaItem, "id">) => {
    await (supabase.from("media_items") as any).insert({
      title: item.title,
      description: item.description,
      type: item.type,
      duration: item.duration,
      views: item.views,
      author: item.author,
      tags: item.tags,
      url: item.url,
      thumbnail: item.thumbnail,
      published_at: item.publishedAt,
      country_codes: item.countryCodes,
    });
    await refreshMedia();
  };

  const updateMediaItem = async (id: string, item: Partial<MediaItem>) => {
    const update: Record<string, unknown> = {};
    if (item.title !== undefined) update.title = item.title;
    if (item.description !== undefined) update.description = item.description;
    if (item.type !== undefined) update.type = item.type;
    if (item.duration !== undefined) update.duration = item.duration;
    if (item.author !== undefined) update.author = item.author;
    if (item.tags !== undefined) update.tags = item.tags;
    if (item.url !== undefined) update.url = item.url;
    if (item.thumbnail !== undefined) update.thumbnail = item.thumbnail;
    if (item.countryCodes !== undefined) update.country_codes = item.countryCodes;

    await (supabase.from("media_items") as any).update(update).eq("id", id);
    await refreshMedia();
  };

  const deleteMediaItem = async (id: string) => {
    await supabase.from("media_items").delete().eq("id", id);
    setMediaItems((prev) => prev.filter((i) => i.id !== id));
  };

  const createLibraryItem = async (item: Omit<LibraryItem, "id">) => {
    await (supabase.from("library_items") as any).insert({
      title: item.title,
      author: item.author,
      category: item.category,
      pages: item.pages,
      format: item.format,
      description: item.description,
      file_url: item.fileUrl,
      cover_color: item.coverColor,
      cover_image_url: item.coverImageUrl,
      country_codes: item.countryCodes,
    });
    await refreshLibrary();
  };

  const updateLibraryItem = async (id: string, item: Partial<LibraryItem>) => {
    const update: Record<string, unknown> = {};
    if (item.title !== undefined) update.title = item.title;
    if (item.author !== undefined) update.author = item.author;
    if (item.category !== undefined) update.category = item.category;
    if (item.pages !== undefined) update.pages = item.pages;
    if (item.format !== undefined) update.format = item.format;
    if (item.description !== undefined) update.description = item.description;
    if (item.fileUrl !== undefined) update.file_url = item.fileUrl;
    if (item.coverColor !== undefined) update.cover_color = item.coverColor;
    if (item.coverImageUrl !== undefined) update.cover_image_url = item.coverImageUrl;
    if (item.countryCodes !== undefined) update.country_codes = item.countryCodes;

    await (supabase.from("library_items") as any).update(update).eq("id", id);
    await refreshLibrary();
  };

  const deleteLibraryItem = async (id: string) => {
    await supabase.from("library_items").delete().eq("id", id);
    setLibraryItems((prev) => prev.filter((i) => i.id !== id));
  };

  const createEncEntry = async (entry: Omit<EncEntry, "id">) => {
    await supabase.from("encyclopaedia_entries").insert({
      title: entry.title,
      letter: entry.letter,
      content: entry.content,
    });
    await refreshEncyclopaedia();
  };

  const updateEncEntry = async (id: string, entry: Partial<EncEntry>) => {
    await supabase.from("encyclopaedia_entries").update(entry).eq("id", id);
    await refreshEncyclopaedia();
  };

  const deleteEncEntry = async (id: string) => {
    await supabase.from("encyclopaedia_entries").delete().eq("id", id);
    setEncEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const updateBanner = async (next: Partial<BannerSettings>) => {
    const update: Record<string, unknown> = {};
    if (next.enabled !== undefined) update.enabled = next.enabled;
    if (next.text !== undefined) update.text = next.text;
    if (next.priority !== undefined) update.priority = next.priority;

    if (banner.id) {
      const { error } = await supabase
        .from("banner_settings")
        .update(update)
        .eq("id", banner.id);
      if (error) throw error;
    } else {
      // No id cached — check DB for existing row first
      const { data: existing } = await supabase
        .from("banner_settings")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        const { error } = await supabase
          .from("banner_settings")
          .update(update)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("banner_settings")
          .insert(update as any);
        if (error) throw error;
      }
    }

    await refreshBanner();
  };

  return (
    <DataContext.Provider
      value={{
        posts,
        alerts,
        mediaItems,
        libraryItems,
        encEntries,
        banner,
        publishedPosts,
        loading,
        createPost,
        updatePost,
        deletePost,
        incrementView,
        createAlert,
        updateAlert,
        deleteAlert,
        createMediaItem,
        updateMediaItem,
        deleteMediaItem,
        createLibraryItem,
        updateLibraryItem,
        deleteLibraryItem,
        createEncEntry,
        updateEncEntry,
        deleteEncEntry,
        updateBanner,
        setPosts,
        setAlerts,
        setMediaItems,
        setLibraryItems,
        setEncEntries,
        setBanner,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be inside DataProvider");
  return ctx;
}
