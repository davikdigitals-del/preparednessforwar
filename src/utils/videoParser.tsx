import React from 'react';
import { MediaPlayer } from '@/components/MediaPlayer';

/**
 * Parse HTML content and replace video elements with MediaPlayer components
 */
export function parseContentWithVideos(htmlContent: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // Find all video elements (iframes from RichTextEditor, direct video tags, and plain URLs)
  const iframes = tempDiv.querySelectorAll('iframe[src*="youtube"], iframe[src*="youtu.be"], iframe[src*="tiktok"], iframe[src*="vimeo"], iframe[src*="dailymotion"], iframe[src*="twitch"], iframe[src*="spotify"]');
  const videoTags = tempDiv.querySelectorAll('video[src]');
  
  // Also look for plain URLs that might be videos
  const textNodes = getTextNodes(tempDiv);
  const videoUrls: { node: Text; url: string }[] = [];
  
  textNodes.forEach(node => {
    const text = node.textContent || '';
    const urlRegex = /https?:\/\/[^\s<>"']+/g;
    const matches = text.match(urlRegex);
    
    if (matches) {
      matches.forEach(url => {
        if (isVideoUrl(url)) {
          videoUrls.push({ node, url });
        }
      });
    }
  });
  
  const totalVideos = iframes.length + videoTags.length + videoUrls.length;
  
  if (totalVideos === 0) {
    // No videos, return original HTML
    return [<div key="content" dangerouslySetInnerHTML={{ __html: htmlContent }} />];
  }
  
  // Replace videos with placeholders
  const placeholder = '___VIDEO_PLACEHOLDER___';
  const videoData: Array<{ url: string; title: string; type?: string }> = [];
  let placeholderIndex = 0;
  
  // Process iframes
  iframes.forEach((iframe) => {
    const src = iframe.getAttribute('src') || '';
    const title = iframe.getAttribute('title') || 'Video';
    
    videoData.push({ url: src, title, type: 'video' });
    
    const placeholderElement = document.createTextNode(`${placeholder}${placeholderIndex}${placeholder}`);
    iframe.replaceWith(placeholderElement);
    placeholderIndex++;
  });
  
  // Process video tags
  videoTags.forEach((video) => {
    const src = video.getAttribute('src') || '';
    const title = 'Video';
    
    videoData.push({ url: src, title, type: 'video' });
    
    const placeholderElement = document.createTextNode(`${placeholder}${placeholderIndex}${placeholder}`);
    video.replaceWith(placeholderElement);
    placeholderIndex++;
  });
  
  // Process plain video URLs
  videoUrls.forEach(({ node, url }) => {
    const text = node.textContent || '';
    const newText = text.replace(url, `${placeholder}${placeholderIndex}${placeholder}`);
    
    videoData.push({ url, title: 'Video', type: 'video' });
    
    if (node.parentNode) {
      const newTextNode = document.createTextNode(newText);
      node.parentNode.replaceChild(newTextNode, node);
    }
    placeholderIndex++;
  });
  
  // Get the modified HTML with placeholders
  let processedHTML = tempDiv.innerHTML;
  
  // Split by placeholders and reconstruct with React components
  videoData.forEach((video, index) => {
    const parts = processedHTML.split(`${placeholder}${index}${placeholder}`);
    
    if (parts.length === 2) {
      // Add content before video
      if (parts[0].trim()) {
        elements.push(
          <div key={`before-${index}`} dangerouslySetInnerHTML={{ __html: parts[0] }} />
        );
      }
      
      // Add MediaPlayer component
      elements.push(
        <div key={`video-${index}`} className="my-6">
          <MediaPlayer 
            url={video.url} 
            title={video.title}
            type={video.type as any}
          />
        </div>
      );
      
      // Continue with remaining content
      processedHTML = parts[1];
    }
  });
  
  // Add remaining content after last video
  if (processedHTML.trim()) {
    elements.push(
      <div key="after" dangerouslySetInnerHTML={{ __html: processedHTML }} />
    );
  }
  
  return elements;
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
  
  // Check for plain video URLs
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