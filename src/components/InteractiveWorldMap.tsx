import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import countryCoordinatesData from "@/data/countryCoordinates.json";
import { convertPixelToPercentage } from "@/utils/measureMapImage";
import { countryCodeMapping, getCountryCode } from "@/data/countryCodeMapping";

interface InteractiveWorldMapProps {
  onCountryClick?: (countryId: string) => void;
  debugMode?: boolean;
}

interface CountryCoordinate {
  id: number;
  country: string;
  x: number;
  y: number;
}

interface ProcessedCountry {
  id: number;
  name: string;
  code: string;
  x: number; // percentage
  y: number; // percentage
  pixelX: number; // original pixel coordinate
  pixelY: number; // original pixel coordinate
}

export const InteractiveWorldMap = ({ 
  onCountryClick, 
  debugMode = false 
}: InteractiveWorldMapProps) => {
  const navigate = useNavigate();
  const [processedCountries, setProcessedCountries] = useState<ProcessedCountry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processCoordinates = () => {
      try {
        // Convert all countries from pixel coordinates to percentages
        const processed = countryCoordinatesData.map((coord: CountryCoordinate) => {
          const percentageCoords = convertPixelToPercentage(coord.x, coord.y);
          const countryCode = getCountryCode(coord.country);
          
          return {
            id: coord.id,
            name: coord.country,
            code: countryCode,
            x: percentageCoords.x,
            y: percentageCoords.y,
            pixelX: coord.x,
            pixelY: coord.y
          };
        });
        
        setProcessedCountries(processed);
        
        if (debugMode) {
          console.log(`Processed ${processed.length} countries:`, processed.slice(0, 5));
        }
      } catch (error) {
        console.error('Error processing country coordinates:', error);
      } finally {
        setLoading(false);
      }
    };

    processCoordinates();
  }, [debugMode]);

  const handleCountryClick = (country: ProcessedCountry) => {
    if (onCountryClick) {
      onCountryClick(country.code);
    } else {
      navigate(`/countries/${country.code.toLowerCase()}`);
    }
  };

  if (loading) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Interactive World Map...</p>
          <p className="text-sm text-gray-500">Processing {countryCoordinatesData.length} countries</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* World Map Image */}
      <div className="relative w-full h-full">
        <img 
          src="/images/world-map.png"
          alt="Interactive World Map"
          className="w-full h-full object-cover"
          draggable={false}
        />
        
        {/* Clickable Country Areas */}
        <div className="absolute inset-0 w-full h-full">
          {processedCountries.map((country) => (
            <div
              key={`country-${country.id}-${country.code}`}
              className={`absolute cursor-pointer transition-all duration-200 ${
                debugMode 
                  ? 'border-2 border-red-500 bg-red-200 bg-opacity-30 hover:bg-opacity-50' 
                  : 'hover:bg-black hover:bg-opacity-10'
              }`}
              style={{
                left: `${country.x}%`,
                top: `${country.y}%`,
                width: debugMode ? '80px' : '60px',
                height: debugMode ? '24px' : '20px',
                transform: 'translate(-50%, -50%)', // Center on coordinate
                zIndex: 10
              }}
              onClick={() => handleCountryClick(country)}
              title={`${country.name} (${country.code.toUpperCase()})`}
            >
              {debugMode && (
                <div className="w-full h-full flex items-center justify-center">
                  <span 
                    className="font-bold text-red-900 text-center leading-tight select-none"
                    style={{ fontSize: '9px' }}
                  >
                    {country.code.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Debug Information Panel */}
        {debugMode && (
          <div className="absolute top-4 left-4 bg-white bg-opacity-95 p-4 rounded-lg shadow-lg max-w-sm z-20">
            <h3 className="font-bold text-gray-900 mb-2">🗺️ Debug Info</h3>
            <div className="text-sm space-y-1">
              <p><strong>Countries:</strong> {processedCountries.length}</p>
              <p><strong>Map Dimensions:</strong> 1536×1024px</p>
              <p><strong>Mode:</strong> Debug (red rectangles visible)</p>
              <p className="text-xs text-gray-600 mt-2">
                Click any country to navigate to its page. 
                Red rectangles show clickable areas with country codes.
              </p>
            </div>
          </div>
        )}

        {/* Loading overlay for countries */}
        {processedCountries.length === 0 && !loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
            <div className="bg-white p-6 rounded-lg text-center">
              <h3 className="font-bold text-gray-900 mb-2">No Countries Loaded</h3>
              <p className="text-gray-600 text-sm">
                Unable to load country coordinate data.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};