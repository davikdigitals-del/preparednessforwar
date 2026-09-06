import React from 'react';
import { ArticleVideo } from '@/components/ArticleVideo';

/**
 * Parse HTML content and replace video/audio elements with appropriate components
 * This handles videos inserted through rich text editor and external video links
 */
export function parseContentWithVideos(htmlContent: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];

  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  // Find all video-related elements from rich text editor including new inline videos
  const videoElements = tempDiv.querySelectorAll('video[src], video source[src], .video-embed, .external-video, .inline-video');

  if (videoElements.length === 0) {
    // Check for Sky News and other external video URLs in plain text or links
    const skyNewsPattern = /https?:\/\/news\.sky\.com\/story\/[^\s<>]+/gi;
    const bbcPattern = /https?:\/\/www\.bbc\.co\.uk\/news\/[^\s<>]+/gi;
    const cnnPattern = /https?:\/\/(www\.)?cnn\.com\/[^\s<>]+/gi;
    const newsPattern = /https?:\/\/[^\s<>]*news[^\s<>]*/gi;

    let modifiedContent = htmlContent;
    const urlMatches: Array<{ url: string, start: number, end: number }> = [];

    // Find Sky News URLs
    let match;
    while ((match = skyNewsPattern.exec(htmlContent)) !== null) {
      urlMatches.push({
        url: match[0],
        start: match.index,
        end: match.index + match[0].length
      });
    }

    // Find BBC URLs
    skyNewsPattern.lastIndex = 0; // Reset regex
    while ((match = bbcPattern.exec(htmlContent)) !== null) {
      urlMatches.push({
        url: match[0],
        start: match.index,
        end: match.index + match[0].length
      });
    }

    if (urlMatches.length > 0) {
      // Sort matches by position (reverse order for replacement)
      urlMatches.sort((a, b) => b.start - a.start);

      urlMatches.forEach((urlMatch, index) => {
        const videoComponent = <ArticleVideo key={`external-${index}`} url={urlMatch.url} title="External Video" />;

        // Split content around the URL
        const beforeUrl = modifiedContent.substring(0, urlMatch.start);
        const afterUrl = modifiedContent.substring(urlMatch.end);

        // Add content before URL
        if (beforeUrl.trim()) {
          elements.unshift(<div key={`before-external-${index}`} dangerouslySetInnerHTML={{ __html: beforeUrl }} />);
        }

        // Add video component
        elements.push(videoComponent);

        // Update modified content to continue processing
        modifiedContent = afterUrl;
      });

      // Add remaining content
      if (modifiedContent.trim()) {
        elements.push(<div key="after-external" dangerouslySetInnerHTML={{ __html: modifiedContent }} />);
      }

      return elements;
    }

    // No videos found, return original HTML
    return [<div key="content" dangerouslySetInnerHTML={{ __html: htmlContent }} />];
  }

  // Replace videos with placeholders for processing
  const placeholder = '___VIDEO_PLACEHOLDER___';
  const videoData: Array<{ url: string; title: string; type?: string }> = [];

  videoElements.forEach((videoElement, index) => {
    let videoUrl = '';
    let videoType = 'direct';
    let videoTitle = 'Video';

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
      // Extract title from the element if available
      const titleElement = videoElement.querySelector('p');
      if (titleElement) {
        videoTitle = titleElement.textContent || 'Video';
      }
    } else if (videoElement.classList.contains('external-video')) {
      // External video link (Sky News, BBC, etc.)
      videoUrl = videoElement.getAttribute('data-video-url') || '';
      videoType = 'external';
      // Extract title from the element if available
      const titleElement = videoElement.querySelector('p');
      if (titleElement) {
        videoTitle = titleElement.textContent || 'External Video';
      }
    } else if (videoElement.classList.contains('inline-video')) {
      // New inline video format
      videoUrl = videoElement.getAttribute('data-video-url') || '';
      videoType = videoElement.getAttribute('data-video-type') || 'external';
      videoTitle = videoElement.getAttribute('data-video-title') || 'Video';
    }

    if (videoUrl) {
      videoData.push({ url: videoUrl, title: videoTitle, type: videoType });
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
 * Check if content contains videos or video URLs
 */
export function hasVideos(htmlContent: string): boolean {
  return htmlContent.includes('<video') ||
    htmlContent.includes('video-embed') ||
    htmlContent.includes('external-video') ||
    htmlContent.includes('inline-video') ||
    /https?:\/\/news\.sky\.com\/story\//.test(htmlContent) ||
    /https?:\/\/www\.bbc\.co\.uk\/news\//.test(htmlContent);
}