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

  // Countries positioned with coordinates from your world map image (converted to percentages)
  const countries: Country[] = [
    // NORTH AMERICA
    { name: "Canada", code: "CA", x: 30, y: 32 },
    { name: "United States of America", code: "US", x: 31, y: 37 },
    { name: "Mexico", code: "MX", x: 27, y: 44 },
    { name: "Greenland", code: "GL", x: 50, y: 13 },
    
    // SOUTH AMERICA  
    { name: "Brazil", code: "BR", x: 49, y: 62 },
    { name: "Argentina", code: "AR", x: 52, y: 83 },
    { name: "Chile", code: "CL", x: 43, y: 73 },
    { name: "Peru", code: "PE", x: 44, y: 60 },
    { name: "Colombia", code: "CO", x: 42, y: 55 },
    { name: "Venezuela", code: "VE", x: 50, y: 49 },
    { name: "Ecuador", code: "EC", x: 39, y: 55 },
    { name: "Bolivia", code: "BO", x: 50, y: 70 },
    { name: "Paraguay", code: "PY", x: 54, y: 75 },
    { name: "Uruguay", code: "UY", x: 56, y: 82 },
    { name: "Guyana", code: "GY", x: 56, y: 54 },
    { name: "Suriname", code: "SR", x: 59, y: 55 },
    { name: "French Guiana", code: "GF", x: 62, y: 55 },
    
    // EUROPE
    { name: "Iceland", code: "IS", x: 61, y: 17 },
    { name: "Ireland", code: "IE", x: 66, y: 24 },
    { name: "United Kingdom", code: "GB", x: 70, y: 24 },
    { name: "Portugal", code: "PT", x: 69, y: 34 },
    { name: "Spain", code: "ES", x: 72, y: 34 },
    { name: "France", code: "FR", x: 76, y: 30 },
    { name: "Belgium", code: "BE", x: 77, y: 27 },
    { name: "Netherlands", code: "NL", x: 78, y: 26 },
    { name: "Germany", code: "DE", x: 81, y: 29 },
    { name: "Denmark", code: "DK", x: 81, y: 24 },
    { name: "Norway", code: "NO", x: 81, y: 17 },
    { name: "Sweden", code: "SE", x: 86, y: 21 },
    { name: "Finland", code: "FI", x: 92, y: 18 },
    { name: "Poland", code: "PL", x: 88, y: 29 },
    { name: "Czech Republic", code: "CZ", x: 84, y: 32 },
    { name: "Austria", code: "AT", x: 85, y: 34 },
    { name: "Switzerland", code: "CH", x: 80, y: 34 },
    { name: "Italy", code: "IT", x: 83, y: 40 },
    { name: "Slovenia", code: "SI", x: 85, y: 35 },
    { name: "Croatia", code: "HR", x: 87, y: 36 },
    { name: "Bosnia and Herzegovina", code: "BA", x: 87, y: 38 },
    { name: "Serbia", code: "RS", x: 90, y: 37 },
    { name: "Montenegro", code: "ME", x: 88, y: 39 },
    { name: "Albania", code: "AL", x: 90, y: 41 },
    { name: "North Macedonia", code: "MK", x: 92, y: 41 },
    { name: "Greece", code: "GR", x: 94, y: 45 },
    { name: "Romania", code: "RO", x: 95, y: 34 },
    { name: "Bulgaria", code: "BG", x: 96, y: 39 },
    
    // EASTERN EUROPE & RUSSIA
    { name: "Moldova", code: "MD", x: 58, y: 33 },
    { name: "Ukraine", code: "UA", x: 60, y: 31 },
    { name: "Belarus", code: "BY", x: 58, y: 26 },
    { name: "Lithuania", code: "LT", x: 55, y: 23 },
    { name: "Latvia", code: "LV", x: 55, y: 21 },
    { name: "Estonia", code: "EE", x: 55, y: 18 },
    { name: "Russia", code: "RU", x: 65, y: 17 },
    
    // MIDDLE EAST & CAUCASUS
    { name: "Turkey", code: "TR", x: 60, y: 42 },
    { name: "Cyprus", code: "CY", x: 61, y: 48 },
    { name: "Georgia", code: "GE", x: 64, y: 38 },
    { name: "Armenia", code: "AM", x: 65, y: 40 },
    { name: "Azerbaijan", code: "AZ", x: 67, y: 40 },
    
    // CENTRAL ASIA
    { name: "Kazakhstan", code: "KZ", x: 69, y: 26 },
    { name: "Turkmenistan", code: "TM", x: 68, y: 36 },
    { name: "Uzbekistan", code: "UZ", x: 70, y: 34 },
    { name: "Kyrgyzstan", code: "KG", x: 73, y: 33 },
    { name: "Tajikistan", code: "TJ", x: 72, y: 36 },
    
    // EAST ASIA
    { name: "Mongolia", code: "MN", x: 77, y: 21 },
    { name: "China", code: "CN", x: 79, y: 36 },
    { name: "North Korea", code: "KP", x: 85, y: 31 },
    { name: "South Korea", code: "KR", x: 86, y: 33 },
    { name: "Japan", code: "JP", x: 89, y: 28 },
    { name: "Taiwan", code: "TW", x: 84, y: 41 },
    
    // SOUTH ASIA & SOUTHEAST ASIA
    { name: "India", code: "IN", x: 74, y: 49 },
    { name: "Pakistan", code: "PK", x: 69, y: 46 },
    { name: "Nepal", code: "NP", x: 76, y: 45 },
    { name: "Bhutan", code: "BT", x: 78, y: 45 },
    { name: "Bangladesh", code: "BD", x: 78, y: 49 },
    { name: "Myanmar", code: "MM", x: 81, y: 53 },
    { name: "Thailand", code: "TH", x: 83, y: 58 },
    { name: "Laos", code: "LA", x: 84, y: 55 },
    { name: "Cambodia", code: "KH", x: 85, y: 59 },
    { name: "Vietnam", code: "VN", x: 87, y: 56 },
    { name: "Malaysia", code: "MY", x: 85, y: 65 },
    { name: "Singapore", code: "SG", x: 87, y: 70 },
    { name: "Indonesia", code: "ID", x: 90, y: 73 },
    { name: "Brunei", code: "BN", x: 89, y: 65 },
    { name: "Philippines", code: "PH", x: 92, y: 55 },
    { name: "Timor-Leste", code: "TL", x: 95, y: 76 },
    
    // OCEANIA
    { name: "Papua New Guinea", code: "PG", x: 100, y: 69 },
    { name: "Australia", code: "AU", x: 95, y: 86 },
    { name: "New Zealand", code: "NZ", x: 115, y: 92 },
    { name: "Samoa", code: "WS", x: 130, y: 76 },
    { name: "Tonga", code: "TO", x: 133, y: 81 },
    { name: "Fiji", code: "FJ", x: 126, y: 77 },
    { name: "Vanuatu", code: "VU", x: 122, y: 73 },
    { name: "Solomon Islands", code: "SB", x: 119, y: 70 },
    
    // NORTH AFRICA
    { name: "Morocco", code: "MA", x: 41, y: 43 },
    { name: "Algeria", code: "DZ", x: 47, y: 45 },
    { name: "Tunisia", code: "TN", x: 52, y: 45 },
    { name: "Libya", code: "LY", x: 57, y: 45 },
    { name: "Egypt", code: "EG", x: 60, y: 47 },
    { name: "Western Sahara", code: "EH", x: 40, y: 50 },
    
    // WEST AFRICA
    { name: "Mauritania", code: "MR", x: 43, y: 53 },
    { name: "Mali", code: "ML", x: 47, y: 54 },
    { name: "Senegal", code: "SN", x: 40, y: 56 },
    { name: "Gambia", code: "GM", x: 40, y: 57 },
    { name: "Guinea-Bissau", code: "GW", x: 41, y: 59 },
    { name: "Guinea", code: "GN", x: 42, y: 61 },
    { name: "Sierra Leone", code: "SL", x: 43, y: 64 },
    { name: "Liberia", code: "LR", x: 44, y: 67 },
    { name: "Côte d'Ivoire", code: "CI", x: 46, y: 64 },
    { name: "Ghana", code: "GH", x: 48, y: 64 },
    { name: "Togo", code: "TG", x: 49, y: 62 },
    { name: "Benin", code: "BJ", x: 50, y: 62 },
    { name: "Burkina Faso", code: "BF", x: 48, y: 59 },
    { name: "Niger", code: "NE", x: 53, y: 56 },
    { name: "Nigeria", code: "NG", x: 54, y: 63 },
    
    // CENTRAL AFRICA
    { name: "Cameroon", code: "CM", x: 55, y: 67 },
    { name: "Chad", code: "TD", x: 57, y: 59 },
    { name: "Central African Republic", code: "CF", x: 59, y: 65 },
    { name: "Equatorial Guinea", code: "GQ", x: 53, y: 72 },
    { name: "Gabon", code: "GA", x: 55, y: 74 },
    { name: "Republic of the Congo", code: "CG", x: 57, y: 77 },
    { name: "Democratic Republic of the Congo", code: "CD", x: 61, y: 76 },
    
    // EAST AFRICA
    { name: "South Sudan", code: "SS", x: 63, y: 64 },
    { name: "Sudan", code: "SD", x: 62, y: 56 },
    { name: "Eritrea", code: "ER", x: 66, y: 55 },
    { name: "Djibouti", code: "DJ", x: 68, y: 58 },
    { name: "Ethiopia", code: "ET", x: 67, y: 62 },
    { name: "Somalia", code: "SO", x: 71, y: 68 },
    { name: "Uganda", code: "UG", x: 63, y: 70 },
    { name: "Kenya", code: "KE", x: 66, y: 73 },
    { name: "Rwanda", code: "RW", x: 64, y: 73 },
    { name: "Burundi", code: "BI", x: 65, y: 76 },
    { name: "Tanzania", code: "TZ", x: 66, y: 79 },
    
    // SOUTHERN AFRICA
    { name: "Angola", code: "AO", x: 57, y: 83 },
    { name: "Zambia", code: "ZM", x: 62, y: 84 },
    { name: "Malawi", code: "MW", x: 66, y: 85 },
    { name: "Mozambique", code: "MZ", x: 68, y: 89 },
    { name: "Zimbabwe", code: "ZW", x: 64, y: 88 },
    { name: "Botswana", code: "BW", x: 60, y: 93 },
    { name: "Namibia", code: "NA", x: 55, y: 90 },
    { name: "South Africa", code: "ZA", x: 61, y: 98 },
    { name: "Lesotho", code: "LS", x: 64, y: 99 },
    { name: "Eswatini", code: "SZ", x: 65, y: 97 },
    { name: "Madagascar", code: "MG", x: 76, y: 90 },
    { name: "Comoros", code: "KM", x: 73, y: 83 },
    { name: "Seychelles", code: "SC", x: 76, y: 76 },
    { name: "Mauritius", code: "MU", x: 78, y: 90 },
    
    // MIDDLE EAST
    { name: "Saudi Arabia", code: "SA", x: 66, y: 50 },
    { name: "Yemen", code: "YE", x: 69, y: 59 },
    { name: "Oman", code: "OM", x: 74, y: 56 },
    { name: "United Arab Emirates", code: "AE", x: 71, y: 50 },
    { name: "Qatar", code: "QA", x: 69, y: 48 },
    { name: "Bahrain", code: "BH", x: 70, y: 49 },
    { name: "Kuwait", code: "KW", x: 68, y: 47 },
    { name: "Iraq", code: "IQ", x: 65, y: 44 },
    { name: "Iran", code: "IR", x: 70, y: 43 },
    { name: "Syria", code: "SY", x: 62, y: 43 },
    { name: "Lebanon", code: "LB", x: 61, y: 42 },
    { name: "Israel", code: "IL", x: 60, y: 45 },
    { name: "Jordan", code: "JO", x: 62, y: 46 },
    { name: "Palestine", code: "PS", x: 60, y: 44 },
    { name: "Afghanistan", code: "AF", x: 68, y: 39 },
    { name: "Sri Lanka", code: "LK", x: 75, y: 61 },
    { name: "Maldives", code: "MV", x: 71, y: 69 },
    
    // SMALL EUROPEAN COUNTRIES
    { name: "Luxembourg", code: "LU", x: 46, y: 29 },
    { name: "Liechtenstein", code: "LI", x: 47, y: 34 },
    { name: "Monaco", code: "MC", x: 46, y: 36 },
    { name: "San Marino", code: "SM", x: 49, y: 39 },
    { name: "Vatican City", code: "VA", x: 49, y: 39 },
    { name: "Andorra", code: "AD", x: 43, y: 33 },
    { name: "Malta", code: "MT", x: 52, y: 46 },
    { name: "Kosovo", code: "XK", x: 53, y: 39 },
    
    // CARIBBEAN
    { name: "Cuba", code: "CU", x: 21, y: 47 },
    { name: "Jamaica", code: "JM", x: 24, y: 50 },
    { name: "Haiti", code: "HT", x: 26, y: 47 },
    { name: "Dominican Republic", code: "DO", x: 28, y: 47 },
    { name: "Bahamas", code: "BS", x: 23, y: 42 },
    
    // CENTRAL AMERICA
    { name: "Belize", code: "BZ", x: 17, y: 47 },
    { name: "Guatemala", code: "GT", x: 16, y: 48 },
    { name: "Honduras", code: "HN", x: 19, y: 49 },
    { name: "El Salvador", code: "SV", x: 18, y: 51 },
    { name: "Nicaragua", code: "NI", x: 20, y: 52 },
    { name: "Costa Rica", code: "CR", x: 21, y: 55 },
    { name: "Panama", code: "PA", x: 23, y: 56 },
    
    // SMALL CARIBBEAN ISLANDS
    { name: "Trinidad and Tobago", code: "TT", x: 31, y: 52 },
    { name: "Barbados", code: "BB", x: 33, y: 50 },
    { name: "Saint Lucia", code: "LC", x: 30, y: 48 },
    { name: "Grenada", code: "GD", x: 31, y: 51 },
    
    // ISLAND NATIONS
    { name: "Cape Verde", code: "CV", x: 36, y: 52 }
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