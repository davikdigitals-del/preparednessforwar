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

  // Country hotspots with accurate positioning based on the map image (percentages from top-left)
  const countries: Country[] = [
    // North America - Better positioned
    { name: "United States", code: "US", x: 15, y: 40, width: 18, height: 12 },
    { name: "Canada", code: "CA", x: 12, y: 25, width: 22, height: 18 },
    { name: "Mexico", code: "MX", x: 15, y: 52, width: 10, height: 8 },
    { name: "Greenland", code: "GL", x: 25, y: 15, width: 8, height: 12 },
    { name: "Cuba", code: "CU", x: 24, y: 50, width: 4, height: 2 },
    { name: "Jamaica", code: "JM", x: 25, y: 52, width: 1, height: 1 },
    { name: "Haiti", code: "HT", x: 26, y: 51, width: 1, height: 1 },
    { name: "Dominican Republic", code: "DO", x: 27, y: 51, width: 2, height: 1 },
    
    // South America - Better positioned
    { name: "Brazil", code: "BR", x: 32, y: 62, width: 12, height: 15 },
    { name: "Argentina", code: "AR", x: 30, y: 75, width: 8, height: 15 },
    { name: "Chile", code: "CL", x: 28, y: 72, width: 3, height: 18 },
    { name: "Peru", code: "PE", x: 26, y: 67, width: 5, height: 8 },
    { name: "Colombia", code: "CO", x: 26, y: 58, width: 5, height: 7 },
    { name: "Venezuela", code: "VE", x: 30, y: 56, width: 4, height: 4 },
    { name: "Ecuador", code: "EC", x: 24, y: 64, width: 3, height: 3 },
    { name: "Bolivia", code: "BO", x: 28, y: 70, width: 4, height: 5 },
    { name: "Paraguay", code: "PY", x: 32, y: 74, width: 3, height: 3 },
    { name: "Uruguay", code: "UY", x: 34, y: 78, width: 2, height: 2 },
    
    // Europe - Better positioned
    { name: "United Kingdom", code: "GB", x: 48, y: 30, width: 3, height: 4 },
    { name: "Ireland", code: "IE", x: 45, y: 31, width: 2, height: 2 },
    { name: "Iceland", code: "IS", x: 42, y: 23, width: 3, height: 2 },
    { name: "Norway", code: "NO", x: 50, y: 18, width: 4, height: 12 },
    { name: "Sweden", code: "SE", x: 53, y: 20, width: 3, height: 8 },
    { name: "Finland", code: "FI", x: 56, y: 20, width: 4, height: 8 },
    { name: "Denmark", code: "DK", x: 52, y: 29, width: 2, height: 2 },
    { name: "Netherlands", code: "NL", x: 51, y: 31, width: 2, height: 2 },
    { name: "Belgium", code: "BE", x: 50, y: 32, width: 2, height: 1 },
    { name: "France", code: "FR", x: 49, y: 33, width: 4, height: 4 },
    { name: "Spain", code: "ES", x: 46, y: 37, width: 5, height: 4 },
    { name: "Portugal", code: "PT", x: 44, y: 37, width: 2, height: 4 },
    { name: "Italy", code: "IT", x: 51, y: 37, width: 3, height: 6 },
    { name: "Switzerland", code: "CH", x: 51, y: 34, width: 2, height: 2 },
    { name: "Austria", code: "AT", x: 53, y: 34, width: 2, height: 2 },
    { name: "Germany", code: "DE", x: 52, y: 31, width: 3, height: 4 },
    { name: "Poland", code: "PL", x: 54, y: 31, width: 3, height: 3 },
    { name: "Czech Republic", code: "CZ", x: 53, y: 33, width: 2, height: 1 },
    { name: "Hungary", code: "HU", x: 54, y: 35, width: 2, height: 2 },
    { name: "Romania", code: "RO", x: 56, y: 35, width: 3, height: 3 },
    { name: "Bulgaria", code: "BG", x: 56, y: 38, width: 2, height: 2 },
    { name: "Greece", code: "GR", x: 55, y: 40, width: 3, height: 3 },
    { name: "Ukraine", code: "UA", x: 56, y: 30, width: 8, height: 4 },
    { name: "Russia", code: "RU", x: 58, y: 22, width: 32, height: 18 },
    
    // Asia - Better positioned
    { name: "China", code: "CN", x: 70, y: 35, width: 12, height: 10 },
    { name: "India", code: "IN", x: 68, y: 45, width: 8, height: 10 },
    { name: "Japan", code: "JP", x: 85, y: 37, width: 4, height: 8 },
    { name: "South Korea", code: "KR", x: 83, y: 38, width: 2, height: 2 },
    { name: "North Korea", code: "KP", x: 82, y: 36, width: 2, height: 2 },
    { name: "Mongolia", code: "MN", x: 72, y: 32, width: 8, height: 4 },
    { name: "Kazakhstan", code: "KZ", x: 62, y: 32, width: 12, height: 6 },
    { name: "Pakistan", code: "PK", x: 65, y: 42, width: 4, height: 6 },
    { name: "Afghanistan", code: "AF", x: 62, y: 40, width: 4, height: 4 },
    { name: "Iran", code: "IR", x: 60, y: 40, width: 6, height: 5 },
    { name: "Bangladesh", code: "BD", x: 74, y: 48, width: 2, height: 2 },
    { name: "Myanmar", code: "MM", x: 74, y: 48, width: 3, height: 6 },
    { name: "Thailand", code: "TH", x: 76, y: 52, width: 3, height: 6 },
    { name: "Vietnam", code: "VN", x: 78, y: 50, width: 3, height: 8 },
    { name: "Laos", code: "LA", x: 77, y: 50, width: 2, height: 3 },
    { name: "Cambodia", code: "KH", x: 78, y: 53, width: 2, height: 2 },
    { name: "Malaysia", code: "MY", x: 77, y: 57, width: 4, height: 4 },
    { name: "Indonesia", code: "ID", x: 78, y: 61, width: 12, height: 6 },
    { name: "Philippines", code: "PH", x: 83, y: 52, width: 4, height: 8 },
    { name: "Singapore", code: "SG", x: 78, y: 59, width: 1, height: 1 },
    { name: "Sri Lanka", code: "LK", x: 70, y: 54, width: 1, height: 2 },
    { name: "Nepal", code: "NP", x: 72, y: 45, width: 2, height: 1 },
    { name: "Bhutan", code: "BT", x: 74, y: 45, width: 1, height: 1 },
    
    // Middle East - Better positioned
    { name: "Saudi Arabia", code: "SA", x: 59, y: 46, width: 6, height: 6 },
    { name: "Turkey", code: "TR", x: 57, y: 39, width: 6, height: 3 },
    { name: "Iraq", code: "IQ", x: 58, y: 42, width: 3, height: 4 },
    { name: "Syria", code: "SY", x: 57, y: 41, width: 2, height: 2 },
    { name: "Jordan", code: "JO", x: 57, y: 44, width: 2, height: 2 },
    { name: "Israel", code: "IL", x: 57, y: 43, width: 1, height: 2 },
    { name: "Lebanon", code: "LB", x: 57, y: 41, width: 1, height: 1 },
    { name: "Kuwait", code: "KW", x: 60, y: 44, width: 1, height: 1 },
    { name: "UAE", code: "AE", x: 63, y: 48, width: 2, height: 2 },
    { name: "Qatar", code: "QA", x: 62, y: 47, width: 1, height: 1 },
    { name: "Bahrain", code: "BH", x: 61, y: 47, width: 1, height: 1 },
    { name: "Oman", code: "OM", x: 64, y: 49, width: 3, height: 4 },
    { name: "Yemen", code: "YE", x: 61, y: 52, width: 3, height: 3 },
    
    // Africa - Better positioned
    { name: "Egypt", code: "EG", x: 55, y: 47, width: 4, height: 6 },
    { name: "Libya", code: "LY", x: 52, y: 46, width: 6, height: 6 },
    { name: "Algeria", code: "DZ", x: 48, y: 44, width: 7, height: 8 },
    { name: "Morocco", code: "MA", x: 44, y: 42, width: 5, height: 5 },
    { name: "Tunisia", code: "TN", x: 52, y: 43, width: 2, height: 3 },
    { name: "Sudan", code: "SD", x: 55, y: 53, width: 5, height: 8 },
    { name: "Ethiopia", code: "ET", x: 58, y: 56, width: 4, height: 6 },
    { name: "Somalia", code: "SO", x: 60, y: 57, width: 3, height: 6 },
    { name: "Kenya", code: "KE", x: 57, y: 60, width: 3, height: 4 },
    { name: "Tanzania", code: "TZ", x: 56, y: 62, width: 4, height: 4 },
    { name: "Uganda", code: "UG", x: 55, y: 60, width: 2, height: 2 },
    { name: "Rwanda", code: "RW", x: 55, y: 62, width: 1, height: 1 },
    { name: "Burundi", code: "BI", x: 55, y: 63, width: 1, height: 1 },
    { name: "Nigeria", code: "NG", x: 49, y: 55, width: 4, height: 4 },
    { name: "Ghana", code: "GH", x: 46, y: 56, width: 2, height: 2 },
    { name: "Ivory Coast", code: "CI", x: 44, y: 56, width: 2, height: 2 },
    { name: "Mali", code: "ML", x: 45, y: 50, width: 5, height: 6 },
    { name: "Niger", code: "NE", x: 49, y: 52, width: 4, height: 4 },
    { name: "Chad", code: "TD", x: 52, y: 52, width: 4, height: 6 },
    { name: "Central African Republic", code: "CF", x: 52, y: 58, width: 4, height: 3 },
    { name: "Cameroon", code: "CM", x: 51, y: 57, width: 2, height: 4 },
    { name: "Democratic Republic of Congo", code: "CD", x: 52, y: 61, width: 6, height: 8 },
    { name: "Angola", code: "AO", x: 51, y: 65, width: 4, height: 8 },
    { name: "Zambia", code: "ZM", x: 55, y: 68, width: 3, height: 4 },
    { name: "Zimbabwe", code: "ZW", x: 55, y: 71, width: 3, height: 3 },
    { name: "Botswana", code: "BW", x: 54, y: 73, width: 3, height: 3 },
    { name: "Namibia", code: "NA", x: 51, y: 72, width: 4, height: 6 },
    { name: "South Africa", code: "ZA", x: 53, y: 75, width: 6, height: 6 },
    { name: "Madagascar", code: "MG", x: 61, y: 72, width: 2, height: 6 },
    { name: "Mozambique", code: "MZ", x: 58, y: 68, width: 3, height: 8 },
    
    // Oceania - Better positioned
    { name: "Australia", code: "AU", x: 80, y: 72, width: 14, height: 10 },
    { name: "New Zealand", code: "NZ", x: 90, y: 78, width: 3, height: 5 },
    { name: "Papua New Guinea", code: "PG", x: 85, y: 63, width: 4, height: 3 },
    { name: "Fiji", code: "FJ", x: 92, y: 69, width: 1, height: 1 }
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