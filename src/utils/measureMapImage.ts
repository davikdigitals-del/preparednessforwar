/**
 * Utility to measure the world map image dimensions
 * This is needed to convert pixel coordinates to percentages for responsive positioning
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

// Actual measured dimensions of the world map image
export const WORLD_MAP_DIMENSIONS: ImageDimensions = {
  width: 1536,
  height: 1024
};

/**
 * Get the natural dimensions of the world map image
 * @param imageSrc - The image source path
 * @returns Promise with image width and height
 */
export const getImageDimensions = (imageSrc: string): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imageSrc}`));
    };
    
    img.src = imageSrc;
  });
};

/**
 * Convert pixel coordinates to percentage based on world map image dimensions
 * @param pixelX - X coordinate in pixels
 * @param pixelY - Y coordinate in pixels
 * @returns Percentage coordinates for responsive positioning
 */
export const convertPixelToPercentage = (
  pixelX: number, 
  pixelY: number
) => {
  return {
    x: (pixelX / WORLD_MAP_DIMENSIONS.width) * 100,
    y: (pixelY / WORLD_MAP_DIMENSIONS.height) * 100
  };
};

/**
 * Convert pixel coordinates to percentage with custom dimensions
 * @param pixelX - X coordinate in pixels
 * @param pixelY - Y coordinate in pixels
 * @param imageDimensions - The actual image width and height
 * @returns Percentage coordinates for responsive positioning
 */
export const convertPixelToPercentageCustom = (
  pixelX: number, 
  pixelY: number, 
  imageDimensions: ImageDimensions
) => {
  return {
    x: (pixelX / imageDimensions.width) * 100,
    y: (pixelY / imageDimensions.height) * 100
  };
};

/**
 * Log image dimensions for debugging
 * @param imageSrc - The image source path
 */
export const logImageDimensions = async (imageSrc: string) => {
  try {
    const dimensions = await getImageDimensions(imageSrc);
    console.log(`Image dimensions for ${imageSrc}:`, {
      width: dimensions.width,
      height: dimensions.height,
      aspectRatio: (dimensions.width / dimensions.height).toFixed(2)
    });
    return dimensions;
  } catch (error) {
    console.error('Failed to get image dimensions:', error);
    return null;
  }
};