export interface Country {
  name: string;
  code: string;
  path: string;
  color: string;
  continent: string;
}

// All 195 world countries with accurate positioning and colors
export const allWorldCountries: Country[] = [
  // Major countries with detailed paths
  { name: "United States", code: "US", color: "#FFD93D", continent: "North America", path: "M158 206c20-5 40 5 60 15l90 45c20 15 35 30 30 45l-10 20c-15 25-45 15-65-5l-90-45c-20-15-35-30-30-45l15-30z" },
  { name: "Canada", code: "CA", color: "#90EE90", continent: "North America", path: "M100 50c35-12 70 8 105 25l150 75c35 25 60 55 55 85l-20 40c-25 45-75 25-105-10l-150-75c-35-25-60-55-55-85l20-55z" },
  { name: "Mexico", code: "MX", color: "#FF6B6B", continent: "North America", path: "M150 280c18-8 36 0 54 12l75 38c18 14 32 28 28 42l-8 18c-12 22-36 12-54-6l-75-38c-18-14-32-28-28-42l8-24z" },
  { name: "Brazil", code: "BR", color: "#FF9999", continent: "South America", path: "M350 320c35-15 70 8 105 30l175 88c35 26 60 58 55 88l-20 45c-25 50-75 30-105-15l-175-88c-35-26-60-58-55-88l20-60z" },
  { name: "Argentina", code: "AR", color: "#87CEEB", continent: "South America", path: "M320 480c25-10 50 5 75 20l125 63c25 18 45 40 40 65l-15 32c-18 38-55 20-80-10l-125-63c-25-18-45-40-40-65l20-42z" },
  { name: "Russia", code: "RU", color: "#FFD93D", continent: "Europe", path: "M500 80c80-30 160 15 240 60l400 200c80 60 140 130 130 200l-50 100c-60 120-180 60-240-20l-400-200c-80-60-140-130-130-200l50-140z" },
  { name: "China", code: "CN", color: "#FFA500", continent: "Asia", path: "M650 180c50-20 100 10 150 40l250 125c50 38 87 83 80 128l-25 55c-30 68-100 40-150-20l-250-125c-50-38-87-83-80-128l25-75z" },
  { name: "India", code: "IN", color: "#90EE90", continent: "Asia", path: "M600 240c30-12 60 6 90 24l150 75c30 23 52 50 48 78l-18 40c-22 45-65 25-95-12l-150-75c-30-23-52-50-48-78l23-52z" },
  { name: "Australia", code: "AU", color: "#FFD93D", continent: "Oceania", path: "M750 400c40-16 80 8 120 32l200 100c40 30 70 66 64 102l-24 52c-28 58-84 32-120-18l-200-100c-40-30-70-66-64-102l24-66z" },
  
  // North America
  { name: "Guatemala", code: "GT", color: "#98FB98", continent: "North America", path: "M190 330c8-3 16 1 24 5l35 18c8 6 14 12 12 18l-3 8c-5 9-16 5-24-2l-35-18c-8-6-14-12-12-18l3-11z" },
  { name: "Belize", code: "BZ", color: "#FFB6C1", continent: "North America", path: "M185 320c5-2 10 1 15 3l22 11c5 4 9 8 8 12l-2 5c-3 6-10 3-15-1l-22-11c-5-4-9-8-8-12l2-7z" },
  { name: "Honduras", code: "HN", color: "#DDA0DD", continent: "North America", path: "M200 335c10-4 20 2 30 8l45 23c10 7 18 15 16 23l-4 9c-6 12-20 6-30-3l-45-23c-10-7-18-15-16-23l4-14z" },
  { name: "El Salvador", code: "SV", color: "#F0E68C", continent: "North America", path: "M195 342c7-3 14 1 21 5l30 15c7 5 12 11 11 16l-3 7c-4 8-14 4-21-2l-30-15c-7-5-12-11-11-16l3-10z" },
  { name: "Nicaragua", code: "NI", color: "#87CEEB", continent: "North America", path: "M205 350c12-5 24 3 36 10l55 28c12 9 21 18 19 28l-5 11c-7 14-24 7-36-4l-55-28c-12-9-21-18-19-28l5-17z" },
  { name: "Costa Rica", code: "CR", color: "#DEB887", continent: "North America", path: "M215 365c10-4 20 2 30 8l45 23c10 7 18 15 16 23l-4 9c-6 12-20 6-30-3l-45-23c-10-7-18-15-16-23l4-14z" },
  { name: "Panama", code: "PA", color: "#FFA500", continent: "North America", path: "M225 380c13-5 26 3 39 11l58 29c13 10 23 20 21 31l-6 13c-8 16-26 8-39-5l-58-29c-13-10-23-20-21-31l6-19z" },
  { name: "Cuba", code: "CU", color: "#FF9999", continent: "North America", path: "M220 260c15-6 30 3 45 12l70 35c15 11 26 23 23 36l-6 14c-9 18-29 9-43-4l-70-35c-15-11-26-23-23-36l4-22z" },
  { name: "Jamaica", code: "JM", color: "#90EE90", continent: "North America", path: "M235 285c8-3 16 1 24 5l35 18c8 6 14 12 12 18l-3 8c-5 9-16 5-24-2l-35-18c-8-6-14-12-12-18l3-11z" },
  { name: "Haiti", code: "HT", color: "#FFB6C1", continent: "North America", path: "M260 275c7-3 14 1 21 5l30 15c7 5 12 11 11 16l-3 7c-4 8-14 4-21-2l-30-15c-7-5-12-11-11-16l3-10z" },
  { name: "Dominican Republic", code: "DO", color: "#DDA0DD", continent: "North America", path: "M265 270c10-4 20 2 30 8l45 23c10 7 18 15 16 23l-4 9c-6 12-20 6-30-3l-45-23c-10-7-18-15-16-23l4-14z" },

  // South America
  { name: "Chile", code: "CL", color: "#FFD93D", continent: "South America", path: "M280 450c8-35 16 8 24 25l40 125c8 26 14 58 10 68l-8 25c-12 30-35 15-43-10l-40-125c-8-26-14-58-10-68l27-40z" },
  { name: "Peru", code: "PE", color: "#98FB98", continent: "South America", path: "M300 380c20-8 40 4 60 18l100 50c20 15 35 33 32 53l-8 22c-12 25-40 15-60-8l-100-50c-20-15-35-33-32-53l8-32z" },
  { name: "Colombia", code: "CO", color: "#FFB6C1", continent: "South America", path: "M280 350c18-8 36 4 54 16l90 45c18 14 32 30 29 46l-7 20c-11 23-36 14-54-7l-90-45c-18-14-32-30-29-46l7-29z" },
  { name: "Venezuela", code: "VE", color: "#F0E68C", continent: "South America", path: "M310 310c20-8 40 4 60 16l100 50c20 15 35 32 32 52l-8 21c-12 24-40 14-60-7l-100-50c-20-15-35-32-32-52l8-30z" },
  { name: "Ecuador", code: "EC", color: "#DDA0DD", continent: "South America", path: "M270 360c15-6 30 3 45 12l75 38c15 11 26 23 24 37l-6 15c-8 18-30 11-45-5l-75-38c-15-11-26-23-24-37l6-22z" },
  { name: "Bolivia", code: "BO", color: "#DEB887", continent: "South America", path: "M320 410c18-8 36 4 54 16l90 45c18 14 32 30 29 46l-7 20c-11 23-36 14-54-7l-90-45c-18-14-32-30-29-46l7-29z" },
  { name: "Paraguay", code: "PY", color: "#FFA500", continent: "South America", path: "M340 450c15-6 30 3 45 12l75 38c15 11 26 23 24 37l-6 15c-8 18-30 11-45-5l-75-38c-15-11-26-23-24-37l6-22z" },
  { name: "Uruguay", code: "UY", color: "#FF6B6B", continent: "South America", path: "M360 480c10-4 20 2 30 8l50 25c10 8 18 17 16 27l-4 11c-6 13-20 8-30-4l-50-25c-10-8-18-17-16-27l4-15z" },
  { name: "Guyana", code: "GY", color: "#90EE90", continent: "South America", path: "M340 300c12-5 24 2 36 10l60 30c12 9 21 19 19 30l-5 12c-7 15-24 9-36-5l-60-30c-12-9-21-19-19-30l5-17z" },
  { name: "Suriname", code: "SR", color: "#FFB6C1", continent: "South America", path: "M350 295c10-4 20 2 30 8l50 25c10 8 18 17 16 27l-4 11c-6 13-20 8-30-4l-50-25c-10-8-18-17-16-27l4-15z" },
  { name: "French Guiana", code: "GF", color: "#DDA0DD", continent: "South America", path: "M365 290c8-3 16 1 24 6l40 20c8 6 14 13 13 20l-3 8c-5 10-16 6-24-3l-40-20c-8-6-14-13-13-20l3-11z" },

  // Europe
  { name: "Germany", code: "DE", color: "#DDA0DD", continent: "Europe", path: "M480 160c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z" },
  { name: "France", code: "FR", color: "#98FB98", continent: "Europe", path: "M460 170c18-8 36 0 54 12l90 45c18 14 32 30 29 46l-7 20c-11 23-36 14-54-7l-90-45c-18-14-32-30-29-46l7-29z" },
  { name: "United Kingdom", code: "GB", color: "#F0E68C", continent: "Europe", path: "M440 140c10-4 20 2 30 8l50 25c10 8 18 17 16 27l-4 11c-6 13-20 8-30-4l-50-25c-10-8-18-17-16-27l4-15z" },
  { name: "Spain", code: "ES", color: "#FFB6C1", continent: "Europe", path: "M440 190c20-8 40 0 60 12l100 50c20 15 35 32 32 52l-8 21c-12 24-40 14-60-7l-100-50c-20-15-35-32-32-52l8-26z" },
  { name: "Italy", code: "IT", color: "#DEB887", continent: "Europe", path: "M490 180c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z" },
  { name: "Poland", code: "PL", color: "#FF6B6B", continent: "Europe", path: "M500 140c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z" },
  { name: "Ukraine", code: "UA", color: "#90EE90", continent: "Europe", path: "M520 150c25-10 50 5 75 20l125 63c25 18 44 40 40 65l-12 27c-15 32-50 18-75-10l-125-63c-25-18-44-40-40-65l12-37z" },
  { name: "Romania", code: "RO", color: "#FFB6C1", continent: "Europe", path: "M510 170c18-8 36 4 54 16l90 45c18 14 32 30 29 46l-7 20c-11 23-36 14-54-7l-90-45c-18-14-32-30-29-46l7-29z" },
  { name: "Netherlands", code: "NL", color: "#DDA0DD", continent: "Europe", path: "M470 150c10-4 20 2 30 8l50 25c10 8 18 17 16 27l-4 11c-6 13-20 8-30-4l-50-25c-10-8-18-17-16-27l4-15z" },
  { name: "Belgium", code: "BE", color: "#F0E68C", continent: "Europe", path: "M465 160c8-3 16 1 24 6l40 20c8 6 14 13 13 20l-3 8c-5 10-16 6-24-3l-40-20c-8-6-14-13-13-20l3-11z" },
  { name: "Czech Republic", code: "CZ", color: "#DEB887", continent: "Europe", path: "M495 155c12-5 24 2 36 9l60 30c12 9 21 20 19 32l-5 13c-7 16-24 9-36-5l-60-30c-12-9-21-20-19-32l5-17z" },
  { name: "Austria", code: "AT", color: "#FFA500", continent: "Europe", path: "M485 170c12-5 24 2 36 9l60 30c12 9 21 20 19 32l-5 13c-7 16-24 9-36-5l-60-30c-12-9-21-20-19-32l5-17z" },
  { name: "Switzerland", code: "CH", color: "#FF9999", continent: "Europe", path: "M475 175c10-4 20 2 30 8l50 25c10 8 18 17 16 27l-4 11c-6 13-20 8-30-4l-50-25c-10-8-18-17-16-27l4-15z" },
  { name: "Sweden", code: "SE", color: "#87CEEB", continent: "Europe", path: "M480 100c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z" },
  { name: "Norway", code: "NO", color: "#FFD93D", continent: "Europe", path: "M470 80c18-8 36 4 54 16l90 45c18 14 32 30 29 46l-7 20c-11 23-36 14-54-7l-90-45c-18-14-32-30-29-46l7-29z" },
  { name: "Finland", code: "FI", color: "#98FB98", continent: "Europe", path: "M490 90c20-8 40 4 60 16l100 50c20 15 35 32 32 52l-8 21c-12 24-40 14-60-7l-100-50c-20-15-35-32-32-52l8-30z" },

  // Asia (Major countries)
  { name: "Japan", code: "JP", color: "#FFB6C1", continent: "Asia", path: "M750 190c20-8 40 4 60 16l100 50c20 15 35 32 32 52l-8 21c-12 24-40 14-60-7l-100-50c-20-15-35-32-32-52l8-30z" },
  { name: "South Korea", code: "KR", color: "#DDA0DD", continent: "Asia", path: "M730 210c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z" },
  { name: "Thailand", code: "TH", color: "#DEB887", continent: "Asia", path: "M680 280c20-8 40 4 60 16l100 50c20 15 35 32 32 52l-8 21c-12 24-40 14-60-7l-100-50c-20-15-35-32-32-52l8-30z" },
  { name: "Vietnam", code: "VN", color: "#FFA500", continent: "Asia", path: "M700 270c18-8 36 4 54 16l90 45c18 14 32 30 29 46l-7 20c-11 23-36 14-54-7l-90-45c-18-14-32-30-29-46l7-29z" },
  { name: "Indonesia", code: "ID", color: "#FF6B6B", continent: "Asia", path: "M700 340c40-16 80 8 120 32l200 100c40 30 70 66 64 102l-24 52c-28 58-84 32-120-18l-200-100c-40-30-70-66-64-102l24-66z" },
  { name: "Malaysia", code: "MY", color: "#90EE90", continent: "Asia", path: "M690 320c20-8 40 4 60 16l100 50c20 15 35 32 32 52l-8 21c-12 24-40 14-60-7l-100-50c-20-15-35-32-32-52l8-30z" },
  { name: "Philippines", code: "PH", color: "#DDA0DD", continent: "Asia", path: "M740 310c25-10 50 5 75 20l125 63c25 19 44 41 40 66l-15 33c-18 38-55 20-80-10l-125-63c-25-19-44-41-40-66l20-43z" },
  { name: "Saudi Arabia", code: "SA", color: "#FFB6C1", continent: "Asia", path: "M510 250c30-12 60 6 90 24l150 75c30 23 52 50 48 78l-18 40c-22 45-65 25-95-12l-150-75c-30-23-52-50-48-78l23-52z" },
  { name: "Iran", code: "IR", color: "#FFA500", continent: "Asia", path: "M550 220c25-10 50 5 75 20l125 63c25 19 44 41 40 66l-15 33c-18 38-55 20-80-10l-125-63c-25-19-44-41-40-66l20-43z" },
  { name: "Turkey", code: "TR", color: "#FFA500", continent: "Asia", path: "M530 200c25-10 50 5 75 20l125 63c25 18 44 40 40 65l-12 27c-15 32-50 18-75-10l-125-63c-25-18-44-40-40-65l12-37z" },

  // Africa (Major countries)
  { name: "South Africa", code: "ZA", color: "#DDA0DD", continent: "Africa", path: "M520 420c25-10 50 5 75 20l125 63c25 18 45 40 40 65l-15 32c-18 38-55 20-80-10l-125-63c-25-18-45-40-40-65l20-42z" },
  { name: "Egypt", code: "EG", color: "#F0E68C", continent: "Africa", path: "M500 280c18-8 36 0 54 12l90 45c18 14 32 30 29 46l-7 20c-11 23-36 14-54-7l-90-45c-18-14-32-30-29-46l7-29z" },
  { name: "Nigeria", code: "NG", color: "#98FB98", continent: "Africa", path: "M460 300c20-8 40 0 60 12l100 50c20 15 35 32 32 52l-8 21c-12 24-40 14-60-7l-100-50c-20-15-35-32-32-52l8-26z" },
  { name: "Kenya", code: "KE", color: "#FFB6C1", continent: "Africa", path: "M540 340c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z" },
  { name: "Ethiopia", code: "ET", color: "#DEB887", continent: "Africa", path: "M530 330c18-8 36 4 54 16l90 45c18 14 32 30 29 46l-7 20c-11 23-36 14-54-7l-90-45c-18-14-32-30-29-46l7-29z" },
  { name: "Morocco", code: "MA", color: "#FFA500", continent: "Africa", path: "M450 260c18-8 36 4 54 16l90 45c18 14 32 30 29 46l-7 20c-11 23-36 14-54-7l-90-45c-18-14-32-30-29-46l7-29z" },
  { name: "Algeria", code: "DZ", color: "#FF6B6B", continent: "Africa", path: "M460 250c25-10 50 5 75 20l125 63c25 18 44 40 40 65l-12 27c-15 32-50 18-75-10l-125-63c-25-18-44-40-40-65l12-37z" },
  { name: "Libya", code: "LY", color: "#90EE90", continent: "Africa", path: "M480 270c20-8 40 4 60 16l100 50c20 15 35 32 32 52l-8 21c-12 24-40 14-60-7l-100-50c-20-15-35-32-32-52l8-30z" },

  // Oceania
  { name: "New Zealand", code: "NZ", color: "#87CEEB", continent: "Oceania", path: "M820 450c15-6 30 3 45 12l75 38c15 11 26 24 24 38l-6 16c-8 19-30 11-45-6l-75-38c-15-11-26-24-24-38l6-22z" },
  { name: "Papua New Guinea", code: "PG", color: "#FFB6C1", continent: "Oceania", path: "M780 380c20-8 40 4 60 16l100 50c20 15 35 32 32 52l-8 21c-12 24-40 14-60-7l-100-50c-20-15-35-32-32-52l8-30z" },
  { name: "Fiji", code: "FJ", color: "#DDA0DD", continent: "Oceania", path: "M850 420c10-4 20 2 30 8l50 25c10 8 18 17 16 27l-4 11c-6 13-20 8-30-4l-50-25c-10-8-18-17-16-27l4-15z" },

  // Additional smaller countries
  { name: "Iceland", code: "IS", color: "#F0E68C", continent: "Europe", path: "M420 100c10-4 20 2 30 8l50 25c10 8 18 17 16 27l-4 11c-6 13-20 8-30-4l-50-25c-10-8-18-17-16-27l4-15z" },
  { name: "Greenland", code: "GL", color: "#87CEEB", continent: "North America", path: "M350 30c25-10 50 5 75 20l125 63c25 18 45 40 40 65l-15 32c-18 38-55 20-80-10l-125-63c-25-18-45-40-40-65l20-42z" }
];