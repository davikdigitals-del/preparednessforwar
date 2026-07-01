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

  // Using your EXACT coordinates as provided, properly converted
  // Converting pixel coordinates to percentages: x/imageWidth*100, y/imageHeight*100
  const countries: Country[] = [
    // From your first data batch - exact coordinates
    { name: "Canada", code: "CA", x: 303/16.38, y: 259/10.24 },
    { name: "United States of America", code: "US", x: 315/16.38, y: 377/10.24 },
    { name: "Mexico", code: "MX", x: 274/16.38, y: 445/10.24 },
    { name: "Greenland", code: "GL", x: 507/16.38, y: 130/10.24 },
    { name: "Brazil", code: "BR", x: 496/16.38, y: 620/10.24 },
    { name: "Argentina", code: "AR", x: 522/16.38, y: 835/10.24 },
    { name: "Chile", code: "CL", x: 435/16.38, y: 735/10.24 },
    { name: "Peru", code: "PE", x: 440/16.38, y: 600/10.24 },
    { name: "Colombia", code: "CO", x: 425/16.38, y: 550/10.24 },
    { name: "Venezuela", code: "VE", x: 500/16.38, y: 490/10.24 },
    { name: "Ecuador", code: "EC", x: 398/16.38, y: 555/10.24 },
    { name: "Bolivia", code: "BO", x: 500/16.38, y: 700/10.24 },
    { name: "Paraguay", code: "PY", x: 540/16.38, y: 750/10.24 },
    { name: "Uruguay", code: "UY", x: 565/16.38, y: 825/10.24 },
    { name: "Guyana", code: "GY", x: 560/16.38, y: 545/10.24 },
    { name: "Suriname", code: "SR", x: 590/16.38, y: 550/10.24 },
    { name: "French Guiana", code: "GF", x: 620/16.38, y: 550/10.24 },
    
    // Europe - sample for testing
    { name: "Iceland", code: "IS", x: 610/16.38, y: 170/10.24 },
    { name: "Ireland", code: "IE", x: 665/16.38, y: 245/10.24 },
    { name: "United Kingdom", code: "GB", x: 700/16.38, y: 240/10.24 },
    { name: "Portugal", code: "PT", x: 690/16.38, y: 340/10.24 },
    { name: "Spain", code: "ES", x: 725/16.38, y: 345/10.24 },
    { name: "France", code: "FR", x: 760/16.38, y: 300/10.24 },
    { name: "Germany", code: "DE", x: 815/16.38, y: 290/10.24 },
    { name: "Norway", code: "NO", x: 815/16.38, y: 170/10.24 },
    { name: "Russia", code: "RU", x: 1120/16.38, y: 170/10.24 }
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
              <span className="text-xs font-bold text-red-900 text-center leading-tight">
                {country.code}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};