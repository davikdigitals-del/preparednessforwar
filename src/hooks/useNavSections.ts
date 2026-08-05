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
        // categories.section_id FK references `sections` table
        const [{ data: secs }, { data: cats }] = await Promise.all([
          supabase.from("sections").select("*").order("title"),
          supabase.from("categories").select("*").order("title"),
        ]);

        if (!cats || cats.length === 0) return; // keep fallback

        // Merge: match fallback sections to DB sections by slug
        // then attach categories by section_id
        const merged = fallbackSections.map(fallback => {
          const dbSection = (secs || []).find((s: any) => s.slug === fallback.slug);
          const dbCats = dbSection
            ? cats.filter((c: any) => c.section_id === dbSection.id)
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
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { sections, loading };
}
