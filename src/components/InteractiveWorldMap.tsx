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
  const navigate = useNavigate();

  // ALL COUNTRIES positioned EXACTLY where text labels appear on reference image
  const countries: Country[] = [
    // NORTH AMERICA - Exact positions matching reference image
    { name: "Canada", code: "CA", x: 16, y: 18, width: 6, height: 1 },
    { name: "United States\nof America", code: "US", x: 14, y: 32, width: 10, height: 2 },
    { name: "Mexico", code: "MX", x: 15, y: 46, width: 5, height: 1 },
    { name: "Greenland\n(Denmark)", code: "GL", x: 30, y: 10, width: 7, height: 2 },
    { name: "Alaska\n(USA)", code: "AK", x: 3, y: 18, width: 4, height: 2 },
    
    // SOUTH AMERICA - Exact positions from reference
    { name: "Brazil", code: "BR", x: 34, y: 62, width: 4, height: 1 },
    { name: "Argentina", code: "AR", x: 28, y: 78, width: 6, height: 1 },
    { name: "Chile", code: "CL", x: 25, y: 75, width: 4, height: 1 },
    { name: "Peru", code: "PE", x: 26, y: 68, width: 4, height: 1 },
    { name: "Colombia", code: "CO", x: 26, y: 58, width: 6, height: 1 },
    { name: "Venezuela", code: "VE", x: 30, y: 56, width: 6, height: 1 },
    { name: "Ecuador", code: "EC", x: 24, y: 62, width: 5, height: 1 },
    { name: "Bolivia", code: "BO", x: 30, y: 70, width: 5, height: 1 },
    { name: "Paraguay", code: "PY", x: 32, y: 72, width: 6, height: 1 },
    { name: "Uruguay", code: "UY", x: 34, y: 76, width: 5, height: 1 },
    
    // EUROPE - Exact positions from reference
    { name: "Russia", code: "RU", x: 68, y: 18, width: 5, height: 1 },
    { name: "Norway", code: "NO", x: 48, y: 12, width: 5, height: 1 },
    { name: "Finland", code: "FI", x: 52, y: 14, width: 5, height: 1 },
    { name: "Sweden", code: "SE", x: 50, y: 16, width: 5, height: 1 },
    { name: "Iceland", code: "IS", x: 38, y: 20, width: 5, height: 1 },
    { name: "United Kingdom", code: "GB", x: 42, y: 26, width: 7, height: 1 },
    { name: "Ireland", code: "IE", x: 38, y: 26, width: 5, height: 1 },
    { name: "France", code: "FR", x: 44, y: 32, width: 5, height: 1 },
    { name: "Spain", code: "ES", x: 42, y: 38, width: 4, height: 1 },
    { name: "Portugal", code: "PT", x: 38, y: 38, width: 6, height: 1 },
    { name: "Italy", code: "IT", x: 48, y: 38, width: 4, height: 1 },
    { name: "Germany", code: "DE", x: 48, y: 28, width: 6, height: 1 },
    { name: "Poland", code: "PL", x: 52, y: 26, width: 5, height: 1 },
    { name: "Ukraine", code: "UA", x: 56, y: 28, width: 6, height: 1 },
    { name: "Turkey", code: "TR", x: 56, y: 40, width: 5, height: 1 },
    { name: "Greece", code: "GR", x: 50, y: 42, width: 5, height: 1 },
    
    // ASIA - Exact positions from reference
    { name: "China", code: "CN", x: 76, y: 36, width: 4, height: 1 },
    { name: "India", code: "IN", x: 70, y: 50, width: 4, height: 1 },
    { name: "Japan", code: "JP", x: 84, y: 36, width: 4, height: 1 },
    { name: "Mongolia", code: "MN", x: 74, y: 28, width: 6, height: 1 },
    { name: "Kazakhstan", code: "KZ", x: 66, y: 30, width: 8, height: 1 },
    { name: "Saudi Arabia", code: "SA", x: 60, y: 48, width: 7, height: 1 },
    { name: "Iran", code: "IR", x: 60, y: 44, width: 4, height: 1 },
    { name: "Pakistan", code: "PK", x: 66, y: 46, width: 6, height: 1 },
    { name: "Afghanistan", code: "AF", x: 64, y: 42, width: 8, height: 1 },
    { name: "Thailand", code: "TH", x: 74, y: 52, width: 6, height: 1 },
    { name: "Vietnam", code: "VN", x: 76, y: 50, width: 6, height: 1 },
    { name: "Malaysia", code: "MY", x: 76, y: 56, width: 6, height: 1 },
    { name: "Indonesia", code: "ID", x: 78, y: 62, width: 7, height: 1 },
    { name: "Philippines", code: "PH", x: 80, y: 52, width: 8, height: 1 },
    { name: "South Korea", code: "KR", x: 80, y: 38, width: 6, height: 1 },
    { name: "North Korea", code: "KP", x: 79, y: 36, width: 6, height: 1 },
    
    // AFRICA - Exact positions from reference
    { name: "Algeria", code: "DZ", x: 46, y: 48, width: 5, height: 1 },
    { name: "Libya", code: "LY", x: 52, y: 46, width: 4, height: 1 },
    { name: "Egypt", code: "EG", x: 56, y: 46, width: 4, height: 1 },
    { name: "Sudan", code: "SD", x: 58, y: 52, width: 4, height: 1 },
    { name: "Ethiopia", code: "ET", x: 60, y: 56, width: 6, height: 1 },
    { name: "Kenya", code: "KE", x: 59, y: 60, width: 4, height: 1 },
    { name: "Somalia", code: "SO", x: 62, y: 60, width: 6, height: 1 },
    { name: "Nigeria", code: "NG", x: 48, y: 56, width: 5, height: 1 },
    { name: "South Africa", code: "ZA", x: 54, y: 78, width: 6, height: 1 },
    { name: "Madagascar", code: "MG", x: 66, y: 72, width: 7, height: 1 },
    { name: "Morocco", code: "MA", x: 42, y: 46, width: 6, height: 1 },
    { name: "Mali", code: "ML", x: 44, y: 52, width: 4, height: 1 },
    { name: "Niger", code: "NE", x: 48, y: 52, width: 4, height: 1 },
    { name: "Chad", code: "TD", x: 52, y: 54, width: 4, height: 1 },
    { name: "Angola", code: "AO", x: 50, y: 70, width: 5, height: 1 },
    
    // OCEANIA - Exact positions from reference
    { name: "Australia", code: "AU", x: 80, y: 74, width: 6, height: 1 },
    { name: "New Zealand", code: "NZ", x: 88, y: 82, width: 6, height: 1 },
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
      {/* Clean World Map with Permanent Labels */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="relative w-full h-full max-w-6xl">
          {/* World Map Image - Using a better matching world map */}
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg" 
            alt="World Map"
            className="w-full h-full object-contain"
            style={{ 
              minWidth: '100%', 
              minHeight: '100%'
            }}
          />
          
          {/* Country Labels - Permanent, positioned exactly like reference image */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {countries.map((country) => {
              return (
                <div
                  key={country.code}
                  className="absolute text-xs font-semibold text-white cursor-pointer pointer-events-auto select-none"
                  style={{
                    left: `${country.x}%`,
                    top: `${country.y}%`,
                    fontSize: '11px',
                    fontFamily: 'Arial, sans-serif',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    lineHeight: '1.1',
                    whiteSpace: 'pre-line'
                  }}
                  onClick={() => handleCountryClick(country)}
                  title={`Click to view ${country.name}`}
                >
                  {country.name}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};