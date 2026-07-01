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
    // NORTH AMERICA
    { name: "Canada", code: "CA", x: 18, y: 25 },
    { name: "United States of America", code: "US", x: 15, y: 35 },
    { name: "Mexico", code: "MX", x: 17, y: 45 },
    { name: "Greenland", code: "GL", x: 32, y: 15 },
    { name: "Alaska", code: "AK", x: 6, y: 22 },
    
    // SOUTH AMERICA
    { name: "Brazil", code: "BR", x: 42, y: 55 },
    { name: "Argentina", code: "AR", x: 36, y: 72 },
    { name: "Chile", code: "CL", x: 32, y: 68 },
    { name: "Peru", code: "PE", x: 33, y: 62 },
    { name: "Colombia", code: "CO", x: 33, y: 53 },
    { name: "Venezuela", code: "VE", x: 36, y: 51 },
    { name: "Ecuador", code: "EC", x: 31, y: 58 },
    { name: "Bolivia", code: "BO", x: 37, y: 65 },
    
    // EUROPE
    { name: "Russia", code: "RU", x: 68, y: 22 },
    { name: "Norway", code: "NO", x: 50, y: 18 },
    { name: "Finland", code: "FI", x: 56, y: 20 },
    { name: "Sweden", code: "SE", x: 52, y: 22 },
    { name: "Iceland", code: "IS", x: 43, y: 22 },
    { name: "United Kingdom", code: "GB", x: 46, y: 30 },
    { name: "Ireland", code: "IE", x: 43, y: 30 },
    { name: "France", code: "FR", x: 49, y: 35 },
    { name: "Spain", code: "ES", x: 46, y: 40 },
    { name: "Portugal", code: "PT", x: 43, y: 40 },
    { name: "Italy", code: "IT", x: 52, y: 40 },
    { name: "Germany", code: "DE", x: 52, y: 32 },
    { name: "Poland", code: "PL", x: 55, y: 32 },
    { name: "Ukraine", code: "UA", x: 58, y: 34 },
    { name: "Turkey", code: "TR", x: 59, y: 39 },
    { name: "Greece", code: "GR", x: 54, y: 42 },
    
    // ASIA
    { name: "China", code: "CN", x: 72, y: 38 },
    { name: "India", code: "IN", x: 69, y: 48 },
    { name: "Japan", code: "JP", x: 83, y: 38 },
    { name: "Mongolia", code: "MN", x: 73, y: 32 },
    { name: "Kazakhstan", code: "KZ", x: 65, y: 32 },
    { name: "Saudi Arabia", code: "SA", x: 61, y: 46 },
    { name: "Iran", code: "IR", x: 63, y: 42 },
    { name: "Pakistan", code: "PK", x: 67, y: 44 },
    { name: "Afghanistan", code: "AF", x: 65, y: 40 },
    { name: "Thailand", code: "TH", x: 74, y: 50 },
    { name: "Vietnam", code: "VN", x: 76, y: 48 },
    { name: "Malaysia", code: "MY", x: 75, y: 53 },
    { name: "Indonesia", code: "ID", x: 77, y: 57 },
    { name: "Philippines", code: "PH", x: 80, y: 50 },
    { name: "South Korea", code: "KR", x: 81, y: 38 },
    { name: "North Korea", code: "KP", x: 80, y: 36 },
    
    // AFRICA
    { name: "Algeria", code: "DZ", x: 48, y: 42 },
    { name: "Libya", code: "LY", x: 53, y: 42 },
    { name: "Egypt", code: "EG", x: 57, y: 42 },
    { name: "Sudan", code: "SD", x: 57, y: 48 },
    { name: "Ethiopia", code: "ET", x: 61, y: 52 },
    { name: "Kenya", code: "KE", x: 61, y: 56 },
    { name: "Somalia", code: "SO", x: 63, y: 56 },
    { name: "Nigeria", code: "NG", x: 49, y: 52 },
    { name: "South Africa", code: "ZA", x: 54, y: 68 },
    { name: "Madagascar", code: "MG", x: 64, y: 65 },
    { name: "Morocco", code: "MA", x: 44, y: 40 },
    { name: "Mali", code: "ML", x: 46, y: 48 },
    { name: "Niger", code: "NE", x: 49, y: 48 },
    { name: "Chad", code: "TD", x: 53, y: 50 },
    { name: "Angola", code: "AO", x: 52, y: 62 },
    
    // OCEANIA
    { name: "Australia", code: "AU", x: 78, y: 65 },
    { name: "New Zealand", code: "NZ", x: 87, y: 75 },
    { name: "Papua New Guinea", code: "PG", x: 82, y: 57 }
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
              className="absolute cursor-pointer"
              style={{
                left: `${country.x}%`,
                top: `${country.y}%`,
                width: '60px',
                height: '20px',
              }}
              onClick={() => handleCountryClick(country)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};