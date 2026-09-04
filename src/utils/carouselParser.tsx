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
  
  // Process content and extract carousels
  let lastIndex = 0;
  const originalHTML = htmlContent;
  
  carousels.forEach((carousel, index) => {
    const carouselHTML = carousel.outerHTML;
    const carouselIndex = originalHTML.indexOf(carouselHTML, lastIndex);
    
    if (carouselIndex === -1) return;
    
    // Add content before carousel
    if (carouselIndex > lastIndex) {
      const beforeContent = originalHTML.substring(lastIndex, carouselIndex);
      if (beforeContent.trim()) {
        elements.push(
          <div key={`before-${index}`} dangerouslySetInnerHTML={{ __html: beforeContent }} />
        );
      }
    }
    
    // Extract images from data attribute
    const imagesAttr = carousel.getAttribute('data-images');
    if (imagesAttr) {
      try {
        const images = JSON.parse(imagesAttr);
        elements.push(
          <ImageCarousel key={`carousel-${index}`} images={images} />
        );
      } catch (e) {
        console.error('Error parsing carousel images:', e);
      }
    }
    
    lastIndex = carouselIndex + carouselHTML.length;
  });
  
  // Add remaining content after last carousel
  if (lastIndex < originalHTML.length) {
    const afterContent = originalHTML.substring(lastIndex);
    if (afterContent.trim()) {
      elements.push(
        <div key="after" dangerouslySetInnerHTML={{ __html: afterContent }} />
      );
    }
  }
  
  return elements;
}

/**
 * Check if content contains carousels
 */
export function hasCarousels(htmlContent: string): boolean {
  return htmlContent.includes('class="image-carousel"');
}
