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

  // Country hotspots with accurate positioning based on the map image
  const countries: Country[] = [
    // North America
    { name: "United States", code: "US", x: 15, y: 35, width: 20, height: 15 },
    { name: "Canada", code: "CA", x: 10, y: 20, width: 25, height: 20 },
    { name: "Mexico", code: "MX", x: 12, y: 50, width: 12, height: 8 },
    { name: "Guatemala", code: "GT", x: 18, y: 55, width: 3, height: 3 },
    { name: "Cuba", code: "CU", x: 25, y: 48, width: 4, height: 2 },
    
    // South America
    { name: "Brazil", code: "BR", x: 35, y: 60, width: 12, height: 15 },
    { name: "Argentina", code: "AR", x: 32, y: 75, width: 8, height: 12 },
    { name: "Chile", code: "CL", x: 30, y: 70, width: 3, height: 20 },
    { name: "Peru", code: "PE", x: 28, y: 65, width: 5, height: 8 },
    { name: "Colombia", code: "CO", x: 28, y: 58, width: 5, height: 7 },
    { name: "Venezuela", code: "VE", x: 32, y: 55, width: 5, height: 5 },
    { name: "Ecuador", code: "EC", x: 26, y: 62, width: 3, height: 3 },
    { name: "Bolivia", code: "BO", x: 30, y: 68, width: 4, height: 5 },
    { name: "Paraguay", code: "PY", x: 34, y: 73, width: 3, height: 3 },
    { name: "Uruguay", code: "UY", x: 36, y: 78, width: 2, height: 2 },
    
    // Europe
    { name: "United Kingdom", code: "GB", x: 48, y: 28, width: 3, height: 4 },
    { name: "Ireland", code: "IE", x: 46, y: 29, width: 2, height: 2 },
    { name: "France", code: "FR", x: 50, y: 32, width: 4, height: 4 },
    { name: "Germany", code: "DE", x: 52, y: 30, width: 3, height: 4 },
    { name: "Spain", code: "ES", x: 47, y: 36, width: 5, height: 4 },
    { name: "Portugal", code: "PT", x: 46, y: 36, width: 2, height: 4 },
    { name: "Italy", code: "IT", x: 52, y: 36, width: 3, height: 6 },
    { name: "Switzerland", code: "CH", x: 51, y: 33, width: 2, height: 2 },
    { name: "Austria", code: "AT", x: 53, y: 33, width: 2, height: 2 },
    { name: "Netherlands", code: "NL", x: 51, y: 30, width: 2, height: 2 },
    { name: "Belgium", code: "BE", x: 50, y: 31, width: 2, height: 2 },
    { name: "Poland", code: "PL", x: 54, y: 30, width: 3, height: 3 },
    { name: "Czech Republic", code: "CZ", x: 53, y: 31, width: 2, height: 2 },
    { name: "Hungary", code: "HU", x: 54, y: 33, width: 2, height: 2 },
    { name: "Romania", code: "RO", x: 56, y: 33, width: 3, height: 3 },
    { name: "Bulgaria", code: "BG", x: 56, y: 36, width: 2, height: 2 },
    { name: "Greece", code: "GR", x: 55, y: 38, width: 3, height: 3 },
    { name: "Serbia", code: "RS", x: 54, y: 35, width: 2, height: 2 },
    { name: "Croatia", code: "HR", x: 53, y: 34, width: 2, height: 2 },
    { name: "Ukraine", code: "UA", x: 56, y: 28, width: 6, height: 4 },
    { name: "Belarus", code: "BY", x: 56, y: 26, width: 3, height: 3 },
    { name: "Lithuania", code: "LT", x: 55, y: 25, width: 2, height: 2 },
    { name: "Latvia", code: "LV", x: 55, y: 24, width: 2, height: 2 },
    { name: "Estonia", code: "EE", x: 55, y: 23, width: 2, height: 2 },
    { name: "Finland", code: "FI", x: 56, y: 20, width: 3, height: 5 },
    { name: "Sweden", code: "SE", x: 53, y: 18, width: 3, height: 8 },
    { name: "Norway", code: "NO", x: 50, y: 16, width: 4, height: 10 },
    { name: "Denmark", code: "DK", x: 52, y: 27, width: 2, height: 2 },
    { name: "Iceland", code: "IS", x: 42, y: 22, width: 2, height: 2 },
    { name: "Russia", code: "RU", x: 55, y: 20, width: 30, height: 20 },
    
    // Asia
    { name: "China", code: "CN", x: 70, y: 35, width: 12, height: 10 },
    { name: "India", code: "IN", x: 68, y: 45, width: 8, height: 8 },
    { name: "Japan", code: "JP", x: 85, y: 38, width: 3, height: 6 },
    { name: "South Korea", code: "KR", x: 82, y: 38, width: 2, height: 2 },
    { name: "North Korea", code: "KP", x: 82, y: 36, width: 2, height: 2 },
    { name: "Mongolia", code: "MN", x: 72, y: 32, width: 8, height: 4 },
    { name: "Kazakhstan", code: "KZ", x: 62, y: 32, width: 10, height: 6 },
    { name: "Pakistan", code: "PK", x: 65, y: 42, width: 4, height: 5 },
    { name: "Afghanistan", code: "AF", x: 62, y: 40, width: 4, height: 4 },
    { name: "Bangladesh", code: "BD", x: 74, y: 48, width: 2, height: 2 },
    { name: "Myanmar", code: "MM", x: 75, y: 48, width: 3, height: 5 },
    { name: "Thailand", code: "TH", x: 76, y: 52, width: 3, height: 5 },
    { name: "Vietnam", code: "VN", x: 78, y: 50, width: 2, height: 6 },
    { name: "Laos", code: "LA", x: 77, y: 50, width: 2, height: 3 },
    { name: "Cambodia", code: "KH", x: 78, y: 53, width: 2, height: 2 },
    { name: "Malaysia", code: "MY", x: 77, y: 56, width: 4, height: 4 },
    { name: "Indonesia", code: "ID", x: 78, y: 60, width: 10, height: 6 },
    { name: "Philippines", code: "PH", x: 83, y: 52, width: 3, height: 6 },
    { name: "Singapore", code: "SG", x: 78, y: 59, width: 1, height: 1 },
    { name: "Sri Lanka", code: "LK", x: 70, y: 53, width: 1, height: 2 },
    { name: "Nepal", code: "NP", x: 72, y: 44, width: 2, height: 1 },
    { name: "Bhutan", code: "BT", x: 74, y: 44, width: 1, height: 1 },
    
    // Central Asia
    { name: "Uzbekistan", code: "UZ", x: 62, y: 36, width: 4, height: 3 },
    { name: "Turkmenistan", code: "TM", x: 60, y: 38, width: 4, height: 3 },
    { name: "Tajikistan", code: "TJ", x: 65, y: 38, width: 2, height: 2 },
    { name: "Kyrgyzstan", code: "KG", x: 67, y: 36, width: 2, height: 2 },
    
    // Middle East
    { name: "Saudi Arabia", code: "SA", x: 60, y: 45, width: 6, height: 6 },
    { name: "Iran", code: "IR", x: 62, y: 40, width: 5, height: 5 },
    { name: "Turkey", code: "TR", x: 55, y: 36, width: 4, height: 3 },
    { name: "Iraq", code: "IQ", x: 58, y: 41, width: 3, height: 4 },
    { name: "Syria", code: "SY", x: 57, y: 39, width: 2, height: 2 },
    { name: "Jordan", code: "JO", x: 57, y: 42, width: 2, height: 2 },
    { name: "Israel", code: "IL", x: 57, y: 43, width: 1, height: 2 },
    { name: "Lebanon", code: "LB", x: 57, y: 40, width: 1, height: 1 },
    { name: "Kuwait", code: "KW", x: 60, y: 44, width: 1, height: 1 },
    { name: "UAE", code: "AE", x: 63, y: 48, width: 2, height: 1 },
    { name: "Qatar", code: "QA", x: 62, y: 47, width: 1, height: 1 },
    { name: "Bahrain", code: "BH", x: 61, y: 47, width: 1, height: 1 },
    { name: "Oman", code: "OM", x: 64, y: 48, width: 2, height: 3 },
    { name: "Yemen", code: "YE", x: 61, y: 52, width: 3, height: 3 },
    
    // Africa
    { name: "Egypt", code: "EG", x: 55, y: 48, width: 4, height: 4 },
    { name: "Libya", code: "LY", x: 52, y: 46, width: 5, height: 4 },
    { name: "Algeria", code: "DZ", x: 48, y: 44, width: 6, height: 6 },
    { name: "Morocco", code: "MA", x: 45, y: 42, width: 4, height: 4 },
    { name: "Tunisia", code: "TN", x: 52, y: 42, width: 2, height: 2 },
    { name: "Sudan", code: "SD", x: 55, y: 52, width: 4, height: 6 },
    { name: "Ethiopia", code: "ET", x: 58, y: 54, width: 4, height: 4 },
    { name: "Somalia", code: "SO", x: 61, y: 56, width: 3, height: 5 },
    { name: "Kenya", code: "KE", x: 57, y: 58, width: 3, height: 4 },
    { name: "Tanzania", code: "TZ", x: 56, y: 60, width: 3, height: 4 },
    { name: "Uganda", code: "UG", x: 55, y: 58, width: 2, height: 2 },
    { name: "Rwanda", code: "RW", x: 55, y: 60, width: 1, height: 1 },
    { name: "Burundi", code: "BI", x: 55, y: 61, width: 1, height: 1 },
    { name: "Nigeria", code: "NG", x: 50, y: 52, width: 4, height: 4 },
    { name: "Ghana", code: "GH", x: 48, y: 54, width: 2, height: 2 },
    { name: "Ivory Coast", code: "CI", x: 46, y: 54, width: 2, height: 2 },
    { name: "Mali", code: "ML", x: 46, y: 50, width: 4, height: 4 },
    { name: "Niger", code: "NE", x: 49, y: 50, width: 3, height: 3 },
    { name: "Chad", code: "TD", x: 52, y: 50, width: 3, height: 4 },
    { name: "Central African Republic", code: "CF", x: 52, y: 54, width: 3, height: 2 },
    { name: "Cameroon", code: "CM", x: 51, y: 55, width: 2, height: 3 },
    { name: "Democratic Republic of Congo", code: "CD", x: 52, y: 58, width: 4, height: 6 },
    { name: "Angola", code: "AO", x: 51, y: 64, width: 4, height: 6 },
    { name: "Zambia", code: "ZM", x: 54, y: 66, width: 3, height: 3 },
    { name: "Zimbabwe", code: "ZW", x: 55, y: 68, width: 2, height: 2 },
    { name: "Botswana", code: "BW", x: 54, y: 70, width: 2, height: 2 },
    { name: "Namibia", code: "NA", x: 52, y: 68, width: 3, height: 4 },
    { name: "South Africa", code: "ZA", x: 54, y: 70, width: 6, height: 6 },
    { name: "Mozambique", code: "MZ", x: 57, y: 68, width: 2, height: 6 },
    { name: "Madagascar", code: "MG", x: 61, y: 70, width: 2, height: 5 },
    
    // Oceania
    { name: "Australia", code: "AU", x: 80, y: 70, width: 12, height: 8 },
    { name: "New Zealand", code: "NZ", x: 90, y: 78, width: 3, height: 4 },
    { name: "Papua New Guinea", code: "PG", x: 85, y: 62, width: 4, height: 3 },
    { name: "Fiji", code: "FJ", x: 92, y: 68, width: 1, height: 1 }
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