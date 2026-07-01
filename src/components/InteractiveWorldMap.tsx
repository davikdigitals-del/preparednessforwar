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

  // Countries positioned with exact coordinates converted to percentages
  // Based on coordinates from your world map image
  const countries: Country[] = [
    // NORTH AMERICA - using pixel coordinates converted to percentages (x/2048*100, y/1024*100)
    { name: "Canada", code: "CA", x: 14.8, y: 25.3 },
    { name: "United States of America", code: "US", x: 15.4, y: 36.8 },
    { name: "Mexico", code: "MX", x: 13.4, y: 43.5 },
    { name: "Greenland", code: "GL", x: 24.8, y: 12.7 },
    
    // SOUTH AMERICA
    { name: "Brazil", code: "BR", x: 24.2, y: 60.5 },
    { name: "Argentina", code: "AR", x: 25.5, y: 81.5 },
    { name: "Chile", code: "CL", x: 21.2, y: 71.8 },
    { name: "Peru", code: "PE", x: 21.5, y: 58.6 },
    { name: "Colombia", code: "CO", x: 20.8, y: 53.7 },
    { name: "Venezuela", code: "VE", x: 24.4, y: 47.9 },
    { name: "Ecuador", code: "EC", x: 19.5, y: 53.5 },
    { name: "Bolivia", code: "BO", x: 24.4, y: 68.4 },
    
    // EUROPE - converted coordinates
    { name: "Iceland", code: "IS", x: 29.8, y: 16.6 },
    { name: "Ireland", code: "IE", x: 32.2, y: 23.4 },
    { name: "United Kingdom", code: "GB", x: 34.2, y: 23.4 },
    { name: "Portugal", code: "PT", x: 33.7, y: 33.2 },
    { name: "Spain", code: "ES", x: 35.4, y: 33.7 },
    { name: "France", code: "FR", x: 37.1, y: 29.3 },
    { name: "Germany", code: "DE", x: 39.6, y: 28.3 },
    { name: "Norway", code: "NO", x: 39.6, y: 16.6 },
    { name: "Russia", code: "RU", x: 54.7, y: 16.6 },
    
    // ASIA - sample countries
    { name: "China", code: "CN", x: 65.9, y: 35.2 },
    { name: "India", code: "IN", x: 61.5, y: 47.9 },
    { name: "Japan", code: "JP", x: 73.2, y: 27.3 },
    
    // AFRICA - sample countries  
    { name: "Egypt", code: "EG", x: 50.4, y: 45.9 },
    { name: "Nigeria", code: "NG", x: 44.9, y: 61.5 },
    { name: "South Africa", code: "ZA", x: 51.3, y: 96.2 },
    
    // OCEANIA
    { name: "Australia", code: "AU", x: 79.6, y: 84.0 },
    { name: "New Zealand", code: "NZ", x: 89.5, y: 90.3 }
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
        
        {/* Invisible clickable areas positioned over country names in the image */}
        <div className="absolute inset-0 w-full h-full">
          {countries.map((country) => (
            <div
              key={country.code}
              className="absolute cursor-pointer border-2 border-red-500 bg-red-200 bg-opacity-30"
              style={{
                left: `${country.x}%`,
                top: `${country.y}%`,
                width: '80px',
                height: '25px',
              }}
              onClick={() => handleCountryClick(country)}
              title={country.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};