import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FeaturedPost {
  id: string;
  title: string;
  image: string | null;
  section: string;
  category: string;
  standfirst: string | null;
}

// Returns a map of section slug -> up to 2 pinned posts
export function useFeaturedPosts() {
  const [featuredMap, setFeaturedMap] = useState<Record<string, FeaturedPost[]>>({});

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      const { data } = await supabase
        .from("posts")
        .select("id, title, image, section, category, standfirst, is_pinned, published_at")
        .eq("status", "published")
        .eq("is_pinned", true) // Only get pinned posts
        .order("published_at", { ascending: false });

      if (!data) return;

      // Group posts by section, max 2 per section
      const map: Record<string, FeaturedPost[]> = {};
      for (const post of data) {
        if (!map[post.section]) {
          map[post.section] = [];
        }
        // Only add if section has less than 2 posts
        if (map[post.section].length < 2) {
          map[post.section].push({
            id: post.id,
            title: post.title,
            image: post.image,
            section: post.section,
            category: post.category,
            standfirst: post.standfirst,
          });
        }
      }
      setFeaturedMap(map);
    };

    // Initial fetch
    fetchFeaturedPosts();

    // Set up realtime subscription for posts changes
    const channel = supabase
      .channel("posts-featured-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        () => {
          // Refetch when any post changes (including pin/unpin)
          fetchFeaturedPosts();
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return featuredMap;
}
