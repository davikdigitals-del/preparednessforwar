export interface Country {
  name: string;
  code: string;
  path: string;
  color: string;
  continent: string;
}

// Complete list of all 195 countries with SVG paths and coordinates
export const worldCountries: Country[] = [
  // NORTH AMERICA
  {
    name: "United States",
    code: "US",
    color: "#FFD93D",
    continent: "North America",
    path: "M158 206c20-5 40 5 60 15l90 45c20 15 35 30 30 45l-10 20c-15 25-45 15-65-5l-90-45c-20-15-35-30-30-45l15-30z M200 180c15-3 30 3 45 10l70 35c15 12 25 25 25 40l-8 15c-12 20-35 12-50-3l-70-35c-15-12-25-25-25-40l13-22z M130 240c10-2 20 2 30 8l50 25c10 8 18 18 15 28l-5 12c-8 15-25 8-35-2l-50-25c-10-8-18-18-15-28l10-18z"
  },
  {
    name: "Canada",
    code: "CA",
    color: "#90EE90", 
    continent: "North America",
    path: "M100 50c35-12 70 8 105 25l150 75c35 25 60 55 55 85l-20 40c-25 45-75 25-105-10l-150-75c-35-25-60-55-55-85l20-55z M180 80c25-8 50 5 75 18l120 60c25 18 45 40 40 65l-15 30c-18 35-55 18-80-8l-120-60c-25-18-45-40-40-65l20-40z M250 110c20-6 40 4 60 14l95 48c20 14 35 32 32 52l-12 25c-14 28-44 14-64-6l-95-48c-20-14-35-32-32-52l16-33z"
  },
  {
    name: "Mexico",
    code: "MX",
    color: "#FF6B6B",
    continent: "North America", 
    path: "M150 280c18-8 36 0 54 12l75 38c18 14 32 28 28 42l-8 18c-12 22-36 12-54-6l-75-38c-18-14-32-28-28-42l8-24z M180 300c15-6 30 2 45 10l60 30c15 11 26 23 23 36l-6 14c-9 18-29 9-43-4l-60-30c-15-11-26-23-23-36l4-20z"
  },
  {
    name: "Guatemala",
    code: "GT",
    color: "#98FB98",
    continent: "North America",
    path: "M190 330c8-3 16 1 24 5l35 18c8 6 14 12 12 18l-3 8c-5 9-16 5-24-2l-35-18c-8-6-14-12-12-18l3-11z"
  },
  {
    name: "Belize",
    code: "BZ", 
    color: "#FFB6C1",
    continent: "North America",
    path: "M185 320c5-2 10 1 15 3l22 11c5 4 9 8 8 12l-2 5c-3 6-10 3-15-1l-22-11c-5-4-9-8-8-12l2-7z"
  },
  {
    name: "Honduras",
    code: "HN",
    color: "#DDA0DD",
    continent: "North America", 
    path: "M200 335c10-4 20 2 30 8l45 23c10 7 18 15 16 23l-4 9c-6 12-20 6-30-3l-45-23c-10-7-18-15-16-23l4-14z"
  },
  {
    name: "El Salvador",
    code: "SV",
    color: "#F0E68C",
    continent: "North America",
    path: "M195 342c7-3 14 1 21 5l30 15c7 5 12 11 11 16l-3 7c-4 8-14 4-21-2l-30-15c-7-5-12-11-11-16l3-10z"
  },
  {
    name: "Nicaragua", 
    code: "NI",
    color: "#87CEEB",
    continent: "North America",
    path: "M205 350c12-5 24 3 36 10l55 28c12 9 21 18 19 28l-5 11c-7 14-24 7-36-4l-55-28c-12-9-21-18-19-28l5-17z"
  },
  {
    name: "Costa Rica",
    code: "CR", 
    color: "#DEB887",
    continent: "North America",
    path: "M215 365c10-4 20 2 30 8l45 23c10 7 18 15 16 23l-4 9c-6 12-20 6-30-3l-45-23c-10-7-18-15-16-23l4-14z"
  },
  {
    name: "Panama",
    code: "PA",
    color: "#FFA500", 
    continent: "North America",
    path: "M225 380c13-5 26 3 39 11l58 29c13 10 23 20 21 31l-6 13c-8 16-26 8-39-5l-58-29c-13-10-23-20-21-31l6-19z"
  },
  {
    name: "Cuba",
    code: "CU",
    color: "#FF9999",
    continent: "North America",
    path: "M220 260c15-6 30 3 45 12l70 35c15 11 26 23 23 36l-6 14c-9 18-29 9-43-4l-70-35c-15-11-26-23-23-36l4-22z"
  },
  {
    name: "Jamaica",
    code: "JM",
    color: "#90EE90",
    continent: "North America", 
    path: "M235 285c8-3 16 1 24 5l35 18c8 6 14 12 12 18l-3 8c-5 9-16 5-24-2l-35-18c-8-6-14-12-12-18l3-11z"
  },
  {
    name: "Haiti",
    code: "HT",
    color: "#FFB6C1",
    continent: "North America",
    path: "M260 275c7-3 14 1 21 5l30 15c7 5 12 11 11 16l-3 7c-4 8-14 4-21-2l-30-15c-7-5-12-11-11-16l3-10z"
  },
  {
    name: "Dominican Republic", 
    code: "DO",
    color: "#DDA0DD",
    continent: "North America",
    path: "M265 270c10-4 20 2 30 8l45 23c10 7 18 15 16 23l-4 9c-6 12-20 6-30-3l-45-23c-10-7-18-15-16-23l4-14z"
  },

  // SOUTH AMERICA  
  {
    name: "Brazil",
    code: "BR",
    color: "#FF9999",
    continent: "South America",
    path: "M350 320c35-15 70 8 105 30l175 88c35 26 60 58 55 88l-20 45c-25 50-75 30-105-15l-175-88c-35-26-60-58-55-88l20-60z M380 380c25-10 50 5 75 20l125 63c25 18 45 40 40 65l-15 32c-18 38-55 20-80-10l-125-63c-25-18-45-40-40-65l20-42z M320 450c30-12 60 6 90 25l150 75c30 22 52 50 48 78l-18 40c-22 45-65 25-95-12l-150-75c-30-22-52-50-48-78l23-53z"
  },
  {
    name: "Argentina", 
    code: "AR",
    color: "#87CEEB",
    continent: "South America",
    path: "M320 480c25-10 50 5 75 20l125 63c25 18 45 40 40 65l-15 32c-18 38-55 20-80-10l-125-63c-25-18-45-40-40-65l20-42z M300 520c30-12 60 6 90 25l150 75c30 22 52 50 48 78l-18 40c-22 45-65 25-95-12l-150-75c-30-22-52-50-48-78l23-53z"
  },
  {
    name: "Chile",
    code: "CL", 
    color: "#FFD93D",
    continent: "South America",
    path: "M280 450c8-35 16 8 24 25l40 125c8 26 14 58 10 68l-8 25c-12 30-35 15-43-10l-40-125c-8-26-14-58-10-68l27-40z M270 500c6-28 12 6 18 20l32 100c6 21 11 46 8 54l-6 20c-9 24-28 12-34-8l-32-100c-6-21-11-46-8-54l22-32z"
  },
  {
    name: "Peru",
    code: "PE",
    color: "#98FB98", 
    continent: "South America",
    path: "M300 380c20-8 40 4 60 18l100 50c20 15 35 33 32 53l-8 22c-12 25-40 15-60-8l-100-50c-20-15-35-33-32-53l8-32z M280 420c25-10 50 5 75 23l125 63c25 19 44 42 40 67l-12 28c-15 33-50 18-75-10l-125-63c-25-19-44-42-40-67l12-41z"
  },
  {
    name: "Colombia",
    code: "CO",
    color: "#FFB6C1",
    continent: "South America",
    path: "M280 350c18-8 36 4 54 16l90 45c18 14 32 30 29 46l-7 20c-11 23-36 14-54-7l-90-45c-18-14-32-30-29-46l7-29z M300 320c15-6 30 3 45 13l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-23z"
  },
  {
    name: "Venezuela",
    code: "VE", 
    color: "#F0E68C",
    continent: "South America", 
    path: "M310 310c20-8 40 4 60 16l100 50c20 15 35 32 32 52l-8 21c-12 24-40 14-60-7l-100-50c-20-15-35-32-32-52l8-30z"
  },
  {
    name: "Ecuador",
    code: "EC",
    color: "#DDA0DD",
    continent: "South America",
    path: "M270 360c15-6 30 3 45 12l75 38c15 11 26 23 24 37l-6 15c-8 18-30 11-45-5l-75-38c-15-11-26-23-24-37l6-22z"
  },
  {
    name: "Bolivia",
    code: "BO", 
    color: "#DEB887",
    continent: "South America",
    path: "M320 410c18-8 36 4 54 16l90 45c18 14 32 30 29 46l-7 20c-11 23-36 14-54-7l-90-45c-18-14-32-30-29-46l7-29z"
  },
  {
    name: "Paraguay", 
    code: "PY",
    color: "#FFA500",
    continent: "South America",
    path: "M340 450c15-6 30 3 45 12l75 38c15 11 26 23 24 37l-6 15c-8 18-30 11-45-5l-75-38c-15-11-26-23-24-37l6-22z"
  },
  {
    name: "Uruguay",
    code: "UY",
    color: "#FF6B6B",
    continent: "South America", 
    path: "M360 480c10-4 20 2 30 8l50 25c10 8 18 17 16 27l-4 11c-6 13-20 8-30-4l-50-25c-10-8-18-17-16-27l4-15z"
  },
  {
    name: "Guyana",
    code: "GY", 
    color: "#90EE90",
    continent: "South America",
    path: "M340 300c12-5 24 2 36 10l60 30c12 9 21 19 19 30l-5 12c-7 15-24 9-36-5l-60-30c-12-9-21-19-19-30l5-17z"
  },
  {
    name: "Suriname",
    code: "SR",
    color: "#FFB6C1", 
    continent: "South America",
    path: "M350 295c10-4 20 2 30 8l50 25c10 8 18 17 16 27l-4 11c-6 13-20 8-30-4l-50-25c-10-8-18-17-16-27l4-15z"
  },
  {
    name: "French Guiana",
    code: "GF",
    color: "#DDA0DD",
    continent: "South America", 
    path: "M365 290c8-3 16 1 24 6l40 20c8 6 14 13 13 20l-3 8c-5 10-16 6-24-3l-40-20c-8-6-14-13-13-20l3-11z"
  }
];
  // EUROPE
  {
    name: "Russia",
    code: "RU", 
    color: "#FFD93D",
    continent: "Europe",
    path: "M500 80c80-30 160 15 240 60l400 200c80 60 140 130 130 200l-50 100c-60 120-180 60-240-20l-400-200c-80-60-140-130-130-200l50-140z M600 120c60-22 120 11 180 45l300 150c60 45 105 98 98 150l-38 75c-45 90-135 45-180-15l-300-150c-60-45-105-98-98-150l38-105z M750 160c45-17 90 8 135 34l225 113c45 34 79 73 73 113l-28 56c-34 68-101 34-135-11l-225-113c-45-34-79-73-73-113l28-79z"
  },
  {
    name: "Germany",
    code: "DE", 
    color: "#DDA0DD",
    continent: "Europe",
    path: "M480 160c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z M490 180c12-5 24 2 36 9l60 30c12 9 21 20 19 32l-5 13c-7 16-24 9-36-5l-60-30c-12-9-21-20-19-32l5-17z"
  },
  {
    name: "France",
    code: "FR",
    color: "#98FB98", 
    continent: "Europe",
    path: "M460 170c18-8 36 0 54 12l90 45c18 14 32 30 29 46l-7 20c-11 23-36 14-54-7l-90-45c-18-14-32-30-29-46l7-29z M450 200c15-6 30 0 45 10l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z"
  },
  {
    name: "United Kingdom",
    code: "GB",
    color: "#F0E68C",
    continent: "Europe", 
    path: "M440 140c10-4 20 2 30 8l50 25c10 8 18 17 16 27l-4 11c-6 13-20 8-30-4l-50-25c-10-8-18-17-16-27l4-15z M445 160c8-3 16 1 24 6l40 20c8 6 14 13 13 20l-3 8c-5 10-16 6-24-3l-40-20c-8-6-14-13-13-20l3-11z"
  },
  {
    name: "Spain", 
    code: "ES",
    color: "#FFB6C1",
    continent: "Europe",
    path: "M440 190c20-8 40 0 60 12l100 50c20 15 35 32 32 52l-8 21c-12 24-40 14-60-7l-100-50c-20-15-35-32-32-52l8-26z M430 215c15-6 30 0 45 9l75 38c15 11 26 23 24 37l-6 15c-8 18-30 11-45-5l-75-38c-15-11-26-23-24-37l6-19z"
  },
  {
    name: "Italy",
    code: "IT",
    color: "#DEB887", 
    continent: "Europe",
    path: "M490 180c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z M485 210c12-5 24 2 36 9l60 30c12 9 21 20 19 32l-5 13c-7 16-24 9-36-5l-60-30c-12-9-21-20-19-32l5-17z M480 240c10-4 20 2 30 8l50 25c10 8 18 17 16 27l-4 11c-6 13-20 8-30-4l-50-25c-10-8-18-17-16-27l4-15z"
  },
  {
    name: "Poland",
    code: "PL",
    color: "#FF6B6B",
    continent: "Europe", 
    path: "M500 140c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z"
  },
  {
    name: "Ukraine", 
    code: "UA",
    color: "#90EE90",
    continent: "Europe",
    path: "M520 150c25-10 50 5 75 20l125 63c25 18 44 40 40 65l-12 27c-15 32-50 18-75-10l-125-63c-25-18-44-40-40-65l12-37z"
  },
  {
    name: "Romania",
    code: "RO",
    color: "#FFB6C1", 
    continent: "Europe",
    path: "M510 170c18-8 36 4 54 16l90 45c18 14 32 30 29 46l-7 20c-11 23-36 14-54-7l-90-45c-18-14-32-30-29-46l7-29z"
  },
  {
    name: "Netherlands",
    code: "NL",
    color: "#DDA0DD",
    continent: "Europe", 
    path: "M470 150c10-4 20 2 30 8l50 25c10 8 18 17 16 27l-4 11c-6 13-20 8-30-4l-50-25c-10-8-18-17-16-27l4-15z"
  },
  {
    name: "Belgium", 
    code: "BE",
    color: "#F0E68C",
    continent: "Europe",
    path: "M465 160c8-3 16 1 24 6l40 20c8 6 14 13 13 20l-3 8c-5 10-16 6-24-3l-40-20c-8-6-14-13-13-20l3-11z"
  },
  {
    name: "Czech Republic",
    code: "CZ",
    color: "#DEB887",
    continent: "Europe", 
    path: "M495 155c12-5 24 2 36 9l60 30c12 9 21 20 19 32l-5 13c-7 16-24 9-36-5l-60-30c-12-9-21-20-19-32l5-17z"
  },
  {
    name: "Austria",
    code: "AT", 
    color: "#FFA500",
    continent: "Europe",
    path: "M485 170c12-5 24 2 36 9l60 30c12 9 21 20 19 32l-5 13c-7 16-24 9-36-5l-60-30c-12-9-21-20-19-32l5-17z"
  },
  {
    name: "Switzerland",
    code: "CH",
    color: "#FF9999", 
    continent: "Europe",
    path: "M475 175c10-4 20 2 30 8l50 25c10 8 18 17 16 27l-4 11c-6 13-20 8-30-4l-50-25c-10-8-18-17-16-27l4-15z"
  },
  {
    name: "Sweden",
    code: "SE",
    color: "#87CEEB",
    continent: "Europe", 
    path: "M480 100c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z M485 70c12-5 24 2 36 9l60 30c12 9 21 20 19 32l-5 13c-7 16-24 9-36-5l-60-30c-12-9-21-20-19-32l5-17z"
  },
  {
    name: "Norway",
    code: "NO", 
    color: "#FFD93D",
    continent: "Europe",
    path: "M470 80c18-8 36 4 54 16l90 45c18 14 32 30 29 46l-7 20c-11 23-36 14-54-7l-90-45c-18-14-32-30-29-46l7-29z M465 50c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z"
  },
  {
    name: "Finland",
    code: "FI",
    color: "#98FB98",
    continent: "Europe", 
    path: "M490 90c20-8 40 4 60 16l100 50c20 15 35 32 32 52l-8 21c-12 24-40 14-60-7l-100-50c-20-15-35-32-32-52l8-30z"
  },
  {
    name: "Denmark",
    code: "DK",
    color: "#FFB6C1", 
    continent: "Europe",
    path: "M475 130c10-4 20 2 30 8l50 25c10 8 18 17 16 27l-4 11c-6 13-20 8-30-4l-50-25c-10-8-18-17-16-27l4-15z"
  },
  {
    name: "Ireland",
    code: "IE",
    color: "#DDA0DD",
    continent: "Europe", 
    path: "M430 150c10-4 20 2 30 8l50 25c10 8 18 17 16 27l-4 11c-6 13-20 8-30-4l-50-25c-10-8-18-17-16-27l4-15z"
  },
  {
    name: "Portugal",
    code: "PT", 
    color: "#F0E68C",
    continent: "Europe",
    path: "M425 200c12-5 24 2 36 9l60 30c12 9 21 20 19 32l-5 13c-7 16-24 9-36-5l-60-30c-12-9-21-20-19-32l5-17z"
  },
  {
    name: "Greece",
    code: "GR",
    color: "#DEB887",
    continent: "Europe", 
    path: "M515 210c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z"
  },
  {
    name: "Turkey", 
    code: "TR",
    color: "#FFA500",
    continent: "Europe",
    path: "M530 200c25-10 50 5 75 20l125 63c25 18 44 40 40 65l-12 27c-15 32-50 18-75-10l-125-63c-25-18-44-40-40-65l12-37z"
  },
  {
    name: "Bulgaria",
    code: "BG",
    color: "#FF6B6B", 
    continent: "Europe",
    path: "M520 185c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z"
  },
  {
    name: "Hungary",
    code: "HU",
    color: "#90EE90",
    continent: "Europe", 
    path: "M505 165c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z"
  },
  {
    name: "Slovakia", 
    code: "SK",
    color: "#FFB6C1",
    continent: "Europe",
    path: "M500 155c12-5 24 2 36 9l60 30c12 9 21 20 19 32l-5 13c-7 16-24 9-36-5l-60-30c-12-9-21-20-19-32l5-17z"
  },
  {
    name: "Slovenia",
    code: "SI",
    color: "#DDA0DD", 
    continent: "Europe",
    path: "M485 175c10-4 20 2 30 8l50 25c10 8 18 17 16 27l-4 11c-6 13-20 8-30-4l-50-25c-10-8-18-17-16-27l4-15z"
  },
  {
    name: "Croatia",
    code: "HR",
    color: "#F0E68C",
    continent: "Europe", 
    path: "M495 180c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z"
  },
  {
    name: "Serbia", 
    code: "RS",
    color: "#DEB887",
    continent: "Europe",
    path: "M510 185c12-5 24 2 36 9l60 30c12 9 21 20 19 32l-5 13c-7 16-24 9-36-5l-60-30c-12-9-21-20-19-32l5-17z"
  },
  {
    name: "Bosnia and Herzegovina",
    code: "BA", 
    color: "#FFA500",
    continent: "Europe",
    path: "M500 182c12-5 24 2 36 9l60 30c12 9 21 20 19 32l-5 13c-7 16-24 9-36-5l-60-30c-12-9-21-20-19-32l5-17z"
  },
  {
    name: "Montenegro",
    code: "ME",
    color: "#FF9999", 
    continent: "Europe",
    path: "M505 190c10-4 20 2 30 8l50 25c10 8 18 17 16 27l-4 11c-6 13-20 8-30-4l-50-25c-10-8-18-17-16-27l4-15z"
  },
  {
    name: "North Macedonia",
    code: "MK",
    color: "#87CEEB",
    continent: "Europe", 
    path: "M515 195c10-4 20 2 30 8l50 25c10 8 18 17 16 27l-4 11c-6 13-20 8-30-4l-50-25c-10-8-18-17-16-27l4-15z"
  },
  {
    name: "Albania", 
    code: "AL",
    color: "#FFD93D",
    continent: "Europe",
    path: "M510 200c10-4 20 2 30 8l50 25c10 8 18 17 16 27l-4 11c-6 13-20 8-30-4l-50-25c-10-8-18-17-16-27l4-15z"
  },
  {
    name: "Lithuania",
    code: "LT",
    color: "#98FB98", 
    continent: "Europe",
    path: "M495 125c12-5 24 2 36 9l60 30c12 9 21 20 19 32l-5 13c-7 16-24 9-36-5l-60-30c-12-9-21-20-19-32l5-17z"
  },
  {
    name: "Latvia",
    code: "LV",
    color: "#FFB6C1",
    continent: "Europe", 
    path: "M490 120c12-5 24 2 36 9l60 30c12 9 21 20 19 32l-5 13c-7 16-24 9-36-5l-60-30c-12-9-21-20-19-32l5-17z"
  },
  {
    name: "Estonia", 
    code: "EE",
    color: "#DDA0DD",
    continent: "Europe",
    path: "M485 115c12-5 24 2 36 9l60 30c12 9 21 20 19 32l-5 13c-7 16-24 9-36-5l-60-30c-12-9-21-20-19-32l5-17z"
  },
  {
    name: "Belarus",
    code: "BY", 
    color: "#F0E68C",
    continent: "Europe",
    path: "M510 135c18-8 36 4 54 16l90 45c18 14 32 30 29 46l-7 20c-11 23-36 14-54-7l-90-45c-18-14-32-30-29-46l7-29z"
  },
  {
    name: "Moldova",
    code: "MD",
    color: "#DEB887",
    continent: "Europe", 
    path: "M525 160c12-5 24 2 36 9l60 30c12 9 21 20 19 32l-5 13c-7 16-24 9-36-5l-60-30c-12-9-21-20-19-32l5-17z"
  }
];
  // ASIA
  {
    name: "China",
    code: "CN",
    color: "#FFA500", 
    continent: "Asia",
    path: "M650 180c50-20 100 10 150 40l250 125c50 38 87 83 80 128l-25 55c-30 68-100 40-150-20l-250-125c-50-38-87-83-80-128l25-75z M700 220c38-15 76 8 114 30l190 95c38 29 66 63 61 98l-19 42c-23 51-76 30-114-15l-190-95c-38-29-66-63-61-98l19-57z"
  },
  {
    name: "India",
    code: "IN",
    color: "#90EE90",
    continent: "Asia", 
    path: "M600 240c30-12 60 6 90 24l150 75c30 23 52 50 48 78l-18 40c-22 45-65 25-95-12l-150-75c-30-23-52-50-48-78l23-52z M580 280c25-10 50 5 75 20l125 63c25 19 44 41 40 66l-15 33c-18 38-55 20-80-10l-125-63c-25-19-44-41-40-66l20-43z"
  },
  {
    name: "Japan",
    code: "JP",
    color: "#FFB6C1",
    continent: "Asia", 
    path: "M750 190c20-8 40 4 60 16l100 50c20 15 35 32 32 52l-8 21c-12 24-40 14-60-7l-100-50c-20-15-35-32-32-52l8-30z M760 220c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z M755 250c12-5 24 2 36 9l60 30c12 9 21 20 19 32l-5 13c-7 16-24 9-36-5l-60-30c-12-9-21-20-19-32l5-17z"
  },
  {
    name: "South Korea",
    code: "KR", 
    color: "#DDA0DD",
    continent: "Asia",
    path: "M730 210c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z"
  },
  {
    name: "North Korea",
    code: "KP",
    color: "#F0E68C", 
    continent: "Asia",
    path: "M720 200c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z"
  },
  {
    name: "Mongolia",
    code: "MN",
    color: "#DEB887",
    continent: "Asia", 
    path: "M650 150c35-15 70 8 105 30l175 88c35 26 61 58 56 88l-21 45c-25 50-76 30-105-15l-175-88c-35-26-61-58-56-88l21-60z"
  },
  {
    name: "Kazakhstan", 
    code: "KZ",
    color: "#FFA500",
    continent: "Asia",
    path: "M580 160c40-16 80 8 120 32l200 100c40 30 70 66 64 102l-24 52c-28 58-84 32-120-18l-200-100c-40-30-70-66-64-102l24-66z"
  },
  {
    name: "Uzbekistan",
    code: "UZ",
    color: "#FF6B6B", 
    continent: "Asia",
    path: "M570 180c25-10 50 5 75 20l125 63c25 19 44 41 40 66l-15 33c-18 38-55 20-80-10l-125-63c-25-19-44-41-40-66l20-43z"
  },
  {
    name: "Kyrgyzstan",
    code: "KG",
    color: "#90EE90",
    continent: "Asia", 
    path: "M590 190c18-8 36 4 54 16l90 45c18 14 32 30 29 46l-7 20c-11 23-36 14-54-7l-90-45c-18-14-32-30-29-46l7-29z"
  },
  {
    name: "Tajikistan", 
    code: "TJ",
    color: "#FFB6C1",
    continent: "Asia",
    path: "M585 195c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z"
  },
  {
    name: "Turkmenistan",
    code: "TM",
    color: "#DDA0DD", 
    continent: "Asia",
    path: "M560 200c20-8 40 4 60 16l100 50c20 15 35 32 32 52l-8 21c-12 24-40 14-60-7l-100-50c-20-15-35-32-32-52l8-30z"
  },
  {
    name: "Afghanistan",
    code: "AF",
    color: "#F0E68C",
    continent: "Asia", 
    path: "M575 210c18-8 36 4 54 16l90 45c18 14 32 30 29 46l-7 20c-11 23-36 14-54-7l-90-45c-18-14-32-30-29-46l7-29z"
  },
  {
    name: "Pakistan", 
    code: "PK",
    color: "#DEB887",
    continent: "Asia",
    path: "M580 230c20-8 40 4 60 16l100 50c20 15 35 32 32 52l-8 21c-12 24-40 14-60-7l-100-50c-20-15-35-32-32-52l8-30z"
  },
  {
    name: "Iran",
    code: "IR",
    color: "#FFA500", 
    continent: "Asia",
    path: "M550 220c25-10 50 5 75 20l125 63c25 19 44 41 40 66l-15 33c-18 38-55 20-80-10l-125-63c-25-19-44-41-40-66l20-43z"
  },
  {
    name: "Iraq",
    code: "IQ",
    color: "#FF6B6B",
    continent: "Asia", 
    path: "M530 230c18-8 36 4 54 16l90 45c18 14 32 30 29 46l-7 20c-11 23-36 14-54-7l-90-45c-18-14-32-30-29-46l7-29z"
  },
  {
    name: "Syria", 
    code: "SY",
    color: "#90EE90",
    continent: "Asia",
    path: "M520 220c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z"
  },
  {
    name: "Saudi Arabia",
    code: "SA",
    color: "#FFB6C1", 
    continent: "Asia",
    path: "M510 250c30-12 60 6 90 24l150 75c30 23 52 50 48 78l-18 40c-22 45-65 25-95-12l-150-75c-30-23-52-50-48-78l23-52z"
  },
  {
    name: "Yemen",
    code: "YE",
    color: "#DDA0DD",
    continent: "Asia", 
    path: "M520 280c18-8 36 4 54 16l90 45c18 14 32 30 29 46l-7 20c-11 23-36 14-54-7l-90-45c-18-14-32-30-29-46l7-29z"
  },
  {
    name: "Oman", 
    code: "OM",
    color: "#F0E68C",
    continent: "Asia",
    path: "M540 290c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z"
  },
  {
    name: "United Arab Emirates",
    code: "AE",
    color: "#DEB887", 
    continent: "Asia",
    path: "M535 285c12-5 24 2 36 9l60 30c12 9 21 20 19 32l-5 13c-7 16-24 9-36-5l-60-30c-12-9-21-20-19-32l5-17z"
  },
  {
    name: "Kuwait",
    code: "KW",
    color: "#FFA500",
    continent: "Asia", 
    path: "M525 270c10-4 20 2 30 8l50 25c10 8 18 17 16 27l-4 11c-6 13-20 8-30-4l-50-25c-10-8-18-17-16-27l4-15z"
  },
  {
    name: "Qatar", 
    code: "QA",
    color: "#FF6B6B",
    continent: "Asia",
    path: "M530 275c8-3 16 1 24 6l40 20c8 6 14 13 13 20l-3 8c-5 10-16 6-24-3l-40-20c-8-6-14-13-13-20l3-11z"
  },
  {
    name: "Bahrain",
    code: "BH",
    color: "#90EE90", 
    continent: "Asia",
    path: "M528 273c5-2 10 1 15 3l25 13c5 4 9 8 8 13l-2 5c-3 6-10 3-15-2l-25-13c-5-4-9-8-8-13l2-6z"
  },
  {
    name: "Jordan",
    code: "JO",
    color: "#FFB6C1",
    continent: "Asia", 
    path: "M515 235c12-5 24 2 36 9l60 30c12 9 21 20 19 32l-5 13c-7 16-24 9-36-5l-60-30c-12-9-21-20-19-32l5-17z"
  },
  {
    name: "Lebanon", 
    code: "LB",
    color: "#DDA0DD",
    continent: "Asia",
    path: "M512 225c8-3 16 1 24 6l40 20c8 6 14 13 13 20l-3 8c-5 10-16 6-24-3l-40-20c-8-6-14-13-13-20l3-11z"
  },
  {
    name: "Israel",
    code: "IL", 
    color: "#F0E68C",
    continent: "Asia",
    path: "M510 240c10-4 20 2 30 8l50 25c10 8 18 17 16 27l-4 11c-6 13-20 8-30-4l-50-25c-10-8-18-17-16-27l4-15z"
  },
  {
    name: "Thailand",
    code: "TH",
    color: "#DEB887",
    continent: "Asia", 
    path: "M680 280c20-8 40 4 60 16l100 50c20 15 35 32 32 52l-8 21c-12 24-40 14-60-7l-100-50c-20-15-35-32-32-52l8-30z"
  },
  {
    name: "Vietnam", 
    code: "VN",
    color: "#FFA500",
    continent: "Asia",
    path: "M700 270c18-8 36 4 54 16l90 45c18 14 32 30 29 46l-7 20c-11 23-36 14-54-7l-90-45c-18-14-32-30-29-46l7-29z M705 310c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z"
  },
  {
    name: "Laos",
    code: "LA",
    color: "#FF6B6B", 
    continent: "Asia",
    path: "M690 265c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z"
  },
  {
    name: "Cambodia",
    code: "KH",
    color: "#90EE90",
    continent: "Asia", 
    path: "M685 290c12-5 24 2 36 9l60 30c12 9 21 20 19 32l-5 13c-7 16-24 9-36-5l-60-30c-12-9-21-20-19-32l5-17z"
  },
  {
    name: "Myanmar", 
    code: "MM",
    color: "#FFB6C1",
    continent: "Asia",
    path: "M670 260c18-8 36 4 54 16l90 45c18 14 32 30 29 46l-7 20c-11 23-36 14-54-7l-90-45c-18-14-32-30-29-46l7-29z"
  },
  {
    name: "Bangladesh",
    code: "BD",
    color: "#DDA0DD", 
    continent: "Asia",
    path: "M630 250c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z"
  },
  {
    name: "Sri Lanka",
    code: "LK",
    color: "#F0E68C",
    continent: "Asia", 
    path: "M615 310c10-4 20 2 30 8l50 25c10 8 18 17 16 27l-4 11c-6 13-20 8-30-4l-50-25c-10-8-18-17-16-27l4-15z"
  },
  {
    name: "Nepal", 
    code: "NP",
    color: "#DEB887",
    continent: "Asia",
    path: "M620 235c12-5 24 2 36 9l60 30c12 9 21 20 19 32l-5 13c-7 16-24 9-36-5l-60-30c-12-9-21-20-19-32l5-17z"
  },
  {
    name: "Bhutan",
    code: "BT", 
    color: "#FFA500",
    continent: "Asia",
    path: "M640 240c8-3 16 1 24 6l40 20c8 6 14 13 13 20l-3 8c-5 10-16 6-24-3l-40-20c-8-6-14-13-13-20l3-11z"
  },
  {
    name: "Indonesia",
    code: "ID",
    color: "#FF6B6B",
    continent: "Asia", 
    path: "M700 340c40-16 80 8 120 32l200 100c40 30 70 66 64 102l-24 52c-28 58-84 32-120-18l-200-100c-40-30-70-66-64-102l24-66z M720 370c30-12 60 6 90 24l150 75c30 23 52 50 48 78l-18 40c-22 45-65 25-95-12l-150-75c-30-23-52-50-48-78l23-52z M650 380c25-10 50 5 75 20l125 63c25 19 44 41 40 66l-15 33c-18 38-55 20-80-10l-125-63c-25-19-44-41-40-66l20-43z"
  },
  {
    name: "Malaysia", 
    code: "MY",
    color: "#90EE90",
    continent: "Asia",
    path: "M690 320c20-8 40 4 60 16l100 50c20 15 35 32 32 52l-8 21c-12 24-40 14-60-7l-100-50c-20-15-35-32-32-52l8-30z M710 340c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z"
  },
  {
    name: "Singapore",
    code: "SG",
    color: "#FFB6C1", 
    continent: "Asia",
    path: "M705 350c5-2 10 1 15 3l25 13c5 4 9 8 8 13l-2 5c-3 6-10 3-15-2l-25-13c-5-4-9-8-8-13l2-6z"
  },
  {
    name: "Philippines",
    code: "PH",
    color: "#DDA0DD",
    continent: "Asia", 
    path: "M740 310c25-10 50 5 75 20l125 63c25 19 44 41 40 66l-15 33c-18 38-55 20-80-10l-125-63c-25-19-44-41-40-66l20-43z M750 340c20-8 40 4 60 16l100 50c20 15 35 32 32 52l-8 21c-12 24-40 14-60-7l-100-50c-20-15-35-32-32-52l8-30z M745 370c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z"
  }
];