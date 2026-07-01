import React from 'react';
import { MapImageMeasurement } from '@/components/MapImageMeasurement';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Page for measuring the world map image dimensions
 * This helps us understand the actual image size for coordinate conversion
 */
const MapMeasurementPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            World Map Image Measurement
          </h1>
          <p className="text-gray-600">
            Measuring the world map image dimensions to enable accurate coordinate conversion
            for the Interactive World Map component.
          </p>
        </div>

        {/* Measurement Tool */}
        <div className="mb-8">
          <MapImageMeasurement />
        </div>

        {/* Current Map Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Current World Map Image
            </h2>
            <p className="text-gray-600 text-sm">
              This is the image we're measuring for coordinate positioning.
            </p>
          </div>
          
          <div className="p-6">
            <div className="bg-gray-100 rounded-lg p-4">
              <img 
                src="/images/world-map.png" 
                alt="World Map for Measurement"
                className="w-full h-auto rounded-lg shadow-sm"
                style={{ maxHeight: '500px', objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Next Steps
          </h2>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium">Get Image Dimensions</p>
                <p className="text-sm text-gray-600">
                  The measurement tool above will show the exact width and height of the world map image.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium">Convert Coordinates</p>
                <p className="text-sm text-gray-600">
                  Use these dimensions to convert the pixel coordinates from the JSON data to percentages.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium">Update Interactive Map</p>
                <p className="text-sm text-gray-600">
                  Apply the converted coordinates to the InteractiveWorldMap component for accurate positioning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapMeasurementPage;