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
    const fetch = async () => {
      try {
        // Get both sections and categories
        const [sectionsResult, categoriesResult] = await Promise.all([
          supabase.from("sections").select("*").order("title"),
          supabase.from("categories").select("*").order("title")
        ]);
        
        console.log('🔍 Sections:', sectionsResult.data);
        console.log('🔍 Categories:', categoriesResult.data);
        
        const dbSections = sectionsResult.data || [];
        const dbCategories = categoriesResult.data || [];
        
        if (dbCategories.length > 0) {
          // Create a mapping of section_id to section slug
          const sectionIdToSlug: Record<string, string> = {};
          dbSections.forEach(section => {
            sectionIdToSlug[section.id] = section.slug;
          });
          
          console.log('🔍 Section ID to slug mapping:', sectionIdToSlug);
          
          // Group categories by section slug
          const categoriesBySlug: Record<string, any[]> = {};
          
          dbCategories.forEach(cat => {
            let sectionSlug = 'survival-guides'; // default
            
            if (cat.section_id && sectionIdToSlug[cat.section_id]) {
              sectionSlug = sectionIdToSlug[cat.section_id];
            } else {
              // Try to guess section from category name if section_id is missing
              const catName = cat.title?.toLowerCase() || cat.slug?.toLowerCase() || '';
              if (catName.includes('directive')) sectionSlug = 'directives';
              else if (catName.includes('intel')) sectionSlug = 'intelligence';
              else if (catName.includes('news')) sectionSlug = 'news';
            }
            
            if (!categoriesBySlug[sectionSlug]) {
              categoriesBySlug[sectionSlug] = [];
            }
            categoriesBySlug[sectionSlug].push(cat);
          });
          
          console.log('🔍 Categories grouped by section:', categoriesBySlug);
          
          // Update fallback sections with proper categories
          const updatedSections = fallbackSections.map(section => ({
            ...section,
            categories: categoriesBySlug[section.slug] || section.categories
          })) as NavSectionDb[];
          
          console.log('🔍 Final sections with proper assignment:', updatedSections);
          setSections(updatedSections);
        }
      } catch (err) {
        console.error('🔍 useNavSections error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { sections, loading };
}
