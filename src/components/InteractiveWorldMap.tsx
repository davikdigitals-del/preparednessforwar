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

  // ALL COUNTRIES positioned EXACTLY where text labels appear on reference map
  const countries: Country[] = [
    // NORTH AMERICA - Exact text positions from reference map
    { name: "Canada", code: "CA", x: 18, y: 28, width: 6, height: 2 },
    { name: "United States", code: "US", x: 12, y: 48, width: 12, height: 3 },
    { name: "Mexico", code: "MX", x: 14, y: 62, width: 6, height: 2 },
    { name: "Greenland", code: "GL", x: 34, y: 16, width: 8, height: 2 },
    { name: "Alaska", code: "AK", x: 3, y: 28, width: 5, height: 2 },
    
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
    
    // SOUTH AMERICA - Exact text positions
    { name: "Colombia", code: "CO", x: 24, y: 58, width: 7, height: 1 },
    { name: "Venezuela", code: "VE", x: 28, y: 56, width: 8, height: 1 },
    { name: "Guyana", code: "GY", x: 34, y: 57, width: 6, height: 1 },
    { name: "Suriname", code: "SR", x: 36, y: 58, width: 7, height: 1 },
    { name: "French Guiana", code: "GF", x: 37, y: 58, width: 8, height: 1 },
    { name: "Brazil", code: "BR", x: 36, y: 72, width: 5, height: 2 },
    { name: "Ecuador", code: "EC", x: 22, y: 66, width: 6, height: 1 },
    { name: "Peru", code: "PE", x: 24, y: 74, width: 4, height: 1 },
    { name: "Bolivia", code: "BO", x: 28, y: 78, width: 5, height: 1 },
    { name: "Paraguay", code: "PY", x: 32, y: 79, width: 7, height: 1 },
    { name: "Uruguay", code: "UY", x: 34, y: 83, width: 6, height: 1 },
    { name: "Argentina", code: "AR", x: 30, y: 86, width: 7, height: 1 },
    { name: "Chile", code: "CL", x: 26, y: 83, width: 4, height: 1 },
    
    // EUROPE - Exact text positions from reference
    { name: "Iceland", code: "IS", x: 38, y: 24, width: 6, height: 1 },
    { name: "Norway", code: "NO", x: 48, y: 18, width: 6, height: 1 },
    { name: "Sweden", code: "SE", x: 51, y: 20, width: 6, height: 1 },
    { name: "Finland", code: "FI", x: 54, y: 18, width: 6, height: 1 },
    { name: "Denmark", code: "DK", x: 49, y: 28, width: 7, height: 1 },
    { name: "United Kingdom", code: "GB", x: 44, y: 30, width: 9, height: 1 },
    { name: "Ireland", code: "IE", x: 41, y: 30, width: 6, height: 1 },
    { name: "Netherlands", code: "NL", x: 49, y: 30, width: 9, height: 1 },
    { name: "Belgium", code: "BE", x: 48, y: 32, width: 6, height: 1 },
    { name: "Luxembourg", code: "LU", x: 49, y: 34, width: 9, height: 1 },
    { name: "France", code: "FR", x: 46, y: 36, width: 6, height: 1 },
    { name: "Spain", code: "ES", x: 43, y: 42, width: 5, height: 1 },
    { name: "Portugal", code: "PT", x: 40, y: 42, width: 7, height: 1 },
    { name: "Italy", code: "IT", x: 50, y: 42, width: 4, height: 1 },
    { name: "Switzerland", code: "CH", x: 49, y: 36, width: 9, height: 1 },
    { name: "Austria", code: "AT", x: 51, y: 36, width: 6, height: 1 },
    { name: "Germany", code: "DE", x: 50, y: 33, width: 7, height: 1 },
    { name: "Poland", code: "PL", x: 53, y: 32, width: 6, height: 1 },
    { name: "Czech Republic", code: "CZ", x: 51, y: 34, width: 9, height: 1 },
    { name: "Slovakia", code: "SK", x: 53, y: 35, width: 7, height: 1 },
    { name: "Hungary", code: "HU", x: 52, y: 37, width: 6, height: 1 },
    { name: "Slovenia", code: "SI", x: 51, y: 38, width: 7, height: 1 },
    { name: "Croatia", code: "HR", x: 51, y: 39, width: 6, height: 1 },
    { name: "Bosnia", code: "BA", x: 52, y: 40, width: 6, height: 1 },
    { name: "Serbia", code: "RS", x: 53, y: 40, width: 5, height: 1 },
    { name: "Montenegro", code: "ME", x: 53, y: 41, width: 9, height: 1 },
    { name: "Albania", code: "AL", x: 53, y: 42, width: 6, height: 1 },
    { name: "Macedonia", code: "MK", x: 54, y: 41, width: 8, height: 1 },
    { name: "Romania", code: "RO", x: 55, y: 37, width: 7, height: 1 },
    { name: "Bulgaria", code: "BG", x: 55, y: 40, width: 7, height: 1 },
    { name: "Moldova", code: "MD", x: 56, y: 35, width: 6, height: 1 },
    { name: "Ukraine", code: "UA", x: 57, y: 32, width: 6, height: 1 },
    { name: "Belarus", code: "BY", x: 55, y: 26, width: 7, height: 1 },
    { name: "Lithuania", code: "LT", x: 54, y: 25, width: 8, height: 1 },
    { name: "Latvia", code: "LV", x: 54, y: 24, width: 6, height: 1 },
    { name: "Estonia", code: "EE", x: 54, y: 22, width: 7, height: 1 },
    { name: "Greece", code: "GR", x: 53, y: 43, width: 6, height: 1 },
    { name: "Turkey", code: "TR", x: 57, y: 42, width: 6, height: 1 },
    { name: "Cyprus", code: "CY", x: 58, y: 44, width: 6, height: 1 },
    { name: "Malta", code: "MT", x: 50, y: 44, width: 5, height: 1 },
    { name: "Russia", code: "RU", x: 70, y: 22, width: 6, height: 2 },
    
    // ASIA - Exact text positions from reference map
    { name: "Kazakhstan", code: "KZ", x: 64, y: 30, width: 9, height: 1 },
    { name: "Uzbekistan", code: "UZ", x: 62, y: 36, width: 8, height: 1 },
    { name: "Turkmenistan", code: "TM", x: 60, y: 38, width: 10, height: 1 },
    { name: "Kyrgyzstan", code: "KG", x: 66, y: 36, width: 9, height: 1 },
    { name: "Tajikistan", code: "TJ", x: 65, y: 38, width: 8, height: 1 },
    { name: "China", code: "CN", x: 78, y: 36, width: 5, height: 2 },
    { name: "Mongolia", code: "MN", x: 74, y: 30, width: 7, height: 1 },
    { name: "India", code: "IN", x: 70, y: 52, width: 4, height: 1 },
    { name: "Pakistan", code: "PK", x: 65, y: 46, width: 7, height: 1 },
    { name: "Afghanistan", code: "AF", x: 63, y: 40, width: 9, height: 1 },
    { name: "Iran", code: "IR", x: 59, y: 42, width: 4, height: 1 },
    { name: "Nepal", code: "NP", x: 72, y: 46, width: 5, height: 1 },
    { name: "Bhutan", code: "BT", x: 74, y: 46, width: 5, height: 1 },
    { name: "Bangladesh", code: "BD", x: 74, y: 48, width: 9, height: 1 },
    { name: "Myanmar", code: "MM", x: 75, y: 50, width: 7, height: 1 },
    { name: "Thailand", code: "TH", x: 76, y: 54, width: 7, height: 1 },
    { name: "Vietnam", code: "VN", x: 78, y: 52, width: 6, height: 1 },
    { name: "Laos", code: "LA", x: 76, y: 50, width: 4, height: 1 },
    { name: "Cambodia", code: "KH", x: 78, y: 54, width: 7, height: 1 },
    { name: "Malaysia", code: "MY", x: 77, y: 58, width: 7, height: 1 },
    { name: "Singapore", code: "SG", x: 78, y: 60, width: 8, height: 1 },
    { name: "Brunei", code: "BN", x: 81, y: 57, width: 5, height: 1 },
    { name: "Indonesia", code: "ID", x: 80, y: 66, width: 8, height: 1 },
    { name: "East Timor", code: "TL", x: 83, y: 64, width: 7, height: 1 },
    { name: "Philippines", code: "PH", x: 83, y: 56, width: 9, height: 1 },
    { name: "Taiwan", code: "TW", x: 82, y: 48, width: 6, height: 1 },
    { name: "Japan", code: "JP", x: 85, y: 40, width: 5, height: 1 },
    { name: "South Korea", code: "KR", x: 82, y: 40, width: 7, height: 1 },
    { name: "North Korea", code: "KP", x: 81, y: 38, width: 7, height: 1 },
    { name: "Sri Lanka", code: "LK", x: 70, y: 56, width: 7, height: 1 },
    { name: "Maldives", code: "MV", x: 68, y: 58, width: 7, height: 1 },
    
    // MIDDLE EAST - Exact text positions from reference
    { name: "Saudi Arabia", code: "SA", x: 59, y: 50, width: 9, height: 1 },
    { name: "Iraq", code: "IQ", x: 56, y: 44, width: 4, height: 1 },
    { name: "Syria", code: "SY", x: 56, y: 40, width: 5, height: 1 },
    { name: "Jordan", code: "JO", x: 56, y: 46, width: 5, height: 1 },
    { name: "Israel", code: "IL", x: 55, y: 44, width: 5, height: 1 },
    { name: "Palestine", code: "PS", x: 55, y: 45, width: 7, height: 1 },
    { name: "Lebanon", code: "LB", x: 55, y: 40, width: 7, height: 1 },
    { name: "Kuwait", code: "KW", x: 59, y: 46, width: 6, height: 1 },
    { name: "Bahrain", code: "BH", x: 60, y: 48, width: 6, height: 1 },
    { name: "Qatar", code: "QA", x: 61, y: 48, width: 5, height: 1 },
    { name: "UAE", code: "AE", x: 62, y: 50, width: 3, height: 1 },
    { name: "Oman", code: "OM", x: 62, y: 52, width: 4, height: 1 },
    { name: "Yemen", code: "YE", x: 59, y: 54, width: 5, height: 1 },
    
    // AFRICA - Exact text positions from reference
    { name: "Morocco", code: "MA", x: 42, y: 46, width: 7, height: 1 },
    { name: "Algeria", code: "DZ", x: 47, y: 48, width: 6, height: 1 },
    { name: "Tunisia", code: "TN", x: 50, y: 44, width: 6, height: 1 },
    { name: "Libya", code: "LY", x: 51, y: 48, width: 5, height: 1 },
    { name: "Egypt", code: "EG", x: 55, y: 50, width: 5, height: 1 },
    { name: "Sudan", code: "SD", x: 55, y: 56, width: 5, height: 1 },
    { name: "South Sudan", code: "SS", x: 55, y: 58, width: 8, height: 1 },
    { name: "Eritrea", code: "ER", x: 57, y: 54, width: 6, height: 1 },
    { name: "Ethiopia", code: "ET", x: 58, y: 58, width: 7, height: 1 },
    { name: "Djibouti", code: "DJ", x: 59, y: 56, width: 6, height: 1 },
    { name: "Somalia", code: "SO", x: 60, y: 60, width: 7, height: 1 },
    { name: "Kenya", code: "KE", x: 57, y: 62, width: 5, height: 1 },
    { name: "Uganda", code: "UG", x: 55, y: 62, width: 6, height: 1 },
    { name: "Rwanda", code: "RW", x: 55, y: 64, width: 6, height: 1 },
    { name: "Burundi", code: "BI", x: 55, y: 65, width: 6, height: 1 },
    { name: "Tanzania", code: "TZ", x: 56, y: 66, width: 7, height: 1 },
    { name: "Malawi", code: "MW", x: 57, y: 70, width: 6, height: 1 },
    { name: "Mozambique", code: "MZ", x: 58, y: 76, width: 10, height: 1 },
    { name: "Madagascar", code: "MG", x: 61, y: 78, width: 9, height: 1 },
    { name: "Mauritius", code: "MU", x: 65, y: 75, width: 8, height: 1 },
    { name: "Comoros", code: "KM", x: 61, y: 68, width: 7, height: 1 },
    { name: "Seychelles", code: "SC", x: 63, y: 62, width: 9, height: 1 },
    { name: "Mauritania", code: "MR", x: 40, y: 50, width: 9, height: 1 },
    { name: "Senegal", code: "SN", x: 40, y: 54, width: 7, height: 1 },
    { name: "Gambia", code: "GM", x: 40, y: 55, width: 6, height: 1 },
    { name: "Guinea-Bissau", code: "GW", x: 40, y: 56, width: 10, height: 1 },
    { name: "Guinea", code: "GN", x: 41, y: 56, width: 6, height: 1 },
    { name: "Sierra Leone", code: "SL", x: 41, y: 58, width: 8, height: 1 },
    { name: "Liberia", code: "LR", x: 42, y: 58, width: 6, height: 1 },
    { name: "Ivory Coast", code: "CI", x: 44, y: 58, width: 8, height: 1 },
    { name: "Mali", code: "ML", x: 44, y: 54, width: 4, height: 1 },
    { name: "Burkina Faso", code: "BF", x: 45, y: 56, width: 9, height: 1 },
    { name: "Ghana", code: "GH", x: 46, y: 58, width: 5, height: 1 },
    { name: "Togo", code: "TG", x: 48, y: 58, width: 4, height: 1 },
    { name: "Benin", code: "BJ", x: 48, y: 57, width: 5, height: 1 },
    { name: "Nigeria", code: "NG", x: 49, y: 58, width: 7, height: 1 },
    { name: "Niger", code: "NE", x: 48, y: 54, width: 5, height: 1 },
    { name: "Chad", code: "TD", x: 51, y: 56, width: 4, height: 1 },
    { name: "Central African Republic", code: "CF", x: 52, y: 60, width: 12, height: 1 },
    { name: "Cameroon", code: "CM", x: 51, y: 62, width: 8, height: 1 },
    { name: "Equatorial Guinea", code: "GQ", x: 50, y: 60, width: 11, height: 1 },
    { name: "Gabon", code: "GA", x: 50, y: 64, width: 5, height: 1 },
    { name: "Sao Tome and Principe", code: "ST", x: 49, y: 62, width: 10, height: 1 },
    { name: "Republic of Congo", code: "CG", x: 51, y: 66, width: 11, height: 1 },
    { name: "Democratic Republic of Congo", code: "CD", x: 53, y: 68, width: 15, height: 1 },
    { name: "Angola", code: "AO", x: 50, y: 72, width: 6, height: 1 },
    { name: "Zambia", code: "ZM", x: 55, y: 72, width: 6, height: 1 },
    { name: "Zimbabwe", code: "ZW", x: 56, y: 75, width: 8, height: 1 },
    { name: "Botswana", code: "BW", x: 54, y: 76, width: 8, height: 1 },
    { name: "Namibia", code: "NA", x: 51, y: 76, width: 7, height: 1 },
    { name: "South Africa", code: "ZA", x: 54, y: 80, width: 8, height: 1 },
    { name: "Lesotho", code: "LS", x: 56, y: 78, width: 6, height: 1 },
    { name: "Swaziland", code: "SZ", x: 57, y: 77, width: 8, height: 1 },
    
    // MORE EUROPE - Missing countries  
    { name: "Vatican City", code: "VA", x: 50, y: 42, width: 7, height: 1 },
    { name: "San Marino", code: "SM", x: 50, y: 40, width: 7, height: 1 },
    { name: "Monaco", code: "MC", x: 47, y: 38, width: 6, height: 1 },
    { name: "Andorra", code: "AD", x: 45, y: 40, width: 6, height: 1 },
    { name: "Liechtenstein", code: "LI", x: 50, y: 35, width: 9, height: 1 },
    
    // MORE ASIA - Missing countries
    { name: "Armenia", code: "AM", x: 58, y: 40, width: 7, height: 1 },
    { name: "Azerbaijan", code: "AZ", x: 60, y: 40, width: 9, height: 1 },
    { name: "Georgia", code: "GE", x: 58, y: 38, width: 7, height: 1 },
    
    // MORE CARIBBEAN - Missing countries
    { name: "Saint Kitts and Nevis", code: "KN", x: 32, y: 56, width: 11, height: 1 },
    
    // MORE AFRICA - Missing countries
    { name: "Cape Verde", code: "CV", x: 35, y: 52, width: 7, height: 1 },
    
    // OCEANIA - Exact text positions from reference
    { name: "Australia", code: "AU", x: 82, y: 78, width: 8, height: 1 },
    { name: "New Zealand", code: "NZ", x: 89, y: 84, width: 8, height: 1 },
    { name: "Papua New Guinea", code: "PG", x: 84, y: 64, width: 11, height: 1 },
    { name: "Solomon Islands", code: "SB", x: 88, y: 65, width: 10, height: 1 },
    { name: "Vanuatu", code: "VU", x: 89, y: 68, width: 7, height: 1 },
    { name: "Fiji", code: "FJ", x: 91, y: 70, width: 4, height: 1 },
    { name: "New Caledonia", code: "NC", x: 89, y: 72, width: 9, height: 1 },
    { name: "Tonga", code: "TO", x: 93, y: 72, width: 5, height: 1 },
    { name: "Samoa", code: "WS", x: 95, y: 68, width: 5, height: 1 },
    { name: "Palau", code: "PW", x: 84, y: 52, width: 5, height: 1 },
    { name: "Micronesia", code: "FM", x: 86, y: 52, width: 9, height: 1 },
    { name: "Marshall Islands", code: "MH", x: 88, y: 50, width: 10, height: 1 },
    { name: "Kiribati", code: "KI", x: 90, y: 58, width: 7, height: 1 },
    { name: "Nauru", code: "NR", x: 88, y: 58, width: 5, height: 1 },
    { name: "Tuvalu", code: "TV", x: 90, y: 64, width: 6, height: 1 }
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
          
          {/* Country Hotspots - Using actual country coordinates */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {countries.map((country) => {
              // Convert percentage coordinates to SVG coordinates
              const svgX = (country.x / 100) * 1000; // Scale to SVG viewport
              const svgY = (country.y / 100) * 600;  // Scale to SVG viewport
              const svgWidth = (country.width / 100) * 1000;
              const svgHeight = (country.height / 100) * 600;
              
              // Create a simple rectangular path for each country at its exact position
              const pathData = `M${svgX},${svgY} L${svgX + svgWidth},${svgY} L${svgX + svgWidth},${svgY + svgHeight} L${svgX},${svgY + svgHeight} Z`;
              
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