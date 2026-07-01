import React, { useEffect, useState } from 'react';
import { getImageDimensions, logImageDimensions, type ImageDimensions } from '@/utils/measureMapImage';

/**
 * Component to measure and display the world map image dimensions
 * This helps us understand the actual size for coordinate conversion
 */
export const MapImageMeasurement: React.FC = () => {
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const measureImage = async () => {
      try {
        setLoading(true);
        const imagePath = '/images/world-map.png';
        
        // Get dimensions
        const dims = await getImageDimensions(imagePath);
        setDimensions(dims);
        
        // Log for console debugging
        await logImageDimensions(imagePath);
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to measure image');
        console.error('Image measurement error:', err);
      } finally {
        setLoading(false);
      }
    };

    measureImage();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Measuring Map Image...</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-blue-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-blue-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-semibold text-red-900 mb-2">Image Measurement Error</h3>
        <p className="text-red-700 text-sm">{error}</p>
        <p className="text-red-600 text-xs mt-2">
          Make sure the world map image is available at: /images/world-map.png
        </p>
      </div>
    );
  }

  if (!dimensions) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">No Dimensions Available</h3>
        <p className="text-gray-600 text-sm">Could not retrieve image dimensions.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="font-semibold text-green-900 mb-4">World Map Image Dimensions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-700">{dimensions.width}px</div>
          <div className="text-sm text-green-600">Width</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-700">{dimensions.height}px</div>
          <div className="text-sm text-green-600">Height</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-700">
            {(dimensions.width / dimensions.height).toFixed(2)}:1
          </div>
          <div className="text-sm text-green-600">Aspect Ratio</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="font-medium text-green-800 mb-2">Coordinate Conversion Info</h4>
        <div className="text-sm text-green-700 space-y-1">
          <p>• Use these dimensions to convert pixel coordinates to percentages</p>
          <p>• Formula: (pixelX / {dimensions.width}) × 100 = percentageX</p>
          <p>• Formula: (pixelY / {dimensions.height}) × 100 = percentageY</p>
          <p>• This ensures accurate positioning across all screen sizes</p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-1">Example Conversion</h4>
        <p className="text-sm text-blue-700">
          Canada (x: 303, y: 259) → ({((303 / dimensions.width) * 100).toFixed(2)}%, {((259 / dimensions.height) * 100).toFixed(2)}%)
        </p>
      </div>
    </div>
  );
};