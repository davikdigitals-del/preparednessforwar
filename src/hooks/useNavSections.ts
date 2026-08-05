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
  const [sections, setSections] = useState<NavSectionDb[]>(fallbackSections as any); // Start with fallback
  const [loading, setLoading] = useState(false); // Don't block UI with loading

  useEffect(() => {
    const fetch = async () => {
      try {
        const [{ data: secs }, { data: cats }, { data: tools }] = await Promise.all([
          supabase.from("nav_sections").select("*").eq("is_active", true).order("sort_order"),
          supabase.from("categories").select("*").order("sort_order"),
          supabase.from("nav_tools").select("*").order("sort_order"),
        ]);

        console.log('🔍 DB Sections:', secs);
        console.log('🔍 DB Categories:', cats);
        console.log('🔍 DB Tools:', tools);

        // Always use fallback sections as the base structure
        let finalSections = fallbackSections.map(fallbackSection => ({ ...fallbackSection })) as NavSectionDb[];

        // If we have database sections, merge them
        if (secs && secs.length > 0) {
          finalSections = secs.map(dbSection => {
            const fallback = fallbackSections.find(f => f.slug === dbSection.slug);
            const sectionCategories = (cats || []).filter(c => c.section_id === dbSection.id);
            console.log(`🔍 Section ${dbSection.slug} (id: ${dbSection.id}) has ${sectionCategories.length} categories:`, sectionCategories);
            
            return {
              ...dbSection,
              categories: sectionCategories.length > 0 ? sectionCategories : (fallback?.categories || []),
              tools: (tools || []).filter(t => t.section_id === dbSection.id).map(t => ({ title: t.title, slug: t.slug })) || [],
              featured: fallback?.featured || [],
            };
          });
        } else {
          // No DB sections, but we might have categories - try to map them to fallback sections
          if (cats && cats.length > 0) {
            // Try to find section IDs by looking up section slugs
            const sectionLookup = await Promise.all(
              fallbackSections.map(async (fallbackSection) => {
                const { data: foundSection } = await supabase
                  .from("nav_sections")
                  .select("id")
                  .eq("slug", fallbackSection.slug)
                  .single();
                return { slug: fallbackSection.slug, id: foundSection?.id };
              })
            );

            finalSections = fallbackSections.map(fallbackSection => {
              const sectionData = sectionLookup.find(s => s.slug === fallbackSection.slug);
              const dbCategories = sectionData?.id 
                ? cats.filter(c => c.section_id === sectionData.id)
                : [];
              
              console.log(`🔍 Fallback section ${fallbackSection.slug} gets ${dbCategories.length} DB categories`);
              
              return {
                ...fallbackSection,
                id: sectionData?.id || fallbackSection.slug, // Use DB ID if available
                categories: dbCategories.length > 0 ? dbCategories : fallbackSection.categories,
              } as NavSectionDb;
            });
          }
        }

        console.log('🔍 Final sections with categories:', finalSections);
        setSections(finalSections);
      } catch (err) {
        console.error('🔍 useNavSections error:', err);
        // Silent fail - keep using fallback sections
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { sections, loading };
}

  return { sections, loading };
}
