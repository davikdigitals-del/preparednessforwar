import { ImageCarousel } from '@/components/ImageCarousel';
import React from 'react';

/**
 * Parse HTML content and replace carousel divs with React components
 */
export function parseContentWithCarousels(htmlContent: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];

  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  // Find all carousel elements
  const carousels = tempDiv.querySelectorAll('.image-carousel');

  if (carousels.length === 0) {
    // No carousels, return original HTML
    return [<div key="content" dangerouslySetInnerHTML={{ __html: htmlContent }} />];
  }

  // Replace each carousel with a placeholder
  const placeholder = '___CAROUSEL_PLACEHOLDER___';
  const carouselData: string[][] = [];

  carousels.forEach((carousel, index) => {
    // Extract images from data attribute
    const imagesAttr = carousel.getAttribute('data-images');
    if (imagesAttr) {
      try {
        const images = JSON.parse(imagesAttr);
        carouselData.push(images);

        // Replace the entire carousel element with placeholder
        const placeholderElement = document.createTextNode(`${placeholder}${index}${placeholder}`);
        carousel.replaceWith(placeholderElement);
      } catch (e) {
        console.error('Error parsing carousel images:', e);
      }
    }
  });

  // Get the modified HTML with placeholders
  let processedHTML = tempDiv.innerHTML;

  // Split by placeholders and reconstruct with React components
  carouselData.forEach((images, index) => {
    const parts = processedHTML.split(`${placeholder}${index}${placeholder}`);

    if (parts.length === 2) {
      // Add content before carousel
      if (parts[0].trim()) {
        elements.push(
          <div key={`before-${index}`} dangerouslySetInnerHTML={{ __html: parts[0] }} />
        );
      }

      // Add carousel component
      elements.push(
        <ImageCarousel key={`carousel-${index}`} images={images} />
      );

      // Continue with remaining content
      processedHTML = parts[1];
    }
  });

  // Add remaining content after last carousel
  if (processedHTML.trim()) {
    elements.push(
      <div key="after" dangerouslySetInnerHTML={{ __html: processedHTML }} />
    );
  }

  return elements;
}

/**
 * Check if content contains carousels
 */
export function hasCarousels(htmlContent: string): boolean {
  return htmlContent.includes('class="image-carousel"');
}
