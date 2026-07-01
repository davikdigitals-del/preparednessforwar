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

  // ALL COUNTRIES with exact coordinates from your world map image
  // Using proper scaling: your coordinates appear to be based on ~1920x1080 or similar dimensions
  const countries: Country[] = [
    // FIRST BATCH - North/South America
    { name: "Canada", code: "CA", x: 15.8, y: 25.3 },
    { name: "United States of America", code: "US", x: 16.4, y: 36.8 },
    { name: "Mexico", code: "MX", x: 14.3, y: 43.5 },
    { name: "Greenland", code: "GL", x: 26.4, y: 12.7 },
    { name: "Brazil", code: "BR", x: 25.8, y: 60.5 },
    { name: "Argentina", code: "AR", x: 27.2, y: 81.5 },
    { name: "Chile", code: "CL", x: 22.7, y: 71.8 },
    { name: "Peru", code: "PE", x: 22.9, y: 58.6 },
    { name: "Colombia", code: "CO", x: 22.1, y: 53.7 },
    { name: "Venezuela", code: "VE", x: 26.0, y: 47.9 },
    { name: "Ecuador", code: "EC", x: 20.7, y: 53.5 },
    { name: "Bolivia", code: "BO", x: 26.0, y: 68.4 },
    { name: "Paraguay", code: "PY", x: 28.1, y: 73.2 },
    { name: "Uruguay", code: "UY", x: 29.3, y: 80.1 },
    { name: "Guyana", code: "GY", x: 29.2, y: 52.7 },
    { name: "Suriname", code: "SR", x: 30.7, y: 53.7 },
    { name: "French Guiana", code: "GF", x: 32.3, y: 53.7 },
    
    // EUROPE - All countries
    { name: "Iceland", code: "IS", x: 31.8, y: 16.6 },
    { name: "Ireland", code: "IE", x: 34.4, y: 23.4 },
    { name: "United Kingdom", code: "GB", x: 36.5, y: 23.4 },
    { name: "Portugal", code: "PT", x: 35.9, y: 33.2 },
    { name: "Spain", code: "ES", x: 37.7, y: 33.7 },
    { name: "France", code: "FR", x: 39.6, y: 29.3 },
    { name: "Belgium", code: "BE", x: 40.6, y: 27.1 },
    { name: "Netherlands", code: "NL", x: 40.8, y: 25.4 },
    { name: "Germany", code: "DE", x: 42.3, y: 28.3 },
    { name: "Denmark", code: "DK", x: 42.3, y: 23.4 },
    { name: "Norway", code: "NO", x: 42.3, y: 16.6 },
    { name: "Sweden", code: "SE", x: 44.8, y: 20.5 },
    { name: "Finland", code: "FI", x: 47.9, y: 17.6 },
    { name: "Poland", code: "PL", x: 45.8, y: 28.3 },
    { name: "Czech Republic", code: "CZ", x: 43.8, y: 31.3 },
    { name: "Austria", code: "AT", x: 44.3, y: 33.2 },
    { name: "Switzerland", code: "CH", x: 41.7, y: 33.2 },
    { name: "Italy", code: "IT", x: 43.2, y: 39.1 },
    { name: "Slovenia", code: "SI", x: 44.3, y: 34.2 },
    { name: "Croatia", code: "HR", x: 45.3, y: 35.2 },
    { name: "Bosnia and Herzegovina", code: "BA", x: 45.3, y: 37.1 },
    { name: "Serbia", code: "RS", x: 46.9, y: 36.1 },
    { name: "Montenegro", code: "ME", x: 45.8, y: 38.1 },
    { name: "Albania", code: "AL", x: 46.9, y: 40.0 },
    { name: "North Macedonia", code: "MK", x: 47.9, y: 40.0 },
    { name: "Greece", code: "GR", x: 48.9, y: 44.0 },
    { name: "Romania", code: "RO", x: 49.5, y: 33.2 },
    { name: "Bulgaria", code: "BG", x: 50.0, y: 38.1 },
    { name: "Moldova", code: "MD", x: 51.0, y: 32.2 },
    { name: "Ukraine", code: "UA", x: 52.6, y: 30.3 },
    { name: "Belarus", code: "BY", x: 51.0, y: 25.4 },
    { name: "Lithuania", code: "LT", x: 48.4, y: 22.5 },
    { name: "Latvia", code: "LV", x: 48.7, y: 20.5 },
    { name: "Estonia", code: "EE", x: 48.4, y: 17.6 },
    { name: "Russia", code: "RU", x: 58.3, y: 16.6 },
    
    // MIDDLE EAST & CAUCASUS
    { name: "Turkey", code: "TR", x: 53.1, y: 41.0 },
    { name: "Cyprus", code: "CY", x: 53.6, y: 46.9 },
    { name: "Georgia", code: "GE", x: 56.8, y: 37.1 },
    { name: "Armenia", code: "AM", x: 57.3, y: 39.1 },
    { name: "Azerbaijan", code: "AZ", x: 58.9, y: 39.1 },
    { name: "Saudi Arabia", code: "SA", x: 58.9, y: 48.8 },
    { name: "Yemen", code: "YE", x: 61.5, y: 57.6 },
    { name: "Oman", code: "OM", x: 65.6, y: 55.1 },
    { name: "United Arab Emirates", code: "AE", x: 63.5, y: 48.8 },
    { name: "Qatar", code: "QA", x: 61.7, y: 47.4 },
    { name: "Bahrain", code: "BH", x: 62.5, y: 48.3 },
    { name: "Kuwait", code: "KW", x: 60.7, y: 46.0 },
    { name: "Iraq", code: "IQ", x: 58.3, y: 43.5 },
    { name: "Iran", code: "IR", x: 62.5, y: 42.0 },
    { name: "Syria", code: "SY", x: 55.5, y: 42.0 },
    { name: "Lebanon", code: "LB", x: 54.2, y: 41.5 },
    { name: "Israel", code: "IL", x: 53.6, y: 44.0 },
    { name: "Jordan", code: "JO", x: 55.7, y: 45.4 },
    { name: "Palestine", code: "PS", x: 53.9, y: 43.5 },
    { name: "Afghanistan", code: "AF", x: 61.0, y: 38.1 },
    { name: "Sri Lanka", code: "LK", x: 67.2, y: 59.6 },
    { name: "Maldives", code: "MV", x: 63.0, y: 67.4 },
    
    // CENTRAL ASIA
    { name: "Kazakhstan", code: "KZ", x: 61.5, y: 25.4 },
    { name: "Turkmenistan", code: "TM", x: 60.4, y: 35.2 },
    { name: "Uzbekistan", code: "UZ", x: 62.0, y: 33.2 },
    { name: "Kyrgyzstan", code: "KG", x: 64.8, y: 32.2 },
    { name: "Tajikistan", code: "TJ", x: 64.1, y: 35.2 },
    
    // EAST ASIA
    { name: "Mongolia", code: "MN", x: 68.8, y: 21.0 },
    { name: "China", code: "CN", x: 70.3, y: 35.2 },
    { name: "North Korea", code: "KP", x: 75.0, y: 30.3 },
    { name: "South Korea", code: "KR", x: 76.0, y: 32.2 },
    { name: "Japan", code: "JP", x: 78.1, y: 27.3 },
    { name: "Taiwan", code: "TW", x: 75.0, y: 40.0 },
    
    // SOUTH ASIA & SOUTHEAST ASIA
    { name: "India", code: "IN", x: 65.6, y: 47.9 },
    { name: "Pakistan", code: "PK", x: 61.5, y: 45.0 },
    { name: "Nepal", code: "NP", x: 67.2, y: 44.0 },
    { name: "Bhutan", code: "BT", x: 69.5, y: 44.0 },
    { name: "Bangladesh", code: "BD", x: 69.8, y: 47.9 },
    { name: "Myanmar", code: "MM", x: 72.4, y: 51.8 },
    { name: "Thailand", code: "TH", x: 74.0, y: 56.6 },
    { name: "Laos", code: "LA", x: 75.2, y: 54.2 },
    { name: "Cambodia", code: "KH", x: 75.5, y: 57.6 },
    { name: "Vietnam", code: "VN", x: 77.1, y: 54.7 },
    { name: "Malaysia", code: "MY", x: 76.0, y: 63.5 },
    { name: "Singapore", code: "SG", x: 76.6, y: 68.4 },
    { name: "Indonesia", code: "ID", x: 79.7, y: 71.3 },
    { name: "Brunei", code: "BN", x: 79.2, y: 63.5 },
    { name: "Philippines", code: "PH", x: 81.8, y: 53.7 },
    { name: "Timor-Leste", code: "TL", x: 83.9, y: 74.2 },
    
    // OCEANIA
    { name: "Papua New Guinea", code: "PG", x: 89.6, y: 67.4 },
    { name: "Australia", code: "AU", x: 84.9, y: 84.0 },
    { name: "New Zealand", code: "NZ", x: 91.1, y: 90.3 },
    
    // AFRICA - North Africa
    { name: "Morocco", code: "MA", x: 37.0, y: 42.0 },
    { name: "Algeria", code: "DZ", x: 41.9, y: 44.0 },
    { name: "Tunisia", code: "TN", x: 46.9, y: 44.0 },
    { name: "Libya", code: "LY", x: 51.0, y: 44.0 },
    { name: "Egypt", code: "EG", x: 53.9, y: 46.0 },
    { name: "Western Sahara", code: "EH", x: 35.4, y: 48.8 },
    
    // AFRICA - West Africa
    { name: "Mauritania", code: "MR", x: 38.0, y: 51.8 },
    { name: "Mali", code: "ML", x: 41.7, y: 52.7 },
    { name: "Senegal", code: "SN", x: 35.9, y: 54.7 },
    { name: "Gambia", code: "GM", x: 35.9, y: 56.2 },
    { name: "Guinea-Bissau", code: "GW", x: 36.5, y: 57.6 },
    { name: "Guinea", code: "GN", x: 37.2, y: 59.6 },
    { name: "Sierra Leone", code: "SL", x: 38.0, y: 62.5 },
    { name: "Liberia", code: "LR", x: 39.1, y: 65.4 },
    { name: "Côte d'Ivoire", code: "CI", x: 41.1, y: 63.0 },
    { name: "Ghana", code: "GH", x: 43.2, y: 62.5 },
    { name: "Togo", code: "TG", x: 44.0, y: 61.0 },
    { name: "Benin", code: "BJ", x: 45.1, y: 61.0 },
    { name: "Burkina Faso", code: "BF", x: 43.0, y: 58.1 },
    { name: "Niger", code: "NE", x: 47.1, y: 55.7 },
    { name: "Nigeria", code: "NG", x: 47.9, y: 61.5 },
    
    // AFRICA - Central Africa
    { name: "Cameroon", code: "CM", x: 49.2, y: 65.4 },
    { name: "Chad", code: "TD", x: 51.0, y: 58.1 },
    { name: "Central African Republic", code: "CF", x: 52.9, y: 64.0 },
    { name: "Equatorial Guinea", code: "GQ", x: 47.7, y: 70.3 },
    { name: "Gabon", code: "GA", x: 49.0, y: 72.7 },
    { name: "Republic of the Congo", code: "CG", x: 51.0, y: 75.2 },
    { name: "Democratic Republic of the Congo", code: "CD", x: 54.4, y: 74.2 },
    
    // AFRICA - East Africa
    { name: "South Sudan", code: "SS", x: 56.5, y: 62.5 },
    { name: "Sudan", code: "SD", x: 55.2, y: 55.2 },
    { name: "Eritrea", code: "ER", x: 59.1, y: 54.2 },
    { name: "Djibouti", code: "DJ", x: 60.4, y: 57.1 },
    { name: "Ethiopia", code: "ET", x: 59.6, y: 61.0 },
    { name: "Somalia", code: "SO", x: 63.0, y: 66.4 },
    { name: "Uganda", code: "UG", x: 56.3, y: 68.4 },
    { name: "Kenya", code: "KE", x: 58.6, y: 71.8 },
    { name: "Rwanda", code: "RW", x: 57.0, y: 71.8 },
    { name: "Burundi", code: "BI", x: 57.8, y: 74.2 },
    { name: "Tanzania", code: "TZ", x: 59.1, y: 77.1 },
    
    // AFRICA - Southern Africa
    { name: "Angola", code: "AO", x: 51.0, y: 81.5 },
    { name: "Zambia", code: "ZM", x: 55.2, y: 82.0 },
    { name: "Malawi", code: "MW", x: 58.6, y: 83.5 },
    { name: "Mozambique", code: "MZ", x: 60.9, y: 87.0 },
    { name: "Zimbabwe", code: "ZW", x: 56.8, y: 86.5 },
    { name: "Botswana", code: "BW", x: 53.6, y: 90.8 },
    { name: "Namibia", code: "NA", x: 49.0, y: 88.4 },
    { name: "South Africa", code: "ZA", x: 54.7, y: 96.2 },
    { name: "Lesotho", code: "LS", x: 56.8, y: 97.2 },
    { name: "Eswatini", code: "SZ", x: 58.3, y: 94.7 },
    { name: "Madagascar", code: "MG", x: 68.2, y: 87.9 },
    { name: "Comoros", code: "KM", x: 64.8, y: 81.1 },
    { name: "Seychelles", code: "SC", x: 68.2, y: 74.2 },
    { name: "Mauritius", code: "MU", x: 69.5, y: 87.9 },
    
    // CARIBBEAN
    { name: "Cuba", code: "CU", x: 19.0, y: 45.9 },
    { name: "Jamaica", code: "JM", x: 21.1, y: 49.3 },
    { name: "Haiti", code: "HT", x: 23.2, y: 45.9 },
    { name: "Dominican Republic", code: "DO", x: 24.7, y: 45.9 },
    { name: "Bahamas", code: "BS", x: 20.6, y: 41.5 },
    { name: "Trinidad and Tobago", code: "TT", x: 27.9, y: 50.8 },
    { name: "Barbados", code: "BB", x: 29.2, y: 48.8 },
    { name: "Saint Lucia", code: "LC", x: 27.1, y: 47.4 },
    { name: "Grenada", code: "GD", x: 27.6, y: 50.3 },
    
    // CENTRAL AMERICA
    { name: "Belize", code: "BZ", x: 15.4, y: 45.9 },
    { name: "Guatemala", code: "GT", x: 14.3, y: 47.4 },
    { name: "Honduras", code: "HN", x: 16.7, y: 48.3 },
    { name: "El Salvador", code: "SV", x: 15.6, y: 50.3 },
    { name: "Nicaragua", code: "NI", x: 17.7, y: 51.3 },
    { name: "Costa Rica", code: "CR", x: 18.5, y: 54.2 },
    { name: "Panama", code: "PA", x: 20.3, y: 54.7 },
    
    // SMALL EUROPEAN COUNTRIES
    { name: "Luxembourg", code: "LU", x: 40.8, y: 28.8 },
    { name: "Liechtenstein", code: "LI", x: 42.2, y: 33.2 },
    { name: "Monaco", code: "MC", x: 40.9, y: 35.2 },
    { name: "San Marino", code: "SM", x: 44.0, y: 38.6 },
    { name: "Vatican City", code: "VA", x: 43.5, y: 38.1 },
    { name: "Andorra", code: "AD", x: 38.3, y: 32.2 },
    { name: "Malta", code: "MT", x: 46.9, y: 45.0 },
    { name: "Kosovo", code: "XK", x: 47.4, y: 38.1 },
    
    // ISLAND NATIONS
    { name: "Cape Verde", code: "CV", x: 32.3, y: 50.8 }
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
        
        {/* Clickable areas positioned over country names with visible labels */}
        <div className="absolute inset-0 w-full h-full">
          {countries.map((country) => (
            <div
              key={country.code}
              className="absolute cursor-pointer border-2 border-red-500 bg-red-200 bg-opacity-50 flex items-center justify-center"
              style={{
                left: `${country.x}%`,
                top: `${country.y}%`,
                width: '80px',
                height: '25px',
              }}
              onClick={() => handleCountryClick(country)}
              title={country.name}
            >
              <span className="text-xs font-bold text-red-900 text-center leading-tight">
                {country.code}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};