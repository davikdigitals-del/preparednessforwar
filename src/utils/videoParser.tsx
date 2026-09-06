import React from 'react';
import { ArticleVideo } from '@/components/ArticleVideo';

/**
 * Parse HTML content and replace video/audio elements with appropriate components
 * This is separate from carousel parsing and handles both videos and audio
 */
export function parseContentWithVideos(htmlContent: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];

  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  // Find all video-related elements from rich text editor
  const videoElements = tempDiv.querySelectorAll('video[src], video source[src], .video-embed, .external-video');

  if (videoElements.length === 0) {
    // No videos, return original HTML
    return [<div key="content" dangerouslySetInnerHTML={{ __html: htmlContent }} />];
  }

  // Replace videos with placeholders
  const placeholder = '___VIDEO_PLACEHOLDER___';
  const videoData: Array<{ url: string; title: string; type?: string }> = [];

  videoElements.forEach((videoElement, index) => {
    let videoUrl = '';
    let videoType = 'direct';

    // Handle different video element types
    if (videoElement.tagName === 'VIDEO') {
      // Direct video element
      videoUrl = videoElement.getAttribute('src') || '';
      if (!videoUrl) {
        const sourceElement = videoElement.querySelector('source[src]');
        if (sourceElement) {
          videoUrl = sourceElement.getAttribute('src') || '';
        }
      }
      videoType = 'direct';
    } else if (videoElement.tagName === 'SOURCE') {
      // Source element within video
      videoUrl = videoElement.getAttribute('src') || '';
      const parentVideo = videoElement.closest('video');
      if (parentVideo) {
        videoElement = parentVideo;
      }
      videoType = 'direct';
    } else if (videoElement.classList.contains('video-embed')) {
      // Embedded video (YouTube, Vimeo)
      videoUrl = videoElement.getAttribute('data-video-url') || '';
      videoType = 'embed';
    } else if (videoElement.classList.contains('external-video')) {
      // External video link (Sky News, BBC, etc.)
      videoUrl = videoElement.getAttribute('data-video-url') || '';
      videoType = 'external';
    }

    if (videoUrl) {
      videoData.push({ url: videoUrl, title: 'Video', type: videoType });
      const placeholderElement = document.createTextNode(`${placeholder}${index}${placeholder}`);
      videoElement.replaceWith(placeholderElement);
    }
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

      // Add ArticleVideo component with proper type
      elements.push(
        <ArticleVideo
          key={`video-${index}`}
          url={video.url}
          title={video.title}
          type={video.type === 'external' ? undefined : video.type}
        />
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
  return htmlContent.includes('<video');
}