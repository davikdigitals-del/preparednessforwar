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

  // Countries positioned over the text labels in the world map image
  const countries: Country[] = [
    // NORTH AMERICA - Adjusted for your map image
    { name: "Canada", code: "CA", x: 15, y: 27 },
    { name: "United States of America", code: "US", x: 12, y: 38 },
    { name: "Mexico", code: "MX", x: 14, y: 48 },
    { name: "Greenland", code: "GL", x: 30, y: 12 },
    { name: "Alaska", code: "AK", x: 4, y: 20 },
    
    // SOUTH AMERICA - Adjusted positions
    { name: "Brazil", code: "BR", x: 38, y: 58 },
    { name: "Argentina", code: "AR", x: 32, y: 75 },
    { name: "Chile", code: "CL", x: 29, y: 71 },
    { name: "Peru", code: "PE", x: 30, y: 65 },
    { name: "Colombia", code: "CO", x: 30, y: 56 },
    { name: "Venezuela", code: "VE", x: 33, y: 54 },
    { name: "Ecuador", code: "EC", x: 28, y: 61 },
    { name: "Bolivia", code: "BO", x: 34, y: 68 },
    
    // EUROPE - Better positioned
    { name: "Russia", code: "RU", x: 65, y: 25 },
    { name: "Norway", code: "NO", x: 47, y: 21 },
    { name: "Finland", code: "FI", x: 53, y: 23 },
    { name: "Sweden", code: "SE", x: 49, y: 25 },
    { name: "Iceland", code: "IS", x: 40, y: 25 },
    { name: "United Kingdom", code: "GB", x: 43, y: 33 },
    { name: "Ireland", code: "IE", x: 40, y: 33 },
    { name: "France", code: "FR", x: 46, y: 38 },
    { name: "Spain", code: "ES", x: 43, y: 43 },
    { name: "Portugal", code: "PT", x: 40, y: 43 },
    { name: "Italy", code: "IT", x: 49, y: 43 },
    { name: "Germany", code: "DE", x: 49, y: 35 },
    { name: "Poland", code: "PL", x: 52, y: 35 },
    { name: "Ukraine", code: "UA", x: 55, y: 37 },
    { name: "Turkey", code: "TR", x: 56, y: 42 },
    { name: "Greece", code: "GR", x: 51, y: 45 },
    
    // ASIA - Adjusted positions
    { name: "China", code: "CN", x: 69, y: 41 },
    { name: "India", code: "IN", x: 66, y: 51 },
    { name: "Japan", code: "JP", x: 80, y: 41 },
    { name: "Mongolia", code: "MN", x: 70, y: 35 },
    { name: "Kazakhstan", code: "KZ", x: 62, y: 35 },
    { name: "Saudi Arabia", code: "SA", x: 58, y: 49 },
    { name: "Iran", code: "IR", x: 60, y: 45 },
    { name: "Pakistan", code: "PK", x: 64, y: 47 },
    { name: "Afghanistan", code: "AF", x: 62, y: 43 },
    { name: "Thailand", code: "TH", x: 71, y: 53 },
    { name: "Vietnam", code: "VN", x: 73, y: 51 },
    { name: "Malaysia", code: "MY", x: 72, y: 56 },
    { name: "Indonesia", code: "ID", x: 74, y: 60 },
    { name: "Philippines", code: "PH", x: 77, y: 53 },
    { name: "South Korea", code: "KR", x: 78, y: 41 },
    { name: "North Korea", code: "KP", x: 77, y: 39 },
    
    // AFRICA - Better aligned
    { name: "Algeria", code: "DZ", x: 45, y: 45 },
    { name: "Libya", code: "LY", x: 50, y: 45 },
    { name: "Egypt", code: "EG", x: 54, y: 45 },
    { name: "Sudan", code: "SD", x: 54, y: 51 },
    { name: "Ethiopia", code: "ET", x: 58, y: 55 },
    { name: "Kenya", code: "KE", x: 58, y: 59 },
    { name: "Somalia", code: "SO", x: 60, y: 59 },
    { name: "Nigeria", code: "NG", x: 46, y: 55 },
    { name: "South Africa", code: "ZA", x: 51, y: 71 },
    { name: "Madagascar", code: "MG", x: 61, y: 68 },
    { name: "Morocco", code: "MA", x: 41, y: 43 },
    { name: "Mali", code: "ML", x: 43, y: 51 },
    { name: "Niger", code: "NE", x: 46, y: 51 },
    { name: "Chad", code: "TD", x: 50, y: 53 },
    { name: "Angola", code: "AO", x: 49, y: 65 },
    
    // OCEANIA - Final adjustments
    { name: "Australia", code: "AU", x: 75, y: 68 },
    { name: "New Zealand", code: "NZ", x: 84, y: 78 },
    { name: "Papua New Guinea", code: "PG", x: 79, y: 60 }
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