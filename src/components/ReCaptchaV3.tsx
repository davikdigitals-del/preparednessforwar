import { useEffect, useRef } from 'react';

interface ReCaptchaV3Props {
  siteKey: string;
  action: string;
  onVerify: (token: string) => void;
  onError?: () => void;
}

/**
 * Google reCAPTCHA v3 Component
 * Invisible reCAPTCHA that works automatically without user interaction
 */
export function ReCaptchaV3({ siteKey, action, onVerify, onError }: ReCaptchaV3Props) {
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;

    // Load reCAPTCHA v3 script
    const loadRecaptcha = () => {
      if (document.getElementById('recaptcha-v3-script')) {
        return;
      }

      const script = document.createElement('script');
      script.id = 'recaptcha-v3-script';
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    loadRecaptcha();
    loadedRef.current = true;
  }, [siteKey]);

  return null; // v3 is invisible, no UI needed
}

/**
 * Hook to execute reCAPTCHA v3
 */
export function useReCaptchaV3(siteKey: string) {
  const execute = async (action: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!window.grecaptcha) {
        reject(new Error('reCAPTCHA not loaded'));
        return;
      }

      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(siteKey, { action })
          .then((token: string) => {
            resolve(token);
          })
          .catch((error: any) => {
            reject(error);
          });
      });
    });
  };

  return { execute };
}

// Type definitions for grecaptcha v3
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}
