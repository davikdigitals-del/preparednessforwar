import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  site_url: string;
}

const DEFAULTS: SiteSettings = {
  site_name: 'Preparedness for War',
  site_description: 'Your trusted source for emergency preparedness and survival intelligence',
  contact_email: '',
  site_url: '',
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['site_name', 'site_description', 'contact_email', 'site_url']);

      if (data) {
        const loaded: Partial<SiteSettings> = {};
        data.forEach((item: any) => {
          if (item.value) {
            loaded[item.key as keyof SiteSettings] = item.value;
          }
        });
        setSettings((prev) => ({ ...prev, ...loaded }));
      }
    } catch (error) {
      console.error('Failed to load site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading };
}
