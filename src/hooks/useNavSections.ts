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
  const [sections, setSections] = useState<NavSectionDb[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Read from nav_sections + nav_categories — these are what Admin Sections manages
        const [{ data: navSecs }, { data: navCats }, { data: navTools }] = await Promise.all([
          supabase.from("nav_sections").select("*").eq("is_active", true).order("sort_order"),
          supabase.from("nav_categories").select("*").order("sort_order"),
          supabase.from("nav_tools").select("*").order("sort_order"),
        ]);

        if (navSecs && navSecs.length > 0) {
          const merged = navSecs.map((s: any) => ({
            ...s,
            categories: (navCats || []).filter((c: any) => c.section_id === s.id),
            tools: (navTools || [])
              .filter((t: any) => t.section_id === s.id)
              .map((t: any) => ({ title: t.title, slug: t.slug })),
            featured: fallbackSections.find(f => f.slug === s.slug)?.featured || [],
          })) as NavSectionDb[];
          setSections(merged);
        } else {
          // DB empty — use fallback so nav is never blank
          setSections(fallbackSections as any);
        }
      } catch (err) {
        console.error("useNavSections error:", err);
        setSections(fallbackSections as any);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { sections, loading };
}
