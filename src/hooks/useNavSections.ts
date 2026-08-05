import { useState, useEffect } from "react";
import { publicSupabase as supabase } from "@/integrations/supabase/publicClient";
import { navSections as fallbackSections } from "@/data/mockData";

export interface NavCategoryDb { id: string; title: string; slug: string; sort_order: number; }
export interface NavSectionDb {
  id: string;
  title: string;
  slug: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  categories: NavCategoryDb[];
  tools?: { title: string; slug: string }[];
  featured?: { title: string; slug: string; image?: string }[];
}

export function useNavSections() {
  const [sections, setSections] = useState<NavSectionDb[]>(fallbackSections as any);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Load categories from db
        const { data: cats } = await supabase
          .from("categories")
          .select("*")
          .order("title");

        if (!cats || cats.length === 0) return; // keep fallback

        // Try nav_sections first (has sort_order + is_active)
        const { data: navSecs } = await supabase
          .from("nav_sections")
          .select("*")
          .eq("is_active", true)
          .order("sort_order");

        // Fallback to sections table
        const { data: altSecs } = await supabase
          .from("sections")
          .select("*")
          .order("title");

        const dbSections = (navSecs && navSecs.length > 0) ? navSecs : (altSecs || []);

        // Build merged sections: match categories by section_id
        const merged = fallbackSections.map(fallback => {
          // Find the DB section that matches this fallback slug
          const dbSection = dbSections.find((s: any) => s.slug === fallback.slug);
          const sectionId = dbSection?.id;

          // Get categories assigned to this section
          const dbCats = sectionId
            ? cats.filter((c: any) => c.section_id === sectionId)
            : [];

          return {
            ...fallback,
            id: dbSection?.id || fallback.slug,
            categories: dbCats.length > 0 ? dbCats : fallback.categories,
          } as NavSectionDb;
        });

        setSections(merged);
      } catch (err) {
        console.error("useNavSections error:", err);
        // keep fallback on error
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { sections, loading };
}
