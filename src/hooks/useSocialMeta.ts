import { useEffect } from 'react';

interface SocialMetaProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'video.other';
}

/**
 * Update social media meta tags for proper preview on Facebook, Twitter, WhatsApp, etc.
 * Works on ANY page - automatically picks up current URL and site defaults
 */
export function useSocialMeta({
  title,
  description,
  image,
  url,
  type = 'website',
}: SocialMetaProps) {
  useEffect(() => {
    // Get current URL if not provided
    const currentUrl = url || window.location.href;

    // Use default image if none provided
    const imageUrl = image || 'https://preparednessforwar.com/images/preparedness-for-war-infographic.png';

    // Ensure image is absolute URL
    const absoluteImageUrl = imageUrl.startsWith('http')
      ? imageUrl
      : `https://preparednessforwar.com${imageUrl}`;

    // Limit description to ~2 lines (approximately 100-120 chars for social media)
    const truncatedDescription = description.length > 120
      ? description.substring(0, 117) + '...'
      : description;

    // Update document title
    document.title = `${title} | Preparedness for War`;

    // Helper to set or update meta tag
    const setMeta = (property: string, content: string, isName = false) => {
      const attribute = isName ? 'name' : 'property';
      let element = document.querySelector(`meta[${attribute}="${property}"]`);

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    // Basic meta tags
    setMeta('description', truncatedDescription, true);

    // Open Graph tags (Facebook, LinkedIn, WhatsApp)
    setMeta('og:type', type);
    setMeta('og:url', currentUrl);
    setMeta('og:title', title);
    setMeta('og:description', truncatedDescription);
    setMeta('og:image', absoluteImageUrl);
    setMeta('og:image:secure_url', absoluteImageUrl);
    setMeta('og:image:width', '1200');
    setMeta('og:image:height', '630');
    setMeta('og:image:alt', title);
    setMeta('og:site_name', 'Preparedness for War');
    setMeta('og:locale', 'en_GB');

    // Twitter Card tags
    setMeta('twitter:card', 'summary_large_image', true);
    setMeta('twitter:url', currentUrl, true);
    setMeta('twitter:title', title, true);
    setMeta('twitter:description', truncatedDescription, true);
    setMeta('twitter:image', absoluteImageUrl, true);
    setMeta('twitter:image:alt', title, true);

    // Cleanup function (optional - revert to defaults)
    return () => {
      document.title = 'Preparedness for War - Latest News & Updates';
    };
  }, [title, description, image, url, type]);
}
