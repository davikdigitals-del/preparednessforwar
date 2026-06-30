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
    // NORTH AMERICA - Exact text positions from reference image
    { name: "Canada", code: "CA", x: 20, y: 18, width: 8, height: 2 },
    { name: "United States\nof America", code: "US", x: 18, y: 32, width: 12, height: 3 },
    { name: "Mexico", code: "MX", x: 20, y: 44, width: 6, height: 2 },
    { name: "Greenland\n(Denmark)", code: "GL", x: 30, y: 8, width: 8, height: 3 },
    { name: "Alaska\n(USA)", code: "AK", x: 8, y: 16, width: 5, height: 2 },
    
    // CENTRAL AMERICA - Exact positions
    { name: "Guatemala", code: "GT", x: 18, y: 64, width: 7, height: 1 },
    { name: "Belize", code: "BZ", x: 19, y: 62, width: 5, height: 1 },
    { name: "Honduras", code: "HN", x: 20, y: 65, width: 7, height: 1 },
    { name: "El Salvador", code: "SV", x: 19, y: 66, width: 7, height: 1 },
    { name: "Nicaragua", code: "NI", x: 21, y: 67, width: 8, height: 1 },
    { name: "Costa Rica", code: "CR", x: 22, y: 69, width: 7, height: 1 },
    { name: "Panama", code: "PA", x: 23, y: 71, width: 6, height: 1 },
    
    // CARIBBEAN - Exact positions from map
    { name: "Cuba", code: "CU", x: 26, y: 52, width: 4, height: 1 },
    { name: "Jamaica", code: "JM", x: 26, y: 55, width: 6, height: 1 },
    { name: "Haiti", code: "HT", x: 28, y: 54, width: 4, height: 1 },
    { name: "Dominican Republic", code: "DO", x: 29, y: 54, width: 10, height: 1 },
    { name: "Puerto Rico", code: "PR", x: 31, y: 55, width: 7, height: 1 },
    { name: "Bahamas", code: "BS", x: 28, y: 50, width: 7, height: 1 },
    { name: "Trinidad and Tobago", code: "TT", x: 33, y: 57, width: 9, height: 1 },
    { name: "Barbados", code: "BB", x: 34, y: 58, width: 7, height: 1 },
    { name: "Saint Lucia", code: "LC", x: 33, y: 58, width: 7, height: 1 },
    { name: "Grenada", code: "GD", x: 33, y: 59, width: 7, height: 1 },
    { name: "Saint Vincent", code: "VC", x: 33, y: 59, width: 8, height: 1 },
    { name: "Dominica", code: "DM", x: 33, y: 57, width: 7, height: 1 },
    { name: "Antigua", code: "AG", x: 32, y: 56, width: 7, height: 1 },
    
    // SOUTH AMERICA - Exact text positions from reference image
    { name: "Colombia", code: "CO", x: 28, y: 56, width: 6, height: 1 },
    { name: "Venezuela", code: "VE", x: 32, y: 54, width: 6, height: 1 },
    { name: "Guyana", code: "GY", x: 36, y: 54, width: 5, height: 1 },
    { name: "Suriname", code: "SR", x: 38, y: 54, width: 5, height: 1 },
    { name: "French Guiana", code: "GF", x: 40, y: 54, width: 5, height: 1 },
    { name: "Brazil", code: "BR", x: 38, y: 68, width: 5, height: 2 },
    { name: "Ecuador", code: "EC", x: 26, y: 62, width: 5, height: 1 },
    { name: "Peru", code: "PE", x: 28, y: 70, width: 4, height: 1 },
    { name: "Bolivia", code: "BO", x: 32, y: 72, width: 5, height: 1 },
    { name: "Paraguay", code: "PY", x: 36, y: 76, width: 5, height: 1 },
    { name: "Uruguay", code: "UY", x: 38, y: 80, width: 5, height: 1 },
    { name: "Argentina", code: "AR", x: 34, y: 84, width: 6, height: 1 },
    { name: "Chile", code: "CL", x: 30, y: 78, width: 4, height: 1 },
    
    // EUROPE - Exact text positions from reference image
    { name: "Iceland", code: "IS", x: 42, y: 20, width: 5, height: 1 },
    { name: "Norway", code: "NO", x: 50, y: 14, width: 5, height: 1 },
    { name: "Sweden", code: "SE", x: 52, y: 16, width: 5, height: 1 },
    { name: "Finland", code: "FI", x: 55, y: 14, width: 5, height: 1 },
    { name: "Russia", code: "RU", x: 70, y: 18, width: 6, height: 2 },
    { name: "Denmark", code: "DK", x: 51, y: 24, width: 5, height: 1 },
    { name: "United Kingdom", code: "GB", x: 46, y: 26, width: 7, height: 1 },
    { name: "Ireland", code: "IE", x: 43, y: 26, width: 5, height: 1 },
    { name: "Netherlands", code: "NL", x: 51, y: 26, width: 7, height: 1 },
    { name: "Belgium", code: "BE", x: 50, y: 28, width: 5, height: 1 },
    { name: "Luxembourg", code: "LU", x: 51, y: 30, width: 6, height: 1 },
    { name: "France", code: "FR", x: 48, y: 32, width: 5, height: 1 },
    { name: "Spain", code: "ES", x: 46, y: 38, width: 4, height: 1 },
    { name: "Portugal", code: "PT", x: 43, y: 38, width: 5, height: 1 },
    { name: "Italy", code: "IT", x: 52, y: 38, width: 4, height: 1 },
    { name: "Switzerland", code: "CH", x: 51, y: 32, width: 7, height: 1 },
    { name: "Austria", code: "AT", x: 53, y: 32, width: 5, height: 1 },
    { name: "Germany", code: "DE", x: 52, y: 28, width: 6, height: 1 },
    { name: "Poland", code: "PL", x: 55, y: 26, width: 5, height: 1 },
    { name: "Czech Republic", code: "CZ", x: 53, y: 30, width: 7, height: 1 },
    { name: "Slovakia", code: "SK", x: 55, y: 30, width: 5, height: 1 },
    { name: "Hungary", code: "HU", x: 55, y: 32, width: 5, height: 1 },
    { name: "Slovenia", code: "SI", x: 53, y: 34, width: 5, height: 1 },
    { name: "Croatia", code: "HR", x: 53, y: 36, width: 5, height: 1 },
    { name: "Bosnia and\nHerzegovina", code: "BA", x: 54, y: 37, width: 6, height: 2 },
    { name: "Serbia", code: "RS", x: 56, y: 36, width: 4, height: 1 },
    { name: "Montenegro", code: "ME", x: 55, y: 38, width: 6, height: 1 },
    { name: "Albania", code: "AL", x: 55, y: 40, width: 5, height: 1 },
    { name: "Macedonia", code: "MK", x: 56, y: 38, width: 6, height: 1 },
    { name: "Romania", code: "RO", x: 57, y: 33, width: 5, height: 1 },
    { name: "Bulgaria", code: "BG", x: 57, y: 36, width: 5, height: 1 },
    { name: "Moldova", code: "MD", x: 58, y: 31, width: 5, height: 1 },
    { name: "Ukraine", code: "UA", x: 60, y: 28, width: 5, height: 1 },
    { name: "Belarus", code: "BY", x: 58, y: 24, width: 5, height: 1 },
    { name: "Lithuania", code: "LT", x: 56, y: 22, width: 6, height: 1 },
    { name: "Latvia", code: "LV", x: 56, y: 20, width: 5, height: 1 },
    { name: "Estonia", code: "EE", x: 56, y: 18, width: 5, height: 1 },
    { name: "Greece", code: "GR", x: 55, y: 42, width: 5, height: 1 },
    { name: "Turkey", code: "TR", x: 60, y: 40, width: 5, height: 1 },
    { name: "Cyprus", code: "CY", x: 60, y: 42, width: 4, height: 1 },
    
    // ASIA - Exact text positions from reference image
    { name: "Kazakhstan", code: "KZ", x: 68, y: 30, width: 7, height: 1 },
    { name: "Mongolia", code: "MN", x: 76, y: 28, width: 6, height: 1 },
    { name: "China", code: "CN", x: 78, y: 38, width: 5, height: 2 },
    { name: "India", code: "IN", x: 72, y: 52, width: 4, height: 1 },
    { name: "Pakistan", code: "PK", x: 68, y: 48, width: 5, height: 1 },
    { name: "Afghanistan", code: "AF", x: 66, y: 42, width: 7, height: 1 },
    { name: "Iran", code: "IR", x: 62, y: 44, width: 4, height: 1 },
    { name: "Saudi Arabia", code: "SA", x: 62, y: 50, width: 7, height: 1 },
    { name: "Iraq", code: "IQ", x: 60, y: 46, width: 4, height: 1 },
    { name: "Syria", code: "SY", x: 59, y: 42, width: 4, height: 1 },
    { name: "Jordan", code: "JO", x: 59, y: 46, width: 4, height: 1 },
    { name: "Israel", code: "IL", x: 58, y: 46, width: 4, height: 1 },
    { name: "Lebanon", code: "LB", x: 58, y: 42, width: 5, height: 1 },
    { name: "Yemen", code: "YE", x: 62, y: 54, width: 4, height: 1 },
    { name: "Japan", code: "JP", x: 85, y: 38, width: 4, height: 1 },
    { name: "South Korea", code: "KR", x: 82, y: 38, width: 6, height: 1 },
    { name: "North Korea", code: "KP", x: 81, y: 36, width: 6, height: 1 },
    { name: "Thailand", code: "TH", x: 76, y: 54, width: 5, height: 1 },
    { name: "Vietnam", code: "VN", x: 78, y: 52, width: 5, height: 1 },
    { name: "Malaysia", code: "MY", x: 78, y: 58, width: 5, height: 1 },
    { name: "Indonesia", code: "ID", x: 80, y: 64, width: 7, height: 1 },
    { name: "Philippines", code: "PH", x: 82, y: 54, width: 7, height: 1 },
    
    // AFRICA - Exact text positions from reference image
    { name: "Morocco", code: "MA", x: 44, y: 46, width: 5, height: 1 },
    { name: "Algeria", code: "DZ", x: 48, y: 50, width: 5, height: 1 },
    { name: "Libya", code: "LY", x: 54, y: 48, width: 4, height: 1 },
    { name: "Egypt", code: "EG", x: 58, y: 48, width: 4, height: 1 },
    { name: "Sudan", code: "SD", x: 60, y: 54, width: 4, height: 1 },
    { name: "Ethiopia", code: "ET", x: 62, y: 58, width: 5, height: 1 },
    { name: "Somalia", code: "SO", x: 64, y: 62, width: 5, height: 1 },
    { name: "Kenya", code: "KE", x: 61, y: 62, width: 4, height: 1 },
    { name: "Tanzania", code: "TZ", x: 60, y: 66, width: 5, height: 1 },
    { name: "Madagascar", code: "MG", x: 68, y: 74, width: 6, height: 1 },
    { name: "South Africa", code: "ZA", x: 56, y: 80, width: 6, height: 1 },
    { name: "Nigeria", code: "NG", x: 50, y: 58, width: 5, height: 1 },
    { name: "Mali", code: "ML", x: 46, y: 54, width: 4, height: 1 },
    { name: "Niger", code: "NE", x: 50, y: 54, width: 4, height: 1 },
    { name: "Chad", code: "TD", x: 54, y: 56, width: 4, height: 1 },
    { name: "Democratic Republic\nof the Congo", code: "CD", x: 56, y: 68, width: 8, height: 2 },
    { name: "Angola", code: "AO", x: 52, y: 72, width: 5, height: 1 },
    
    // OCEANIA - Exact text positions from reference image
    { name: "Australia", code: "AU", x: 82, y: 76, width: 6, height: 1 },
    { name: "New Zealand", code: "NZ", x: 90, y: 84, width: 6, height: 1 },
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
    <div className="relative w-full h-screen bg-gradient-to-b from-sky-100 to-sky-200 overflow-hidden">
      {/* Clean World Map with Permanent Labels */}
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
          
          {/* Country Labels - Permanent, positioned exactly like reference image */}
          <div className="absolute inset-0 w-full h-full pointer-events-none">
            {countries.map((country) => {
              return (
                <div
                  key={country.code}
                  className="absolute text-xs font-semibold text-gray-800 cursor-pointer pointer-events-auto select-none"
                  style={{
                    left: `${country.x}%`,
                    top: `${country.y}%`,
                    fontSize: '11px',
                    fontFamily: 'Arial, sans-serif',
                    textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
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