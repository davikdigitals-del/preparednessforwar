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
  const [sections, setSections] = useState<NavSectionDb[]>(fallbackSections as any);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        // Just get categories - ignore complex section relationships for now
        const { data: cats } = await supabase.from("categories").select("*").order("sort_order");
        
        if (cats && cats.length > 0) {
          console.log('🔍 Found categories:', cats);
          
          // Simple approach: Add all database categories to survival-guides section
          // This ensures they show up in navigation while we debug the proper section mapping
          const updatedSections = fallbackSections.map(section => {
            if (section.slug === 'survival-guides') {
              return {
                ...section,
                categories: [...section.categories, ...cats]
              };
            }
            return section;
          }) as NavSectionDb[];
          
          console.log('🔍 Updated sections with categories:', updatedSections);
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

  return { sections, loading };
}
