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

// Returns a map of section slug -> latest featured/pinned post
export function useFeaturedPosts() {
  const [featuredMap, setFeaturedMap] = useState<Record<string, FeaturedPost>>({});

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      const { data } = await supabase
        .from("posts")
        .select("id, title, image, section, category, standfirst, is_pinned, published_at")
        .eq("status", "published")
        .order("is_pinned", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(100);

      if (!data) return;

      // Pick the best post per section (pinned first, then latest)
      const map: Record<string, FeaturedPost> = {};
      for (const post of data) {
        if (!map[post.section]) {
          map[post.section] = {
            id: post.id,
            title: post.title,
            image: post.image,
            section: post.section,
            category: post.category,
            standfirst: post.standfirst,
          };
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
