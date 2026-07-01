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

  // ALL COUNTRIES with exact coordinates from your comprehensive data
  const countries: Country[] = [
    // BATCH 1: North/South America
    { name: "Canada", code: "CA", x: 29.6, y: 25.3 },
    { name: "United States of America", code: "US", x: 30.8, y: 36.8 },
    { name: "Mexico", code: "MX", x: 26.8, y: 43.5 },
    { name: "Greenland", code: "GL", x: 49.5, y: 12.7 },
    { name: "Brazil", code: "BR", x: 48.4, y: 60.5 },
    { name: "Argentina", code: "AR", x: 51.0, y: 81.5 },
    { name: "Chile", code: "CL", x: 42.5, y: 71.8 },
    { name: "Peru", code: "PE", x: 43.0, y: 58.6 },
    { name: "Colombia", code: "CO", x: 41.5, y: 53.7 },
    { name: "Venezuela", code: "VE", x: 48.8, y: 47.9 },
    { name: "Ecuador", code: "EC", x: 39.0, y: 53.5 },
    { name: "Bolivia", code: "BO", x: 48.8, y: 68.4 },
    { name: "Paraguay", code: "PY", x: 52.7, y: 73.2 },
    { name: "Uruguay", code: "UY", x: 54.7, y: 80.1 },
    { name: "Guyana", code: "GY", x: 54.7, y: 52.7 },
    { name: "Suriname", code: "SR", x: 57.6, y: 53.7 },
    { name: "French Guiana", code: "GF", x: 60.5, y: 53.7 },
    
    // BATCH 2: Europe (from your coordinates)
    { name: "Iceland", code: "IS", x: 59.6, y: 16.6 },
    { name: "Ireland", code: "IE", x: 64.5, y: 23.4 },
    { name: "United Kingdom", code: "GB", x: 68.4, y: 23.4 },
    { name: "Portugal", code: "PT", x: 67.4, y: 33.2 },
    { name: "Spain", code: "ES", x: 70.8, y: 33.7 },
    { name: "France", code: "FR", x: 74.2, y: 29.3 },
    { name: "Belgium", code: "BE", x: 76.6, y: 26.5 },
    { name: "Netherlands", code: "NL", x: 76.8, y: 25.4 },
    { name: "Germany", code: "DE", x: 79.1, y: 28.3 },
    { name: "Denmark", code: "DK", x: 79.2, y: 23.4 },
    { name: "Norway", code: "NO", x: 79.2, y: 16.6 },
    { name: "Sweden", code: "SE", x: 84.0, y: 20.5 },
    { name: "Finland", code: "FI", x: 89.8, y: 17.6 },
    { name: "Poland", code: "PL", x: 85.9, y: 28.3 },
    { name: "Czech Republic", code: "CZ", x: 82.4, y: 31.3 },
    { name: "Austria", code: "AT", x: 83.0, y: 33.2 },
    { name: "Switzerland", code: "CH", x: 78.1, y: 33.2 },
    { name: "Italy", code: "IT", x: 81.1, y: 39.1 },
    { name: "Slovenia", code: "SI", x: 83.0, y: 34.2 },
    { name: "Croatia", code: "HR", x: 85.0, y: 35.2 },
    { name: "Bosnia and Herzegovina", code: "BA", x: 85.0, y: 37.1 },
    { name: "Serbia", code: "RS", x: 87.9, y: 36.1 },
    { name: "Montenegro", code: "ME", x: 85.9, y: 38.1 },
    { name: "Albania", code: "AL", x: 87.9, y: 40.0 },
    { name: "North Macedonia", code: "MK", x: 89.8, y: 40.0 },
    { name: "Greece", code: "GR", x: 91.8, y: 44.0 },
    { name: "Romania", code: "RO", x: 92.8, y: 33.2 },
    { name: "Bulgaria", code: "BG", x: 93.8, y: 38.1 },
    { name: "Moldova", code: "MD", x: 95.7, y: 32.2 },
    { name: "Ukraine", code: "UA", x: 98.6, y: 30.3 },
    { name: "Belarus", code: "BY", x: 95.7, y: 25.4 },
    { name: "Lithuania", code: "LT", x: 90.8, y: 22.5 },
    { name: "Latvia", code: "LV", x: 91.3, y: 20.5 },
    { name: "Estonia", code: "EE", x: 91.1, y: 17.6 },
    { name: "Russia", code: "RU", x: 109.4, y: 16.6 },
    { name: "Turkey", code: "TR", x: 99.6, y: 41.0 },
    { name: "Cyprus", code: "CY", x: 100.6, y: 46.9 },
    { name: "Georgia", code: "GE", x: 106.4, y: 37.1 },
    { name: "Armenia", code: "AM", x: 107.4, y: 39.1 },
    { name: "Azerbaijan", code: "AZ", x: 110.4, y: 39.1 },
    
    // BATCH 3: Asia (from your coordinates)
    { name: "Kazakhstan", code: "KZ", x: 115.2, y: 25.4 },
    { name: "Turkmenistan", code: "TM", x: 113.3, y: 35.2 },
    { name: "Uzbekistan", code: "UZ", x: 116.2, y: 33.2 },
    { name: "Kyrgyzstan", code: "KG", x: 121.5, y: 32.2 },
    { name: "Tajikistan", code: "TJ", x: 120.3, y: 35.2 },
    { name: "Mongolia", code: "MN", x: 128.9, y: 21.0 },
    { name: "China", code: "CN", x: 131.8, y: 35.2 },
    { name: "North Korea", code: "KP", x: 141.2, y: 30.3 },
    { name: "South Korea", code: "KR", x: 142.6, y: 32.2 },
    { name: "Japan", code: "JP", x: 146.5, y: 27.3 },
    { name: "Taiwan", code: "TW", x: 140.8, y: 40.0 },
    { name: "India", code: "IN", x: 123.0, y: 47.9 },
    { name: "Pakistan", code: "PK", x: 115.2, y: 45.0 },
    { name: "Nepal", code: "NP", x: 125.5, y: 44.0 },
    { name: "Bhutan", code: "BT", x: 130.3, y: 44.0 },
    { name: "Bangladesh", code: "BD", x: 130.9, y: 47.9 },
    { name: "Myanmar", code: "MM", x: 135.7, y: 51.8 },
    { name: "Thailand", code: "TH", x: 138.9, y: 56.6 },
    { name: "Laos", code: "LA", x: 141.2, y: 54.2 },
    { name: "Cambodia", code: "KH", x: 141.9, y: 57.6 },
    { name: "Vietnam", code: "VN", x: 144.5, y: 54.7 },
    { name: "Malaysia", code: "MY", x: 142.6, y: 63.5 },
    { name: "Singapore", code: "SG", x: 143.6, y: 68.4 },
    { name: "Indonesia", code: "ID", x: 149.3, y: 71.3 },
    { name: "Brunei", code: "BN", x: 148.4, y: 63.5 },
    { name: "Philippines", code: "PH", x: 153.3, y: 53.7 },
    { name: "Timor-Leste", code: "TL", x: 157.3, y: 74.2 },
    
    // BATCH 4: Oceania 
    { name: "Papua New Guinea", code: "PG", x: 167.8, y: 67.4 },
    { name: "Australia", code: "AU", x: 159.2, y: 84.0 },
    { name: "New Zealand", code: "NZ", x: 179.2, y: 90.3 },
    { name: "Samoa", code: "WS", x: 185.9, y: 74.2 },
    { name: "Tonga", code: "TO", x: 188.8, y: 79.7 },
    { name: "Fiji", code: "FJ", x: 177.7, y: 75.2 },
    { name: "Vanuatu", code: "VU", x: 171.9, y: 71.8 },
    { name: "Solomon Islands", code: "SB", x: 167.8, y: 68.4 },
    
    // BATCH 5: Africa - North
    { name: "Morocco", code: "MA", x: 69.3, y: 42.0 },
    { name: "Algeria", code: "DZ", x: 78.6, y: 44.0 },
    { name: "Tunisia", code: "TN", x: 87.9, y: 44.0 },
    { name: "Libya", code: "LY", x: 95.7, y: 44.0 },
    { name: "Egypt", code: "EG", x: 100.9, y: 46.0 },
    { name: "Western Sahara", code: "EH", x: 66.4, y: 48.8 },
    
    // BATCH 6: Africa - West
    { name: "Mauritania", code: "MR", x: 71.3, y: 51.8 },
    { name: "Mali", code: "ML", x: 78.1, y: 52.7 },
    { name: "Senegal", code: "SN", x: 67.4, y: 54.7 },
    { name: "Gambia", code: "GM", x: 67.4, y: 56.2 },
    { name: "Guinea-Bissau", code: "GW", x: 68.4, y: 57.6 },
    { name: "Guinea", code: "GN", x: 69.5, y: 59.6 },
    { name: "Sierra Leone", code: "SL", x: 71.3, y: 62.5 },
    { name: "Liberia", code: "LR", x: 73.2, y: 65.4 },
    { name: "Côte d'Ivoire", code: "CI", x: 77.1, y: 63.0 },
    { name: "Ghana", code: "GH", x: 81.1, y: 62.5 },
    { name: "Togo", code: "TG", x: 82.4, y: 61.0 },
    { name: "Benin", code: "BJ", x: 84.5, y: 61.0 },
    { name: "Burkina Faso", code: "BF", x: 80.5, y: 58.1 },
    { name: "Niger", code: "NE", x: 88.3, y: 55.7 },
    { name: "Nigeria", code: "NG", x: 89.8, y: 61.5 },
    { name: "Cameroon", code: "CM", x: 92.2, y: 65.4 },
    { name: "Chad", code: "TD", x: 95.7, y: 58.1 },
    { name: "Central African Republic", code: "CF", x: 99.2, y: 64.0 },
    { name: "Equatorial Guinea", code: "GQ", x: 89.3, y: 70.3 },
    { name: "Gabon", code: "GA", x: 91.8, y: 72.7 },
    { name: "Republic of the Congo", code: "CG", x: 95.7, y: 75.2 },
    { name: "Democratic Republic of the Congo", code: "CD", x: 102.0, y: 74.2 },
    
    // BATCH 7: Africa - East/South
    { name: "South Sudan", code: "SS", x: 106.0, y: 62.5 },
    { name: "Sudan", code: "SD", x: 103.5, y: 55.2 },
    { name: "Eritrea", code: "ER", x: 110.9, y: 54.2 },
    { name: "Djibouti", code: "DJ", x: 113.3, y: 57.1 },
    { name: "Ethiopia", code: "ET", x: 111.9, y: 61.0 },
    { name: "Somalia", code: "SO", x: 118.1, y: 66.4 },
    { name: "Uganda", code: "UG", x: 105.5, y: 68.4 },
    { name: "Kenya", code: "KE", x: 109.8, y: 71.8 },
    { name: "Rwanda", code: "RW", x: 106.8, y: 71.8 },
    { name: "Burundi", code: "BI", x: 108.3, y: 74.2 },
    { name: "Tanzania", code: "TZ", x: 110.9, y: 77.1 },
    { name: "Angola", code: "AO", x: 95.7, y: 81.5 },
    { name: "Zambia", code: "ZM", x: 103.5, y: 82.0 },
    { name: "Malawi", code: "MW", x: 109.8, y: 83.5 },
    { name: "Mozambique", code: "MZ", x: 114.3, y: 87.0 },
    { name: "Zimbabwe", code: "ZW", x: 106.4, y: 86.5 },
    { name: "Botswana", code: "BW", x: 100.5, y: 90.8 },
    { name: "Namibia", code: "NA", x: 91.8, y: 88.4 },
    { name: "South Africa", code: "ZA", x: 102.5, y: 96.2 },
    { name: "Lesotho", code: "LS", x: 106.4, y: 97.2 },
    { name: "Eswatini", code: "SZ", x: 109.4, y: 94.7 },
    { name: "Madagascar", code: "MG", x: 128.1, y: 87.9 },
    { name: "Comoros", code: "KM", x: 121.6, y: 81.1 },
    { name: "Seychelles", code: "SC", x: 128.1, y: 74.2 },
    { name: "Mauritius", code: "MU", x: 130.3, y: 87.9 },
    
    // BATCH 8: Middle East
    { name: "Saudi Arabia", code: "SA", x: 110.4, y: 48.8 },
    { name: "Yemen", code: "YE", x: 115.2, y: 57.6 },
    { name: "Oman", code: "OM", x: 123.0, y: 55.1 },
    { name: "United Arab Emirates", code: "AE", x: 119.1, y: 48.8 },
    { name: "Qatar", code: "QA", x: 115.7, y: 47.4 },
    { name: "Bahrain", code: "BH", x: 117.2, y: 48.3 },
    { name: "Kuwait", code: "KW", x: 113.8, y: 46.0 },
    { name: "Iraq", code: "IQ", x: 109.4, y: 43.5 },
    { name: "Iran", code: "IR", x: 117.2, y: 42.0 },
    { name: "Syria", code: "SY", x: 104.0, y: 42.0 },
    { name: "Lebanon", code: "LB", x: 101.6, y: 41.5 },
    { name: "Israel", code: "IL", x: 100.6, y: 44.0 },
    { name: "Jordan", code: "JO", x: 104.7, y: 45.4 },
    { name: "Palestine", code: "PS", x: 101.0, y: 43.5 },
    { name: "Afghanistan", code: "AF", x: 114.3, y: 38.1 },
    { name: "Sri Lanka", code: "LK", x: 125.9, y: 59.6 },
    { name: "Maldives", code: "MV", x: 118.1, y: 67.4 },
    
    // BATCH 9: Caribbean & Central America
    { name: "Cuba", code: "CU", x: 35.6, y: 45.9 },
    { name: "Jamaica", code: "JM", x: 39.5, y: 49.3 },
    { name: "Haiti", code: "HT", x: 43.4, y: 45.9 },
    { name: "Dominican Republic", code: "DO", x: 46.4, y: 45.9 },
    { name: "Bahamas", code: "BS", x: 38.6, y: 41.5 },
    { name: "Belize", code: "BZ", x: 28.8, y: 45.9 },
    { name: "Guatemala", code: "GT", x: 26.8, y: 47.4 },
    { name: "Honduras", code: "HN", x: 31.3, y: 48.3 },
    { name: "El Salvador", code: "SV", x: 29.3, y: 50.3 },
    { name: "Nicaragua", code: "NI", x: 33.2, y: 51.3 },
    { name: "Costa Rica", code: "CR", x: 34.7, y: 54.2 },
    { name: "Panama", code: "PA", x: 38.1, y: 54.7 },
    { name: "Trinidad and Tobago", code: "TT", x: 52.3, y: 50.8 },
    { name: "Barbados", code: "BB", x: 54.7, y: 48.8 },
    { name: "Saint Lucia", code: "LC", x: 50.8, y: 47.4 },
    { name: "Grenada", code: "GD", x: 51.8, y: 50.3 },
    
    // BATCH 10: Small Countries & Islands
    { name: "Luxembourg", code: "LU", x: 76.6, y: 28.8 },
    { name: "Liechtenstein", code: "LI", x: 79.1, y: 33.2 },
    { name: "Monaco", code: "MC", x: 76.8, y: 35.2 },
    { name: "San Marino", code: "SM", x: 82.4, y: 38.6 },
    { name: "Vatican City", code: "VA", x: 81.5, y: 38.1 },
    { name: "Andorra", code: "AD", x: 71.9, y: 32.2 },
    { name: "Malta", code: "MT", x: 87.9, y: 45.0 },
    { name: "Kosovo", code: "XK", x: 88.9, y: 38.1 },
    { name: "Cape Verde", code: "CV", x: 60.5, y: 50.8 }
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