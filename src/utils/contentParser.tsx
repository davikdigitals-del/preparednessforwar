import React from 'react';
import { MediaPlayer } from '@/components/MediaPlayer';
import { ImageCarousel } from '@/components/ImageCarousel';

/**
 * Parse HTML content and replace both carousel and video elements with React components
 */
export function parseContentWithMedia(htmlContent: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // Find all media elements
  const carousels = tempDiv.querySelectorAll('.image-carousel');
  const iframes = tempDiv.querySelectorAll('iframe[src*="youtube"], iframe[src*="youtu.be"], iframe[src*="tiktok"], iframe[src*="vimeo"], iframe[src*="dailymotion"], iframe[src*="twitch"], iframe[src*="spotify"]');
  const videoTags = tempDiv.querySelectorAll('video[src]');
  
  // Also look for plain URLs that might be videos
  const textNodes = getTextNodes(tempDiv);
  const videoUrls: { node: Text; url: string; startIndex: number }[] = [];
  
  textNodes.forEach(node => {
    const text = node.textContent || '';
    const urlRegex = /https?:\/\/[^\s<>"']+/g;
    let match;
    
    while ((match = urlRegex.exec(text)) !== null) {
      if (isVideoUrl(match[0])) {
        videoUrls.push({ 
          node, 
          url: match[0], 
          startIndex: match.index 
        });
      }
    }
  });
  
  const totalMedia = carousels.length + iframes.length + videoTags.length + videoUrls.length;
  
  if (totalMedia === 0) {
    // No media, return original HTML
    return [<div key="content" dangerouslySetInnerHTML={{ __html: htmlContent }} />];
  }
  
  // Replace media with placeholders
  const placeholder = '___MEDIA_PLACEHOLDER___';
  const mediaData: Array<{ 
    type: 'carousel' | 'video'; 
    data: any; 
    order: number; 
  }> = [];
  let placeholderIndex = 0;
  
  // Process carousels first
  carousels.forEach((carousel) => {
    const imagesAttr = carousel.getAttribute('data-images');
    if (imagesAttr) {
      try {
        const images = JSON.parse(imagesAttr);
        mediaData.push({
          type: 'carousel',
          data: { images },
          order: placeholderIndex
        });
        
        const placeholderElement = document.createTextNode(`${placeholder}${placeholderIndex}${placeholder}`);
        carousel.replaceWith(placeholderElement);
        placeholderIndex++;
      } catch (e) {
        console.error('Error parsing carousel images:', e);
      }
    }
  });
  
  // Process iframes
  iframes.forEach((iframe) => {
    const src = iframe.getAttribute('src') || '';
    const title = iframe.getAttribute('title') || 'Video';
    
    mediaData.push({
      type: 'video',
      data: { url: src, title, type: 'video' },
      order: placeholderIndex
    });
    
    const placeholderElement = document.createTextNode(`${placeholder}${placeholderIndex}${placeholder}`);
    iframe.replaceWith(placeholderElement);
    placeholderIndex++;
  });
  
  // Process video tags
  videoTags.forEach((video) => {
    const src = video.getAttribute('src') || '';
    const title = video.getAttribute('title') || 'Video';
    
    mediaData.push({
      type: 'video',
      data: { url: src, title, type: 'video' },
      order: placeholderIndex
    });
    
    const placeholderElement = document.createTextNode(`${placeholder}${placeholderIndex}${placeholder}`);
    video.replaceWith(placeholderElement);
    placeholderIndex++;
  });
  
  // Process plain video URLs
  videoUrls.forEach(({ node, url }) => {
    const text = node.textContent || '';
    const newText = text.replace(url, `${placeholder}${placeholderIndex}${placeholder}`);
    
    mediaData.push({
      type: 'video',
      data: { url, title: 'Video', type: 'video' },
      order: placeholderIndex
    });
    
    if (node.parentNode) {
      const newTextNode = document.createTextNode(newText);
      node.parentNode.replaceChild(newTextNode, node);
    }
    placeholderIndex++;
  });
  
  // Get the modified HTML with placeholders
  let processedHTML = tempDiv.innerHTML;
  
  // Split by placeholders and reconstruct with React components
  mediaData.forEach((media, index) => {
    const parts = processedHTML.split(`${placeholder}${media.order}${placeholder}`);
    
    if (parts.length === 2) {
      // Add content before media
      if (parts[0].trim()) {
        elements.push(
          <div key={`before-${index}`} dangerouslySetInnerHTML={{ __html: parts[0] }} />
        );
      }
      
      // Add media component
      if (media.type === 'carousel') {
        elements.push(
          <ImageCarousel key={`carousel-${index}`} images={media.data.images} />
        );
      } else if (media.type === 'video') {
        elements.push(
          <div key={`video-${index}`} className="my-6">
            <MediaPlayer 
              url={media.data.url} 
              title={media.data.title}
              type={media.data.type}
            />
          </div>
        );
      }
      
      // Continue with remaining content
      processedHTML = parts[1];
    }
  });
  
  // Add remaining content after last media
  if (processedHTML.trim()) {
    elements.push(
      <div key="after" dangerouslySetInnerHTML={{ __html: processedHTML }} />
    );
  }
  
  return elements;
}

/**
 * Check if content contains media (carousels or videos)
 */
export function hasMedia(htmlContent: string): boolean {
  return hasCarousels(htmlContent) || hasVideos(htmlContent);
}

/**
 * Check if content contains carousels
 */
export function hasCarousels(htmlContent: string): boolean {
  return htmlContent.includes('class="image-carousel"');
}

/**
 * Check if content contains videos
 */
export function hasVideos(htmlContent: string): boolean {
  // Check for iframes with video platforms
  if (htmlContent.includes('youtube.com') || 
      htmlContent.includes('youtu.be') ||
      htmlContent.includes('tiktok.com') ||
      htmlContent.includes('vimeo.com') ||
      htmlContent.includes('dailymotion.com') ||
      htmlContent.includes('twitch.tv') ||
      htmlContent.includes('spotify.com')) {
    return true;
  }
  
  // Check for video tags
  if (htmlContent.includes('<video') || htmlContent.includes('<iframe')) {
    return true;
  }
  
  // Check for plain video URLs in text content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  const text = tempDiv.textContent || '';
  const urlRegex = /https?:\/\/[^\s<>"']+/g;
  const urls = text.match(urlRegex) || [];
  
  return urls.some(url => isVideoUrl(url));
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
    /vt\.tiktok\.com/i,
    /\.(mp4|webm|ogg|mov)(\?|$)/i,
    /\.(mp3|wav|ogg|m4a|aac|flac)(\?|$)/i
  ];
  
  return videoPatterns.some(pattern => pattern.test(url));
}

/**
 * Get all text nodes from an element
 */
function getTextNodes(element: Element): Text[] {
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let node;
  while (node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node as Text);
    }
  }
  
  return textNodes;
}