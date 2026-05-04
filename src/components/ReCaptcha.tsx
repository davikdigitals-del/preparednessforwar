import { useEffect, useRef, useState } from 'react';

interface ReCaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpired?: () => void;
  size?: 'normal' | 'compact' | 'invisible';
  theme?: 'light' | 'dark';
  action?: string;
}

export function ReCaptcha({
  siteKey,
  onVerify,
  onError,
  onExpired,
  size = 'normal',
  theme = 'light',
  action = 'submit',
}: ReCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  
  // Store callbacks in refs to avoid re-renders
  const onVerifyRef = useRef(onVerify);
  const onErrorRef = useRef(onError);
  const onExpiredRef = useRef(onExpired);
  
  // Update callback refs when they change
  useEffect(() => {
    onVerifyRef.current = onVerify;
    onErrorRef.current = onError;
    onExpiredRef.current = onExpired;
  }, [onVerify, onError, onExpired]);

  // Load reCAPTCHA script
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.getElementById('recaptcha-script');
    
    if (existingScript) {
      // Script already loaded
      if (window.grecaptcha) {
        setIsScriptLoaded(true);
      }
      return;
    }

    // Create and load script
    const script = document.createElement('script');
    script.id = 'recaptcha-script';
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    
    script.onerror = () => {
      console.error('Failed to load reCAPTCHA script');
    };
    
    document.head.appendChild(script);
  }, []);

  // Render reCAPTCHA widget when script is loaded
  useEffect(() => {
    if (!isScriptLoaded || !containerRef.current || isRendered || !window.grecaptcha) {
      return;
    }

    // Wait for grecaptcha to be ready
    window.grecaptcha.ready(() => {
      if (!containerRef.current || isRendered) return;

      try {
        // Clear any existing content in the container
        containerRef.current.innerHTML = '';
        
        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            onVerifyRef.current(token);
          },
          'error-callback': () => {
            onErrorRef.current?.();
          },
          'expired-callback': () => {
            onExpiredRef.current?.();
          },
          size,
          theme,
        });
        
        setIsRendered(true);
      } catch (error) {
        console.error('Error rendering reCAPTCHA:', error);
      }
    });

    // Cleanup on unmount
    return () => {
      if (widgetIdRef.current !== null && window.grecaptcha) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [isScriptLoaded, siteKey, size, theme, isRendered]);

  return <div ref={containerRef} style={{ minHeight: '78px' }} />;
}

// Invisible reCAPTCHA for programmatic execution
export function useInvisibleReCaptcha(siteKey: string) {
  const widgetIdRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadRecaptcha = () => {
      if (document.getElementById('recaptcha-script')) {
        return;
      }

      const script = document.createElement('script');
      script.id = 'recaptcha-script';
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    loadRecaptcha();
  }, []);

  const execute = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!window.grecaptcha) {
        reject(new Error('reCAPTCHA not loaded'));
        return;
      }

      window.grecaptcha.ready(() => {
        if (!containerRef.current) {
          reject(new Error('Container not ready'));
          return;
        }

        if (widgetIdRef.current === null) {
          widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
            sitekey: siteKey,
            size: 'invisible',
            callback: (token: string) => {
              resolve(token);
            },
            'error-callback': () => {
              reject(new Error('reCAPTCHA error'));
            },
          });
        }

        window.grecaptcha.execute(widgetIdRef.current);
      });
    });
  };

  const reset = () => {
    if (widgetIdRef.current !== null && window.grecaptcha) {
      window.grecaptcha.reset(widgetIdRef.current);
    }
  };

  return { execute, reset, containerRef };
}

// Type definitions for grecaptcha
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      render: (
        container: HTMLElement,
        parameters: {
          sitekey: string;
          callback?: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          size?: 'normal' | 'compact' | 'invisible';
          theme?: 'light' | 'dark';
        }
      ) => number;
      reset: (widgetId: number) => void;
      execute: (widgetId: number) => void;
      getResponse: (widgetId: number) => string;
    };
  }
}
