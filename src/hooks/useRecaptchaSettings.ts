import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface RecaptchaSettings {
  enabled: boolean;
  siteKey: string;
  secretKey: string;
}

export function useRecaptchaSettings() {
  const [settings, setSettings] = useState<RecaptchaSettings>({
    enabled: false,
    siteKey: '',
    secretKey: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['recaptcha_enabled', 'recaptcha_site_key', 'recaptcha_secret_key'])
        .single();

      if (error) throw error;

      if (data) {
        setSettings({
          enabled: data.find((s: any) => s.key === 'recaptcha_enabled')?.value === 'true',
          siteKey: data.find((s: any) => s.key === 'recaptcha_site_key')?.value || '',
          secretKey: data.find((s: any) => s.key === 'recaptcha_secret_key')?.value || '',
        });
      }
    } catch (error) {
      console.error('Error loading reCAPTCHA settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<RecaptchaSettings>) => {
    try {
      const updates = [];

      if (newSettings.enabled !== undefined) {
        updates.push({
          key: 'recaptcha_enabled',
          value: newSettings.enabled.toString(),
        });
      }

      if (newSettings.siteKey !== undefined) {
        updates.push({
          key: 'recaptcha_site_key',
          value: newSettings.siteKey,
        });
      }

      if (newSettings.secretKey !== undefined) {
        updates.push({
          key: 'recaptcha_secret_key',
          value: newSettings.secretKey,
        });
      }

      for (const update of updates) {
        await supabase
          .from('site_settings')
          .upsert(update, { onConflict: 'key' });
      }

      setSettings((prev) => ({ ...prev, ...newSettings }));
      return true;
    } catch (error) {
      console.error('Error updating reCAPTCHA settings:', error);
      return false;
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    isEnabled: settings.enabled && settings.siteKey.length > 0,
  };
}
