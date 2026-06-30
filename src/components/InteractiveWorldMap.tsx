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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  // Country hotspots positioned exactly where the TEXT LABELS appear on the reference map
  const countries: Country[] = [
    // NORTH AMERICA - Text label positions
    { name: "Canada", code: "CA", x: 18, y: 28, width: 8, height: 3 },
    { name: "United States", code: "US", x: 16, y: 42, width: 12, height: 3 },
    { name: "Mexico", code: "MX", x: 16, y: 58, width: 6, height: 2 },
    { name: "Greenland", code: "GL", x: 38, y: 18, width: 8, height: 3 },
    { name: "Alaska", code: "AK", x: 4, y: 32, width: 5, height: 2 },
    
    // CENTRAL AMERICA & CARIBBEAN - Text positions
    { name: "Cuba", code: "CU", x: 26, y: 52, width: 4, height: 1 },
    { name: "Jamaica", code: "JM", x: 27, y: 54, width: 3, height: 1 },
    { name: "Haiti", code: "HT", x: 29, y: 53, width: 3, height: 1 },
    { name: "Dominican Republic", code: "DO", x: 30, y: 53, width: 5, height: 1 },
    
    // SOUTH AMERICA - Text label positions
    { name: "Colombia", code: "CO", x: 26, y: 58, width: 6, height: 2 },
    { name: "Venezuela", code: "VE", x: 30, y: 56, width: 6, height: 2 },
    { name: "Guyana", code: "GY", x: 35, y: 57, width: 4, height: 1 },
    { name: "Suriname", code: "SR", x: 37, y: 57, width: 5, height: 1 },
    { name: "French Guiana", code: "GF", x: 38, y: 58, width: 6, height: 1 },
    { name: "Brazil", code: "BR", x: 36, y: 70, width: 6, height: 2 },
    { name: "Ecuador", code: "EC", x: 24, y: 65, width: 5, height: 1 },
    { name: "Peru", code: "PE", x: 26, y: 72, width: 4, height: 1 },
    { name: "Bolivia", code: "BO", x: 30, y: 76, width: 4, height: 1 },
    { name: "Paraguay", code: "PY", x: 34, y: 78, width: 5, height: 1 },
    { name: "Uruguay", code: "UY", x: 36, y: 82, width: 5, height: 1 },
    { name: "Argentina", code: "AR", x: 32, y: 85, width: 6, height: 2 },
    { name: "Chile", code: "CL", x: 28, y: 82, width: 4, height: 1 },
    
    // EUROPE - Text label positions on reference map
    { name: "Iceland", code: "IS", x: 40, y: 24, width: 5, height: 1 },
    { name: "Norway", code: "NO", x: 50, y: 20, width: 5, height: 1 },
    { name: "Sweden", code: "SE", x: 53, y: 22, width: 5, height: 1 },
    { name: "Finland", code: "FI", x: 57, y: 20, width: 5, height: 1 },
    { name: "Denmark", code: "DK", x: 51, y: 28, width: 5, height: 1 },
    { name: "United Kingdom", code: "GB", x: 45, y: 30, width: 6, height: 1 },
    { name: "Ireland", code: "IE", x: 42, y: 30, width: 4, height: 1 },
    { name: "Netherlands", code: "NL", x: 50, y: 30, width: 6, height: 1 },
    { name: "Belgium", code: "BE", x: 49, y: 32, width: 5, height: 1 },
    { name: "France", code: "FR", x: 47, y: 36, width: 5, height: 1 },
    { name: "Spain", code: "ES", x: 44, y: 42, width: 5, height: 1 },
    { name: "Portugal", code: "PT", x: 41, y: 42, width: 5, height: 1 },
    { name: "Italy", code: "IT", x: 51, y: 42, width: 4, height: 1 },
    { name: "Switzerland", code: "CH", x: 50, y: 36, width: 6, height: 1 },
    { name: "Austria", code: "AT", x: 52, y: 36, width: 5, height: 1 },
    { name: "Germany", code: "DE", x: 51, y: 33, width: 6, height: 1 },
    { name: "Poland", code: "PL", x: 54, y: 32, width: 5, height: 1 },
    { name: "Czech Republic", code: "CZ", x: 52, y: 34, width: 7, height: 1 },
    { name: "Hungary", code: "HU", x: 53, y: 37, width: 5, height: 1 },
    { name: "Romania", code: "RO", x: 56, y: 37, width: 6, height: 1 },
    { name: "Bulgaria", code: "BG", x: 55, y: 40, width: 6, height: 1 },
    { name: "Greece", code: "GR", x: 54, y: 43, width: 5, height: 1 },
    { name: "Ukraine", code: "UA", x: 58, y: 32, width: 6, height: 1 },
    { name: "Turkey", code: "TR", x: 60, y: 42, width: 5, height: 1 },
    { name: "Russia", code: "RU", x: 72, y: 24, width: 6, height: 2 },
    
    // ASIA - Text label positions on reference map
    { name: "Kazakhstan", code: "KZ", x: 66, y: 30, width: 8, height: 1 },
    { name: "China", code: "CN", x: 78, y: 38, width: 5, height: 2 },
    { name: "Mongolia", code: "MN", x: 75, y: 30, width: 6, height: 1 },
    { name: "India", code: "IN", x: 72, y: 52, width: 4, height: 1 },
    { name: "Pakistan", code: "PK", x: 66, y: 46, width: 6, height: 1 },
    { name: "Afghanistan", code: "AF", x: 64, y: 40, width: 7, height: 1 },
    { name: "Iran", code: "IR", x: 60, y: 42, width: 4, height: 1 },
    { name: "Nepal", code: "NP", x: 73, y: 46, width: 4, height: 1 },
    { name: "Bhutan", code: "BT", x: 75, y: 46, width: 4, height: 1 },
    { name: "Bangladesh", code: "BD", x: 75, y: 48, width: 7, height: 1 },
    { name: "Myanmar", code: "MM", x: 76, y: 50, width: 6, height: 1 },
    { name: "Thailand", code: "TH", x: 77, y: 54, width: 6, height: 1 },
    { name: "Vietnam", code: "VN", x: 80, y: 52, width: 5, height: 1 },
    { name: "Laos", code: "LA", x: 77, y: 50, width: 4, height: 1 },
    { name: "Cambodia", code: "KH", x: 79, y: 54, width: 6, height: 1 },
    { name: "Malaysia", code: "MY", x: 78, y: 58, width: 6, height: 1 },
    { name: "Indonesia", code: "ID", x: 82, y: 66, width: 7, height: 1 },
    { name: "Philippines", code: "PH", x: 84, y: 56, width: 7, height: 1 },
    { name: "Singapore", code: "SG", x: 79, y: 60, width: 6, height: 1 },
    { name: "Sri Lanka", code: "LK", x: 71, y: 56, width: 6, height: 1 },
    { name: "Japan", code: "JP", x: 86, y: 40, width: 5, height: 1 },
    { name: "South Korea", code: "KR", x: 83, y: 40, width: 6, height: 1 },
    { name: "North Korea", code: "KP", x: 82, y: 38, width: 6, height: 1 },
    
    // MIDDLE EAST - Text label positions on reference map
    { name: "Saudi Arabia", code: "SA", x: 60, y: 50, width: 8, height: 1 },
    { name: "Iraq", code: "IQ", x: 57, y: 44, width: 4, height: 1 },
    { name: "Syria", code: "SY", x: 57, y: 40, width: 4, height: 1 },
    { name: "Jordan", code: "JO", x: 57, y: 46, width: 4, height: 1 },
    { name: "Israel", code: "IL", x: 56, y: 44, width: 4, height: 1 },
    { name: "Lebanon", code: "LB", x: 56, y: 40, width: 5, height: 1 },
    { name: "Kuwait", code: "KW", x: 60, y: 46, width: 4, height: 1 },
    { name: "UAE", code: "AE", x: 62, y: 50, width: 3, height: 1 },
    { name: "Qatar", code: "QA", x: 61, y: 48, width: 4, height: 1 },
    { name: "Bahrain", code: "BH", x: 61, y: 48, width: 5, height: 1 },
    { name: "Oman", code: "OM", x: 63, y: 52, width: 4, height: 1 },
    { name: "Yemen", code: "YE", x: 60, y: 54, width: 4, height: 1 },
    
    // AFRICA - Text label positions on reference map  
    { name: "Egypt", code: "EG", x: 56, y: 50, width: 4, height: 1 },
    { name: "Libya", code: "LY", x: 52, y: 48, width: 4, height: 1 },
    { name: "Algeria", code: "DZ", x: 48, y: 48, width: 5, height: 1 },
    { name: "Morocco", code: "MA", x: 43, y: 46, width: 6, height: 1 },
    { name: "Tunisia", code: "TN", x: 51, y: 44, width: 5, height: 1 },
    { name: "Sudan", code: "SD", x: 56, y: 56, width: 5, height: 1 },
    { name: "Ethiopia", code: "ET", x: 59, y: 58, width: 6, height: 1 },
    { name: "Somalia", code: "SO", x: 61, y: 60, width: 6, height: 1 },
    { name: "Kenya", code: "KE", x: 58, y: 62, width: 4, height: 1 },
    { name: "Tanzania", code: "TZ", x: 57, y: 66, width: 6, height: 1 },
    { name: "Uganda", code: "UG", x: 56, y: 62, width: 5, height: 1 },
    { name: "Rwanda", code: "RW", x: 56, y: 64, width: 5, height: 1 },
    { name: "Burundi", code: "BI", x: 56, y: 65, width: 5, height: 1 },
    { name: "Nigeria", code: "NG", x: 50, y: 58, width: 5, height: 1 },
    { name: "Ghana", code: "GH", x: 47, y: 58, width: 4, height: 1 },
    { name: "Ivory Coast", code: "CI", x: 45, y: 58, width: 6, height: 1 },
    { name: "Mali", code: "ML", x: 45, y: 54, width: 4, height: 1 },
    { name: "Niger", code: "NE", x: 49, y: 54, width: 4, height: 1 },
    { name: "Chad", code: "TD", x: 52, y: 56, width: 4, height: 1 },
    { name: "Central African Republic", code: "CF", x: 53, y: 60, width: 10, height: 1 },
    { name: "Cameroon", code: "CM", x: 52, y: 62, width: 6, height: 1 },
    { name: "Democratic Republic of Congo", code: "CD", x: 54, y: 68, width: 12, height: 1 },
    { name: "Angola", code: "AO", x: 51, y: 72, width: 5, height: 1 },
    { name: "Zambia", code: "ZM", x: 56, y: 72, width: 5, height: 1 },
    { name: "Zimbabwe", code: "ZW", x: 57, y: 75, width: 7, height: 1 },
    { name: "Botswana", code: "BW", x: 55, y: 76, width: 6, height: 1 },
    { name: "Namibia", code: "NA", x: 52, y: 76, width: 6, height: 1 },
    { name: "South Africa", code: "ZA", x: 55, y: 80, width: 7, height: 1 },
    { name: "Madagascar", code: "MG", x: 62, y: 78, width: 8, height: 1 },
    { name: "Mozambique", code: "MZ", x: 59, y: 76, width: 9, height: 1 },
    
    // OCEANIA - Text label positions on reference map
    { name: "Australia", code: "AU", x: 83, y: 78, width: 7, height: 1 },
    { name: "New Zealand", code: "NZ", x: 90, y: 84, width: 7, height: 1 },
    { name: "Papua New Guinea", code: "PG", x: 85, y: 64, width: 9, height: 1 },
    { name: "Fiji", code: "FJ", x: 92, y: 70, width: 3, height: 1 }
  ];

  const handleCountryClick = (country: Country) => {
    if (onCountryClick) {
      onCountryClick(country.code);
    } else {
      navigate(`/countries/${country.code.toLowerCase()}`);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-sky-100 to-sky-200 overflow-hidden">
      {/* Clean World Map with Interactive Overlays */}
      <div 
        className="relative w-full h-full flex items-center justify-center"
        onMouseMove={handleMouseMove}
      >
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
          
          {/* Country Hotspots - Custom Shapes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {countries.map((country) => {
              // Generate approximate country shapes based on their geography
              let pathData = "";
              
              switch(country.code) {
                case "US":
                  pathData = "M150,180 L320,180 L320,220 L280,240 L200,240 L150,220 Z";
                  break;
                case "CA":
                  pathData = "M100,120 L350,120 L350,180 L300,160 L200,160 L100,140 Z";
                  break;
                case "BR":
                  pathData = "M350,300 L420,300 L430,360 L400,380 L350,370 L340,330 Z";
                  break;
                case "RU":
                  pathData = "M550,100 L850,100 L850,200 L700,220 L550,180 Z";
                  break;
                case "CN":
                  pathData = "M700,175 L820,175 L820,225 L750,240 L700,220 Z";
                  break;
                case "AU":
                  pathData = "M800,350 L920,350 L920,390 L880,400 L800,390 Z";
                  break;
                default:
                  // Use elliptical shapes for other countries
                  const centerX = (country.x + country.width/2) * 10;
                  const centerY = (country.y + country.height/2) * 5;
                  const radiusX = country.width * 5;
                  const radiusY = country.height * 2.5;
                  pathData = `M${centerX-radiusX},${centerY} 
                             C${centerX-radiusX},${centerY-radiusY} ${centerX+radiusX},${centerY-radiusY} ${centerX+radiusX},${centerY}
                             C${centerX+radiusX},${centerY+radiusY} ${centerX-radiusX},${centerY+radiusY} ${centerX-radiusX},${centerY} Z`;
              }
              
              return (
                <path
                  key={country.code}
                  d={pathData}
                  fill="transparent"
                  stroke="transparent"
                  strokeWidth="2"
                  className="cursor-pointer pointer-events-auto"
                  onMouseEnter={() => setHoveredCountry(country)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => handleCountryClick(country)}
                />
              );
            })}
          </svg>
        </div>
      </div>
      
      {/* Country Tooltip - Follows Mouse */}
      {hoveredCountry && (
        <div 
          className="fixed bg-black bg-opacity-80 text-white px-3 py-1 rounded shadow-lg pointer-events-none z-50"
          style={{
            left: mousePosition.x - 50,
            top: mousePosition.y - 40,
            transform: 'translateX(-50%)'
          }}
        >
          {hoveredCountry.name}
        </div>
      )}
    </div>
  );
};