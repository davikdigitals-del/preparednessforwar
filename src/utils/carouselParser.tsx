import { ImageCarousel } from '@/components/ImageCarousel';
import { MediaPlayer } from '@/components/MediaPlayer';
import React from 'react';

/**
 * Parse HTML content and replace carousel divs and video URLs with React components
 */
export function parseContentWithCarousels(htmlContent: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];

  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  // Find all carousel elements
  const carousels = tempDiv.querySelectorAll('.image-carousel');

  // Find video URLs in text content
  const videoUrls = extractVideoUrls(htmlContent);

  if (carousels.length === 0 && videoUrls.length === 0) {
    // No carousels or videos, return original HTML
    return [<div key="content" dangerouslySetInnerHTML={{ __html: htmlContent }} />];
  }

  // Replace each carousel with a placeholder
  const placeholder = '___MEDIA_PLACEHOLDER___';
  const carouselData: string[][] = [];
  const mediaItems: Array<{ type: 'carousel' | 'video', data: any }> = [];

  carousels.forEach((carousel, index) => {
    // Extract images from data attribute
    const imagesAttr = carousel.getAttribute('data-images');
    if (imagesAttr) {
      try {
        const images = JSON.parse(imagesAttr);
        carouselData.push(images);
        mediaItems.push({ type: 'carousel', data: images });

        // Replace the entire carousel element with placeholder
        const placeholderElement = document.createTextNode(`${placeholder}${mediaItems.length - 1}${placeholder}`);
        carousel.replaceWith(placeholderElement);
      } catch (e) {
        console.error('Error parsing carousel images:', e);
      }
    }
  });

  // Replace video URLs with placeholders
  let processedHTML = tempDiv.innerHTML;
  videoUrls.forEach(url => {
    mediaItems.push({ type: 'video', data: { url, title: 'Video' } });
    processedHTML = processedHTML.replace(url, `${placeholder}${mediaItems.length - 1}${placeholder}`);
  });

  // Split by placeholders and reconstruct with React components
  mediaItems.forEach((item, index) => {
    const parts = processedHTML.split(`${placeholder}${index}${placeholder}`);

    if (parts.length === 2) {
      // Add content before media item
      if (parts[0].trim()) {
        elements.push(
          <div key={`before-${index}`} dangerouslySetInnerHTML={{ __html: parts[0] }} />
        );
      }

      // Add media component
      if (item.type === 'carousel') {
        elements.push(
          <ImageCarousel key={`carousel-${index}`} images={item.data} />
        );
      } else if (item.type === 'video') {
        elements.push(
          <div key={`video-${index}`} className="my-6">
            <MediaPlayer
              url={item.data.url}
              title={item.data.title}
              type="video"
            />
          </div>
        );
      }

      // Continue with remaining content
      processedHTML = parts[1];
    }
  });

  // Add remaining content after last media item
  if (processedHTML.trim()) {
    elements.push(
      <div key="after" dangerouslySetInnerHTML={{ __html: processedHTML }} />
    );
  }

  return elements;
}

/**
 * Check if content contains carousels or videos
 */
export function hasCarousels(htmlContent: string): boolean {
  return htmlContent.includes('class="image-carousel"') || hasVideoUrls(htmlContent);
}

/**
 * Extract video URLs from HTML content
 */
function extractVideoUrls(htmlContent: string): string[] {
  const videoUrls: string[] = [];
  const urlRegex = /https?:\/\/[^\s<>"']+/g;
  const matches = htmlContent.match(urlRegex) || [];

  matches.forEach(url => {
    if (isVideoUrl(url)) {
      videoUrls.push(url);
    }
  });

  return videoUrls;
}

/**
 * Check if content has video URLs
 */
function hasVideoUrls(htmlContent: string): boolean {
  const urlRegex = /https?:\/\/[^\s<>"']+/g;
  const matches = htmlContent.match(urlRegex) || [];
  return matches.some(url => isVideoUrl(url));
}

/**
 * Check if a URL is a video URL
 */
function isVideoUrl(url: string): boolean {
  const videoPatterns = [
    /youtube\.com\/watch/i,
    /youtu\.be\//i,
    /tiktok\.com/i,
    /vimeo\.com/i,
    /dailymotion\.com/i,
    /twitch\.tv/i,
    /spotify\.com\/episode/i,
    /vm\.tiktok\.com/i,
    /sky.*\.com/i,
    /bitchute\.com/i,
    /rumble\.com/i,
    /odysee\.com/i,
    /\.(mp4|webm|ogg|mov)(\?|$)/i
  ];

  return videoPatterns.some(pattern => pattern.test(url));
}
