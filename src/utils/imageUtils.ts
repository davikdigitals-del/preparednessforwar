/**
 * Image utilities for validation and fallback handling
 */

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  url: string;
}

/**
 * Validate if an image URL is accessible
 */
export async function validateImageUrl(url: string): Promise<ImageValidationResult> {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'Invalid URL', url };
  }

  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    if (!response.ok) {
      return { 
        isValid: false, 
        error: `HTTP ${response.status}: ${response.statusText}`, 
        url 
      };
    }

    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.startsWith('image/')) {
      return { 
        isValid: false, 
        error: `Not an image: ${contentType}`, 
        url 
      };
    }

    return { isValid: true, url };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Unknown error', 
      url 
    };
  }
}

/**
 * Get the best available image from an array of URLs
 */
export async function getBestImage(urls: (string | null | undefined)[]): Promise<string | null> {
  const validUrls = urls.filter((url): url is string => Boolean(url));
  
  if (validUrls.length === 0) return null;

  // Try each URL in order
  for (const url of validUrls) {
    try {
      const result = await validateImageUrl(url);
      if (result.isValid) {
        return url;
      }
    } catch (error) {
      console.warn(`Failed to validate image URL: ${url}`, error);
      continue;
    }
  }

  // If no URLs are valid, return the first one anyway (let browser handle it)
  return validUrls[0];
}

/**
 * Preload an image to check if it loads successfully
 */
export function preloadImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

/**
 * Get optimized Supabase image URL with transformations
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}
): string {
  // Check if this is a Supabase storage URL
  if (!originalUrl.includes('supabase.co/storage/v1/object/public/')) {
    return originalUrl;
  }

  const { width, height, quality = 80, format } = options;
  const url = new URL(originalUrl);
  
  // Add transformation parameters
  if (width) url.searchParams.set('width', width.toString());
  if (height) url.searchParams.set('height', height.toString());
  if (quality !== 80) url.searchParams.set('quality', quality.toString());
  if (format) url.searchParams.set('format', format);

  return url.toString();
}

/**
 * Generate placeholder image URL
 */
export function getPlaceholderImageUrl(
  width: number = 400,
  height: number = 400,
  text: string = 'No Image'
): string {
  // Using a simple placeholder service
  return `https://via.placeholder.com/${width}x${height}/e5e7eb/6b7280?text=${encodeURIComponent(text)}`;
}

/**
 * Check if URL is a Supabase storage URL
 */
export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('supabase.co/storage/v1/object/public/');
}

/**
 * Extract file extension from URL
 */
export function getFileExtension(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const extension = pathname.split('.').pop()?.toLowerCase();
    return extension || null;
  } catch {
    return null;
  }
}

/**
 * Check if file extension is a supported image format
 */
export function isSupportedImageFormat(url: string): boolean {
  const extension = getFileExtension(url);
  const supportedFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
  return supportedFormats.includes(extension || '');
}

/**
 * Image loading states for React components
 */
export type ImageLoadingState = 'loading' | 'loaded' | 'error' | 'fallback';

/**
 * Hook-like utility for managing image loading state
 */
export class ImageLoader {
  private url: string;
  private fallbackUrls: string[];
  private onStateChange: (state: ImageLoadingState, url?: string) => void;
  
  constructor(
    url: string, 
    fallbackUrls: string[] = [],
    onStateChange: (state: ImageLoadingState, url?: string) => void
  ) {
    this.url = url;
    this.fallbackUrls = fallbackUrls;
    this.onStateChange = onStateChange;
  }

  async load(): Promise<string | null> {
    this.onStateChange('loading');
    
    // Try main URL first
    const mainResult = await preloadImage(this.url);
    if (mainResult) {
      this.onStateChange('loaded', this.url);
      return this.url;
    }

    // Try fallback URLs
    for (const fallbackUrl of this.fallbackUrls) {
      const fallbackResult = await preloadImage(fallbackUrl);
      if (fallbackResult) {
        this.onStateChange('loaded', fallbackUrl);
        return fallbackUrl;
      }
    }

    // All failed
    this.onStateChange('error');
    return null;
  }
}