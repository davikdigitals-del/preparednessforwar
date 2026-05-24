import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
    const fetch = async () => {
      try {
        const [{ data: secs }, { data: cats }, { data: tools }] = await Promise.all([
          supabase.from("nav_sections").select("*").eq("is_active", true).order("sort_order"),
          supabase.from("nav_categories").select("*").order("sort_order"),
          supabase.from("nav_tools").select("*").order("sort_order"),
        ]);

        if (secs && secs.length > 0) {
          const merged: NavSectionDb[] = secs.map(s => {
            const fallback = fallbackSections.find(f => f.slug === s.slug);
            return {
              ...s,
              categories: (cats || []).filter(c => c.section_id === s.id),
              tools: (tools || []).filter(t => t.section_id === s.id).map(t => ({ title: t.title, slug: t.slug })),
              featured: fallback?.featured || [],
            };
          });
          setSections(merged);
        } else {
          // Fallback to mockData if DB is empty
          setSections(fallbackSections as any);
        }
      } catch {
        setSections(fallbackSections as any);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { sections, loading };
}
