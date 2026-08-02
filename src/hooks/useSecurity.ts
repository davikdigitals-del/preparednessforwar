import { useEffect } from 'react';

export function useSecurity() {
  useEffect(() => {
    // no-op — devtools detection and keyboard blocking removed
  }, []);
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

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

export function createRateLimiter(maxAttempts: number, windowMs: number) {
  const attempts = new Map<string, number[]>();
  return {
    check(key: string): boolean {
      const now = Date.now();
      const recent = (attempts.get(key) || []).filter(t => now - t < windowMs);
      if (recent.length >= maxAttempts) return false;
      recent.push(now);
      attempts.set(key, recent);
      return true;
    },
    reset(key: string) { attempts.delete(key); },
  };
}

declare global {
  interface Window {
    sanitizeHTML: (html: string) => string;
  }
}
