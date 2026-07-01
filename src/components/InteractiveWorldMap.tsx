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

  // ALL COUNTRIES positioned EXACTLY on their actual locations on the world map
  const countries: Country[] = [
    // NORTH AMERICA - Labels positioned ON the actual countries
    { name: "Canada", code: "CA", x: 22, y: 30, width: 6, height: 1 },
    { name: "United States\nof America", code: "US", x: 20, y: 45, width: 10, height: 2 },
    { name: "Mexico", code: "MX", x: 20, y: 52, width: 5, height: 1 },
    { name: "Greenland\n(Denmark)", code: "GL", x: 35, y: 18, width: 7, height: 2 },
    { name: "Alaska\n(USA)", code: "AK", x: 8, y: 32, width: 4, height: 2 },
    
    // SOUTH AMERICA - On actual country locations
    { name: "Brazil", code: "BR", x: 40, y: 60, width: 4, height: 1 },
    { name: "Argentina", code: "AR", x: 35, y: 75, width: 6, height: 1 },
    { name: "Chile", code: "CL", x: 32, y: 72, width: 4, height: 1 },
    { name: "Peru", code: "PE", x: 32, y: 65, width: 4, height: 1 },
    { name: "Colombia", code: "CO", x: 32, y: 58, width: 6, height: 1 },
    { name: "Venezuela", code: "VE", x: 38, y: 58, width: 6, height: 1 },
    { name: "Ecuador", code: "EC", x: 30, y: 62, width: 5, height: 1 },
    { name: "Bolivia", code: "BO", x: 36, y: 68, width: 5, height: 1 },
    
    // EUROPE - On actual country locations
    { name: "Russia", code: "RU", x: 75, y: 28, width: 5, height: 1 },
    { name: "Norway", code: "NO", x: 50, y: 20, width: 5, height: 1 },
    { name: "Finland", code: "FI", x: 55, y: 22, width: 5, height: 1 },
    { name: "Sweden", code: "SE", x: 52, y: 24, width: 5, height: 1 },
    { name: "Iceland", code: "IS", x: 42, y: 25, width: 5, height: 1 },
    { name: "United Kingdom", code: "GB", x: 46, y: 32, width: 7, height: 1 },
    { name: "Ireland", code: "IE", x: 43, y: 32, width: 5, height: 1 },
    { name: "France", code: "FR", x: 48, y: 38, width: 5, height: 1 },
    { name: "Spain", code: "ES", x: 46, y: 42, width: 4, height: 1 },
    { name: "Portugal", code: "PT", x: 43, y: 42, width: 6, height: 1 },
    { name: "Italy", code: "IT", x: 52, y: 44, width: 4, height: 1 },
    { name: "Germany", code: "DE", x: 52, y: 34, width: 6, height: 1 },
    { name: "Poland", code: "PL", x: 55, y: 34, width: 5, height: 1 },
    { name: "Ukraine", code: "UA", x: 58, y: 36, width: 6, height: 1 },
    { name: "Turkey", code: "TR", x: 58, y: 42, width: 5, height: 1 },
    { name: "Greece", code: "GR", x: 54, y: 46, width: 5, height: 1 },
    
    // ASIA - On actual country locations
    { name: "China", code: "CN", x: 75, y: 42, width: 4, height: 1 },
    { name: "India", code: "IN", x: 72, y: 52, width: 4, height: 1 },
    { name: "Japan", code: "JP", x: 85, y: 42, width: 4, height: 1 },
    { name: "Mongolia", code: "MN", x: 75, y: 36, width: 6, height: 1 },
    { name: "Kazakhstan", code: "KZ", x: 68, y: 36, width: 8, height: 1 },
    { name: "Saudi Arabia", code: "SA", x: 62, y: 52, width: 7, height: 1 },
    { name: "Iran", code: "IR", x: 64, y: 46, width: 4, height: 1 },
    { name: "Pakistan", code: "PK", x: 68, y: 48, width: 6, height: 1 },
    { name: "Afghanistan", code: "AF", x: 66, y: 44, width: 8, height: 1 },
    { name: "Thailand", code: "TH", x: 76, y: 54, width: 6, height: 1 },
    { name: "Vietnam", code: "VN", x: 78, y: 52, width: 6, height: 1 },
    { name: "Malaysia", code: "MY", x: 77, y: 58, width: 6, height: 1 },
    { name: "Indonesia", code: "ID", x: 78, y: 62, width: 7, height: 1 },
    { name: "Philippines", code: "PH", x: 82, y: 54, width: 8, height: 1 },
    { name: "South Korea", code: "KR", x: 82, y: 42, width: 6, height: 1 },
    { name: "North Korea", code: "KP", x: 81, y: 40, width: 6, height: 1 },
    
    // AFRICA - On actual country locations  
    { name: "Algeria", code: "DZ", x: 48, y: 48, width: 5, height: 1 },
    { name: "Libya", code: "LY", x: 54, y: 48, width: 4, height: 1 },
    { name: "Egypt", code: "EG", x: 58, y: 48, width: 4, height: 1 },
    { name: "Sudan", code: "SD", x: 58, y: 54, width: 4, height: 1 },
    { name: "Ethiopia", code: "ET", x: 62, y: 58, width: 6, height: 1 },
    { name: "Kenya", code: "KE", x: 61, y: 62, width: 4, height: 1 },
    { name: "Somalia", code: "SO", x: 64, y: 62, width: 6, height: 1 },
    { name: "Nigeria", code: "NG", x: 50, y: 58, width: 5, height: 1 },
    { name: "South Africa", code: "ZA", x: 56, y: 76, width: 6, height: 1 },
    { name: "Madagascar", code: "MG", x: 66, y: 72, width: 7, height: 1 },
    { name: "Morocco", code: "MA", x: 44, y: 46, width: 6, height: 1 },
    { name: "Mali", code: "ML", x: 46, y: 54, width: 4, height: 1 },
    { name: "Niger", code: "NE", x: 50, y: 54, width: 4, height: 1 },
    { name: "Chad", code: "TD", x: 54, y: 56, width: 4, height: 1 },
    { name: "Angola", code: "AO", x: 52, y: 70, width: 5, height: 1 },
    
    // OCEANIA - On actual country locations
    { name: "Australia", code: "AU", x: 82, y: 72, width: 6, height: 1 },
    { name: "New Zealand", code: "NZ", x: 90, y: 80, width: 6, height: 1 },
    { name: "Papua New Guinea", code: "PG", x: 84, y: 62, width: 8, height: 1 }
  ];

  const handleCountryClick = (country: Country) => {
    if (onCountryClick) {
      onCountryClick(country.code);
    } else {
      navigate(`/countries/${country.code.toLowerCase()}`);
    }
  };

  return (
    <div className="relative w-full h-screen bg-blue-400 overflow-hidden">
      {/* Full Screen World Map */}
      <div className="relative w-full h-full">
        {/* World Map Image - Clean map without grid lines */}
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg" 
          alt="World Map"
          className="w-full h-full object-cover"
        />
        
        {/* Country Labels - Positioned on actual countries */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          {countries.map((country) => {
            return (
              <div
                key={country.code}
                className="absolute text-base font-black text-white cursor-pointer pointer-events-auto select-none"
                style={{
                  left: `${country.x}%`,
                  top: `${country.y}%`,
                  fontSize: '16px',
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: '900',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.7)',
                  lineHeight: '1.2',
                  whiteSpace: 'pre-line',
                  letterSpacing: '0.5px'
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
  );
};