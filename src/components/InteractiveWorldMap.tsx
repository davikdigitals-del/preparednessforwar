import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface InteractiveWorldMapProps {
  onCountryClick?: (countryId: string) => void;
}

interface Country {
  name: string;
  code: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const InteractiveWorldMap = ({ onCountryClick }: InteractiveWorldMapProps) => {
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null);
  const navigate = useNavigate();

  // Country hotspots with accurate positioning based on the map image
  const countries: Country[] = [
    // North America
    { name: "United States", code: "US", x: 15, y: 35, width: 20, height: 15 },
    { name: "Canada", code: "CA", x: 10, y: 20, width: 25, height: 20 },
    { name: "Mexico", code: "MX", x: 12, y: 50, width: 12, height: 8 },
    
    // South America
    { name: "Brazil", code: "BR", x: 35, y: 60, width: 12, height: 15 },
    { name: "Argentina", code: "AR", x: 32, y: 75, width: 8, height: 12 },
    { name: "Chile", code: "CL", x: 30, y: 70, width: 3, height: 20 },
    
    // Europe
    { name: "United Kingdom", code: "GB", x: 48, y: 28, width: 3, height: 4 },
    { name: "France", code: "FR", x: 50, y: 32, width: 4, height: 4 },
    { name: "Germany", code: "DE", x: 52, y: 30, width: 3, height: 4 },
    { name: "Spain", code: "ES", x: 47, y: 36, width: 5, height: 4 },
    { name: "Italy", code: "IT", x: 52, y: 36, width: 3, height: 6 },
    { name: "Russia", code: "RU", x: 55, y: 20, width: 30, height: 20 },
    
    // Asia
    { name: "China", code: "CN", x: 70, y: 35, width: 12, height: 10 },
    { name: "India", code: "IN", x: 68, y: 45, width: 8, height: 8 },
    { name: "Japan", code: "JP", x: 85, y: 38, width: 3, height: 6 },
    { name: "South Korea", code: "KR", x: 82, y: 38, width: 2, height: 2 },
    
    // Middle East
    { name: "Saudi Arabia", code: "SA", x: 60, y: 45, width: 6, height: 6 },
    { name: "Iran", code: "IR", x: 62, y: 40, width: 5, height: 5 },
    { name: "Turkey", code: "TR", x: 55, y: 36, width: 4, height: 3 },
    
    // Africa
    { name: "Egypt", code: "EG", x: 55, y: 48, width: 4, height: 4 },
    { name: "Nigeria", code: "NG", x: 50, y: 52, width: 4, height: 4 },
    { name: "South Africa", code: "ZA", x: 54, y: 70, width: 6, height: 6 },
    
    // Oceania
    { name: "Australia", code: "AU", x: 80, y: 70, width: 12, height: 8 }
  ];

  const handleCountryClick = (country: Country) => {
    if (onCountryClick) {
      onCountryClick(country.code);
    } else {
      navigate(`/countries/${country.code.toLowerCase()}`);
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-sky-100 to-sky-200 overflow-hidden">
      {/* Clean World Map with Interactive Overlays */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="relative w-full h-full max-w-6xl">
          {/* World Map Image */}
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg" 
            alt="World Map"
            className="w-full h-full object-contain"
            style={{ 
              minWidth: '100%', 
              minHeight: '100%'
            }}
          />
          
          {/* Country Hotspots */}
          {countries.map((country) => (
            <div
              key={country.code}
              className="absolute cursor-pointer transition-all duration-200 hover:bg-blue-500 hover:bg-opacity-30 rounded-sm"
              style={{
                left: `${country.x}%`,
                top: `${country.y}%`,
                width: `${country.width}%`,
                height: `${country.height}%`
              }}
              onMouseEnter={() => setHoveredCountry(country)}
              onMouseLeave={() => setHoveredCountry(null)}
              onClick={() => handleCountryClick(country)}
            />
          ))}
          
          {/* Country Tooltip */}
          {hoveredCountry && (
            <div className="absolute bg-black bg-opacity-80 text-white px-3 py-1 rounded shadow-lg pointer-events-none z-10"
                 style={{
                   left: `${hoveredCountry.x + hoveredCountry.width/2}%`,
                   top: `${hoveredCountry.y - 5}%`,
                   transform: 'translateX(-50%)'
                 }}>
              {hoveredCountry.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};