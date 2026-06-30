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
    // NORTH AMERICA - Exact positions from reference map
    { name: "Canada", code: "CA", x: 15, y: 20, width: 8, height: 2 },
    { name: "United States\nof America", code: "US", x: 12, y: 35, width: 12, height: 3 },
    { name: "Mexico", code: "MX", x: 12, y: 50, width: 6, height: 2 },
    { name: "Greenland\n(Denmark)", code: "GL", x: 28, y: 12, width: 8, height: 3 },
    { name: "Alaska\n(USA)", code: "AK", x: 2, y: 20, width: 5, height: 2 },
    
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
    
    // SOUTH AMERICA - Exact positions from reference image
    { name: "Colombia", code: "CO", x: 25, y: 58, width: 6, height: 1 },
    { name: "Venezuela", code: "VE", x: 30, y: 55, width: 6, height: 1 },
    { name: "Guyana", code: "GY", x: 35, y: 55, width: 5, height: 1 },
    { name: "Suriname", code: "SR", x: 37, y: 55, width: 5, height: 1 },
    { name: "French Guiana", code: "GF", x: 39, y: 55, width: 5, height: 1 },
    { name: "Brazil", code: "BR", x: 35, y: 65, width: 5, height: 2 },
    { name: "Ecuador", code: "EC", x: 23, y: 62, width: 5, height: 1 },
    { name: "Peru", code: "PE", x: 25, y: 70, width: 4, height: 1 },
    { name: "Bolivia", code: "BO", x: 30, y: 72, width: 5, height: 1 },
    { name: "Paraguay", code: "PY", x: 34, y: 75, width: 5, height: 1 },
    { name: "Uruguay", code: "UY", x: 36, y: 78, width: 5, height: 1 },
    { name: "Argentina", code: "AR", x: 32, y: 82, width: 6, height: 1 },
    { name: "Chile", code: "CL", x: 28, y: 78, width: 4, height: 1 },
    
    // EUROPE - Exact positions from reference image
    { name: "Iceland", code: "IS", x: 40, y: 22, width: 5, height: 1 },
    { name: "Norway", code: "NO", x: 48, y: 15, width: 5, height: 1 },
    { name: "Sweden", code: "SE", x: 50, y: 18, width: 5, height: 1 },
    { name: "Finland", code: "FI", x: 53, y: 16, width: 5, height: 1 },
    { name: "Russia", code: "RU", x: 68, y: 20, width: 6, height: 2 },
    { name: "Denmark", code: "DK", x: 49, y: 25, width: 5, height: 1 },
    { name: "United Kingdom", code: "GB", x: 44, y: 28, width: 7, height: 1 },
    { name: "Ireland", code: "IE", x: 41, y: 28, width: 5, height: 1 },
    { name: "Netherlands", code: "NL", x: 49, y: 28, width: 7, height: 1 },
    { name: "Belgium", code: "BE", x: 48, y: 30, width: 5, height: 1 },
    { name: "Luxembourg", code: "LU", x: 49, y: 32, width: 6, height: 1 },
    { name: "France", code: "FR", x: 46, y: 34, width: 5, height: 1 },
    { name: "Spain", code: "ES", x: 44, y: 40, width: 4, height: 1 },
    { name: "Portugal", code: "PT", x: 41, y: 40, width: 5, height: 1 },
    { name: "Italy", code: "IT", x: 50, y: 40, width: 4, height: 1 },
    { name: "Switzerland", code: "CH", x: 49, y: 34, width: 7, height: 1 },
    { name: "Austria", code: "AT", x: 51, y: 34, width: 5, height: 1 },
    { name: "Germany", code: "DE", x: 50, y: 30, width: 6, height: 1 },
    { name: "Poland", code: "PL", x: 53, y: 28, width: 5, height: 1 },
    { name: "Czech Republic", code: "CZ", x: 51, y: 32, width: 7, height: 1 },
    { name: "Slovakia", code: "SK", x: 53, y: 32, width: 5, height: 1 },
    { name: "Hungary", code: "HU", x: 53, y: 34, width: 5, height: 1 },
    { name: "Slovenia", code: "SI", x: 51, y: 36, width: 5, height: 1 },
    { name: "Croatia", code: "HR", x: 51, y: 38, width: 5, height: 1 },
    { name: "Bosnia and\nHerzegovina", code: "BA", x: 52, y: 39, width: 6, height: 2 },
    { name: "Serbia", code: "RS", x: 54, y: 38, width: 4, height: 1 },
    { name: "Montenegro", code: "ME", x: 53, y: 40, width: 6, height: 1 },
    { name: "Albania", code: "AL", x: 53, y: 42, width: 5, height: 1 },
    { name: "Macedonia", code: "MK", x: 54, y: 40, width: 6, height: 1 },
    { name: "Romania", code: "RO", x: 55, y: 35, width: 5, height: 1 },
    { name: "Bulgaria", code: "BG", x: 55, y: 38, width: 5, height: 1 },
    { name: "Moldova", code: "MD", x: 56, y: 33, width: 5, height: 1 },
    { name: "Ukraine", code: "UA", x: 58, y: 30, width: 5, height: 1 },
    { name: "Belarus", code: "BY", x: 56, y: 26, width: 5, height: 1 },
    { name: "Lithuania", code: "LT", x: 54, y: 24, width: 6, height: 1 },
    { name: "Latvia", code: "LV", x: 54, y: 22, width: 5, height: 1 },
    { name: "Estonia", code: "EE", x: 54, y: 20, width: 5, height: 1 },
    { name: "Greece", code: "GR", x: 53, y: 44, width: 5, height: 1 },
    { name: "Turkey", code: "TR", x: 58, y: 42, width: 5, height: 1 },
    { name: "Cyprus", code: "CY", x: 58, y: 44, width: 4, height: 1 },
    
    // ASIA - Exact positions from reference image
    { name: "Kazakhstan", code: "KZ", x: 66, y: 32, width: 7, height: 1 },
    { name: "Mongolia", code: "MN", x: 74, y: 30, width: 6, height: 1 },
    { name: "China", code: "CN", x: 76, y: 40, width: 5, height: 2 },
    { name: "India", code: "IN", x: 70, y: 54, width: 4, height: 1 },
    { name: "Pakistan", code: "PK", x: 66, y: 50, width: 5, height: 1 },
    { name: "Afghanistan", code: "AF", x: 64, y: 44, width: 7, height: 1 },
    { name: "Iran", code: "IR", x: 60, y: 46, width: 4, height: 1 },
    { name: "Saudi Arabia", code: "SA", x: 60, y: 52, width: 7, height: 1 },
    { name: "Iraq", code: "IQ", x: 58, y: 48, width: 4, height: 1 },
    { name: "Syria", code: "SY", x: 57, y: 44, width: 4, height: 1 },
    { name: "Jordan", code: "JO", x: 57, y: 48, width: 4, height: 1 },
    { name: "Israel", code: "IL", x: 56, y: 48, width: 4, height: 1 },
    { name: "Lebanon", code: "LB", x: 56, y: 44, width: 5, height: 1 },
    { name: "Yemen", code: "YE", x: 60, y: 56, width: 4, height: 1 },
    { name: "Japan", code: "JP", x: 83, y: 40, width: 4, height: 1 },
    { name: "South Korea", code: "KR", x: 80, y: 40, width: 6, height: 1 },
    { name: "North Korea", code: "KP", x: 79, y: 38, width: 6, height: 1 },
    { name: "Thailand", code: "TH", x: 74, y: 56, width: 5, height: 1 },
    { name: "Vietnam", code: "VN", x: 76, y: 54, width: 5, height: 1 },
    { name: "Malaysia", code: "MY", x: 76, y: 60, width: 5, height: 1 },
    { name: "Indonesia", code: "ID", x: 78, y: 66, width: 7, height: 1 },
    { name: "Philippines", code: "PH", x: 80, y: 56, width: 7, height: 1 },
    
    // AFRICA - Exact positions from reference image
    { name: "Morocco", code: "MA", x: 42, y: 48, width: 5, height: 1 },
    { name: "Algeria", code: "DZ", x: 46, y: 52, width: 5, height: 1 },
    { name: "Libya", code: "LY", x: 52, y: 50, width: 4, height: 1 },
    { name: "Egypt", code: "EG", x: 56, y: 50, width: 4, height: 1 },
    { name: "Sudan", code: "SD", x: 58, y: 56, width: 4, height: 1 },
    { name: "Ethiopia", code: "ET", x: 60, y: 60, width: 5, height: 1 },
    { name: "Somalia", code: "SO", x: 62, y: 64, width: 5, height: 1 },
    { name: "Kenya", code: "KE", x: 59, y: 64, width: 4, height: 1 },
    { name: "Tanzania", code: "TZ", x: 58, y: 68, width: 5, height: 1 },
    { name: "Madagascar", code: "MG", x: 66, y: 76, width: 6, height: 1 },
    { name: "South Africa", code: "ZA", x: 54, y: 82, width: 6, height: 1 },
    { name: "Nigeria", code: "NG", x: 48, y: 60, width: 5, height: 1 },
    { name: "Mali", code: "ML", x: 44, y: 56, width: 4, height: 1 },
    { name: "Niger", code: "NE", x: 48, y: 56, width: 4, height: 1 },
    { name: "Chad", code: "TD", x: 52, y: 58, width: 4, height: 1 },
    { name: "Democratic Republic\nof the Congo", code: "CD", x: 54, y: 70, width: 8, height: 2 },
    { name: "Angola", code: "AO", x: 50, y: 74, width: 5, height: 1 },
    
    // OCEANIA - Exact positions from reference image
    { name: "Australia", code: "AU", x: 80, y: 78, width: 6, height: 1 },
    { name: "New Zealand", code: "NZ", x: 88, y: 86, width: 6, height: 1 },
    { name: "Papua New Guinea", code: "PG", x: 82, y: 64, width: 8, height: 1 }
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