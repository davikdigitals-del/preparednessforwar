import { useEffect } from 'react';

/**
 * Security Hook - Frontend Protection Layer
 * Implements multiple security measures to protect against common attacks
 */
export function useSecurity() {
  useEffect(() => {
    // ============================================
    // 1. PREVENT CONSOLE ACCESS IN PRODUCTION
    // ============================================
    if (import.meta.env.PROD) {
      // Disable console to prevent information disclosure
      console.log = () => {};
      console.warn = () => {};
      console.error = () => {};
      console.info = () => {};
      console.debug = () => {};
    }

    // ============================================
    // 2. DETECT AND PREVENT DEVTOOLS
    // ============================================
    const detectDevTools = () => {
      const threshold = 160;
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        // DevTools detected
        if (import.meta.env.PROD) {
          document.body.innerHTML = '<h1 style="text-align:center;margin-top:50px;">🔒 Security Alert: Developer tools detected</h1>';
        }
      }
    };

    if (import.meta.env.PROD) {
      setInterval(detectDevTools, 1000);
    }

    // ============================================
    // 3. PREVENT RIGHT-CLICK CONTEXT MENU
    // ============================================
    // Removed — users should be able to right-click and copy content
    const preventContextMenu = (_e: MouseEvent) => {}; // no-op

    document.addEventListener('contextmenu', preventContextMenu);

    // ============================================
    // 4. PREVENT COMMON KEYBOARD SHORTCUTS
    // ============================================
    const preventShortcuts = (e: KeyboardEvent) => {
      if (import.meta.env.PROD) {
        // Prevent F12 (DevTools)
        if (e.key === 'F12') {
          e.preventDefault();
          return false;
        }

        // Prevent Ctrl+Shift+I (DevTools)
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
          e.preventDefault();
          return false;
        }

        // Prevent Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.key === 'J') {
          e.preventDefault();
          return false;
        }

        // Prevent Ctrl+Shift+C (Inspect Element)
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
          e.preventDefault();
          return false;
        }

        // Prevent Ctrl+U (View Source)
        if (e.ctrlKey && e.key === 'u') {
          e.preventDefault();
          return false;
        }

        // Ctrl+S, Ctrl+C (copy) — allowed, do NOT block
      }
    };

    document.addEventListener('keydown', preventShortcuts);

    // ============================================
    // 5. COPY — ALLOWED FOR ALL CONTENT
    // ============================================
    // Removed copy prevention — users should be able to copy text freely
    const preventCopy = (_e: ClipboardEvent) => {}; // no-op

    document.addEventListener('copy', preventCopy);

    // ============================================
    // 6. PREVENT TEXT SELECTION (OPTIONAL)
    // ============================================
    // Uncomment to prevent text selection in production
    /*
    if (import.meta.env.PROD) {
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
    }
    */

    // ============================================
    // 7. DETECT IFRAME EMBEDDING ATTEMPTS
    // ============================================
    if (window.self !== window.top) {
      // Site is being embedded in an iframe
      if (import.meta.env.PROD) {
        window.top!.location = window.self.location;
      }
    }

    // ============================================
    // 8. MONITOR FOR SUSPICIOUS ACTIVITY
    // ============================================
    let clickCount = 0;
    let lastClickTime = Date.now();

    const detectClickSpam = () => {
      clickCount++;
      const now = Date.now();

      // Reset counter after 1 second
      if (now - lastClickTime > 1000) {
        clickCount = 0;
      }

      lastClickTime = now;

      // If more than 20 clicks per second, potential bot
      if (clickCount > 20) {
        console.warn('⚠️ Suspicious activity detected');
        // Could log this to your backend for monitoring
      }
    };

    document.addEventListener('click', detectClickSpam);

    // ============================================
    // 9. PROTECT LOCAL STORAGE
    // ============================================
    // Encrypt sensitive data before storing
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key: string, value: string) {
      // Only encrypt specific sensitive keys
      if (key.includes('token') || key.includes('session') || key.includes('auth')) {
        // Simple obfuscation (in production, use proper encryption)
        value = btoa(value); // Base64 encode
      }
      originalSetItem.call(this, key, value);
    };

    const originalGetItem = localStorage.getItem;
    localStorage.getItem = function (key: string) {
      const value = originalGetItem.call(this, key);
      if (value && (key.includes('token') || key.includes('session') || key.includes('auth'))) {
        try {
          return atob(value); // Base64 decode
        } catch {
          return value;
        }
      }
      return value;
    };

    // ============================================
    // 10. XSS PROTECTION - SANITIZE USER INPUT
    // ============================================
    window.sanitizeHTML = (html: string): string => {
      const div = document.createElement('div');
      div.textContent = html;
      return div.innerHTML;
    };

    // ============================================
    // CLEANUP
    // ============================================
    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventShortcuts);
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('click', detectClickSpam);
    };
  }, []);
}

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check password strength
 */
export function checkPasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong';
  score: number;
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score += 20;
  else feedback.push('Password should be at least 8 characters');

  if (password.length >= 12) score += 10;

  if (/[a-z]/.test(password)) score += 15;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 15;
  else feedback.push('Add uppercase letters');

  if (/[0-9]/.test(password)) score += 20;
  else feedback.push('Add numbers');

  if (/[^a-zA-Z0-9]/.test(password)) score += 20;
  else feedback.push('Add special characters');

  const strength = score < 50 ? 'weak' : score < 80 ? 'medium' : 'strong';

  return { strength, score, feedback };
}

/**
 * Rate limiting helper
 */
export function createRateLimiter(maxAttempts: number, windowMs: number) {
  const attempts = new Map<string, number[]>();

  return {
    check(key: string): boolean {
      const now = Date.now();
      const userAttempts = attempts.get(key) || [];

      // Remove old attempts outside the window
      const recentAttempts = userAttempts.filter((time) => now - time < windowMs);

      if (recentAttempts.length >= maxAttempts) {
        return false; // Rate limit exceeded
      }

      // Add current attempt
      recentAttempts.push(now);
      attempts.set(key, recentAttempts);

      return true; // Allowed
    },

    reset(key: string) {
      attempts.delete(key);
    },
  };
}

// Declare global sanitizeHTML function
declare global {
  interface Window {
    sanitizeHTML: (html: string) => string;
  }
}
