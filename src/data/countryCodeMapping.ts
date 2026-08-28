/**
 * Complete mapping from country names to ISO 2-letter country codes
 * This handles all 130 countries in the coordinate data
 */
export const countryCodeMapping: Record<string, string> = {
  // North America
  "Canada": "ca",
  "United States of America": "us",
  "Mexico": "mx",
  "Greenland": "gl",

  // South America
  "Brazil": "br",
  "Argentina": "ar",
  "Chile": "cl",
  "Peru": "pe",
  "Colombia": "co",
  "Venezuela": "ve",
  "Ecuador": "ec",
  "Bolivia": "bo",
  "Paraguay": "py",
  "Uruguay": "uy",
  "Guyana": "gy",
  "Suriname": "sr",
  "French Guiana": "gf",

  // Europe - Western
  "Iceland": "is",
  "Ireland": "ie",
  "United Kingdom": "gb",
  "Portugal": "pt",
  "Spain": "es",
  "France": "fr",
  "Belgium": "be",
  "Netherlands": "nl",
  "Germany": "de",
  "Denmark": "dk",
  "Norway": "no",
  "Sweden": "se",
  "Finland": "fi",
  "Switzerland": "ch",
  "Austria": "at",
  "Italy": "it",

  // Europe - Central & Eastern
  "Poland": "pl",
  "Czech Republic": "cz",
  "Slovenia": "si",
  "Croatia": "hr",
  "Bosnia and Herzegovina": "ba",
  "Serbia": "rs",
  "Montenegro": "me",
  "Albania": "al",
  "North Macedonia": "mk",
  "Greece": "gr",
  "Romania": "ro",
  "Bulgaria": "bg",
  "Moldova": "md",
  "Ukraine": "ua",
  "Belarus": "by",
  "Lithuania": "lt",
  "Latvia": "lv",
  "Estonia": "ee",

  // Asia - Western & Central
  "Russia": "ru",
  "Turkey": "tr",
  "Cyprus": "cy",
  "Georgia": "ge",
  "Armenia": "am",
  "Azerbaijan": "az",
  "Kazakhstan": "kz",
  "Turkmenistan": "tm",
  "Uzbekistan": "uz",
  "Kyrgyzstan": "kg",
  "Tajikistan": "tj",

  // Asia - Eastern
  "Mongolia": "mn",
  "China": "cn",
  "North Korea": "kp",
  "South Korea": "kr",
  "Japan": "jp",
  "Taiwan": "tw",

  // Asia - Southern
  "India": "in",
  "Pakistan": "pk",
  "Nepal": "np",
  "Bhutan": "bt",
  "Bangladesh": "bd",

  // Asia - Southeastern
  "Myanmar": "mm",
  "Thailand": "th",
  "Laos": "la",
  "Cambodia": "kh",
  "Vietnam": "vn",
  "Malaysia": "my",
  "Singapore": "sg",
  "Indonesia": "id",
  "Brunei": "bn",
  "Philippines": "ph",
  "Timor-Leste": "tl",

  // Oceania
  "Papua New Guinea": "pg",
  "Australia": "au",
  "New Zealand": "nz",

  // Africa - Northern
  "Morocco": "ma",
  "Algeria": "dz",
  "Tunisia": "tn",
  "Libya": "ly",
  "Egypt": "eg",
  "Western Sahara": "eh",

  // Africa - Western
  "Mauritania": "mr",
  "Mali": "ml",
  "Senegal": "sn",
  "The Gambia": "gm",
  "Guinea-Bissau": "gw",
  "Guinea": "gn",
  "Sierra Leone": "sl",
  "Liberia": "lr",
  "Côte d'Ivoire": "ci",
  "Ghana": "gh",
  "Togo": "tg",
  "Benin": "bj",
  "Burkina Faso": "bf",
  "Niger": "ne",
  "Nigeria": "ng",

  // Africa - Central
  "Cameroon": "cm",
  "Chad": "td",
  "Central African Republic": "cf",
  "Equatorial Guinea": "gq",
  "Gabon": "ga",
  "Republic of the Congo": "cg",
  "Democratic Republic of the Congo": "cd",

  // Africa - Eastern
  "South Sudan": "ss",
  "Sudan": "sd",
  "Eritrea": "er",
  "Djibouti": "dj",
  "Ethiopia": "et",
  "Somalia": "so",
  "Uganda": "ug",
  "Kenya": "ke",
  "Rwanda": "rw",
  "Burundi": "bi",
  "Tanzania": "tz",

  // Africa - Southern
  "Angola": "ao",
  "Zambia": "zm",
  "Malawi": "mw",
  "Mozambique": "mz",
  "Zimbabwe": "zw",
  "Botswana": "bw",
  "Namibia": "na",
  "South Africa": "za",
  "Lesotho": "ls",
  "Eswatini": "sz",
  "Madagascar": "mg",
  "Comoros": "km",
  "Seychelles": "sc",
  "Mauritius": "mu"
};

/**
 * Get country code for a given country name
 * @param countryName - Full country name
 * @returns 2-letter ISO country code or fallback
 */
export const getCountryCode = (countryName: string): string => {
  const code = countryCodeMapping[countryName];
  if (code) {
    return code;
  }
  
  // Fallback: create code from country name
  console.warn(`No country code mapping found for: ${countryName}`);
  return countryName.toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(' ')
    .slice(0, 2)
    .map(word => word.charAt(0))
    .join('');
};

/**
 * Validate that all countries in coordinate data have country code mappings
 * @param countryNames - Array of country names to validate
 * @returns Object with validation results
 */
export const validateCountryCodeMappings = (countryNames: string[]) => {
  const missing: string[] = [];
  const present: string[] = [];
  
  countryNames.forEach(name => {
    if (countryCodeMapping[name]) {
      present.push(name);
    } else {
      missing.push(name);
    }
  });
  
  return {
    total: countryNames.length,
    present: present.length,
    missing: missing.length,
    missingCountries: missing,
    coverage: ((present.length / countryNames.length) * 100).toFixed(1)
  };
};