import React from "react";
import { useNavigate } from "react-router-dom";

interface InteractiveWorldMapProps {
  onCountryClick?: (countryId: string) => void;
}

interface Country {
  name: string;
  code: string;
  x: number;
  y: number;
}

export const InteractiveWorldMap = ({ onCountryClick }: InteractiveWorldMapProps) => {
  const navigate = useNavigate();

  // Manual positioning based on visual analysis of the map
  const countries: Country[] = [
    // Manually adjusted coordinates to match the actual country name positions
    { name: "Canada", code: "CA", x: 18, y: 25 },
    { name: "United States of America", code: "US", x: 20, y: 38 },
    { name: "Mexico", code: "MX", x: 17, y: 45 },
    { name: "Greenland", code: "GL", x: 32, y: 13 },
    { name: "Brazil", code: "BR", x: 42, y: 62 },
    { name: "Argentina", code: "AR", x: 34, y: 80 },
    { name: "Chile", code: "CL", x: 30, y: 75 },
    { name: "Peru", code: "PE", x: 31, y: 60 },
    { name: "Colombia", code: "CO", x: 30, y: 55 },
    { name: "Venezuela", code: "VE", x: 35, y: 50 },
    { name: "Ecuador", code: "EC", x: 28, y: 58 },
    { name: "Bolivia", code: "BO", x: 35, y: 68 },
    { name: "Paraguay", code: "PY", x: 36, y: 72 },
    { name: "Uruguay", code: "UY", x: 38, y: 78 },
    { name: "Guyana", code: "GY", x: 38, y: 52 },
    { name: "Suriname", code: "SR", x: 40, y: 52 },
    { name: "French Guiana", code: "GF", x: 42, y: 52 },
    
    // Europe - manually positioned
    { name: "Iceland", code: "IS", x: 42, y: 18 },
    { name: "Ireland", code: "IE", x: 44, y: 28 },
    { name: "United Kingdom", code: "GB", x: 46, y: 28 },
    { name: "Portugal", code: "PT", x: 45, y: 38 },
    { name: "Spain", code: "ES", x: 47, y: 38 },
    { name: "France", code: "FR", x: 49, y: 35 },
    { name: "Germany", code: "DE", x: 52, y: 32 },
    { name: "Norway", code: "NO", x: 52, y: 18 },
    { name: "Russia", code: "RU", x: 75, y: 15 },
    
    // Key Asian countries
    { name: "China", code: "CN", x: 75, y: 38 },
    { name: "India", code: "IN", x: 70, y: 50 },
    { name: "Japan", code: "JP", x: 85, y: 35 },
    
    // Key African countries
    { name: "Egypt", code: "EG", x: 58, y: 45 },
    { name: "Nigeria", code: "NG", x: 48, y: 58 },
    { name: "South Africa", code: "ZA", x: 55, y: 85 },
    
    // Oceania
    { name: "Australia", code: "AU", x: 80, y: 75 },
    { name: "New Zealand", code: "NZ", x: 88, y: 85 }
  ];

  const handleCountryClick = (country: Country) => {
    if (onCountryClick) {
      onCountryClick(country.code);
    } else {
      navigate(`/countries/${country.code.toLowerCase()}`);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* World Map Image with clickable country names */}
      <div className="relative w-full h-full">
        <img 
          src="/images/world-map.png"
          alt="World Map"
          className="w-full h-full object-cover"
        />
        
        {/* Clickable areas positioned over country names with visible labels */}
        <div className="absolute inset-0 w-full h-full">
          {countries.map((country) => (
            <div
              key={country.code}
              className="absolute cursor-pointer border-2 border-red-500 bg-red-200 bg-opacity-50 flex items-center justify-center"
              style={{
                left: `${country.x}%`,
                top: `${country.y}%`,
                width: '80px',
                height: '25px',
              }}
              onClick={() => handleCountryClick(country)}
              title={country.name}
            >
              <span className="text-xs font-bold text-red-900 text-center leading-tight text-[10px]">
                {country.code}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};