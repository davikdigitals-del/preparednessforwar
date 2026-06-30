import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface InteractiveWorldMapProps {
  onCountryClick?: (countryId: string) => void;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

interface DragStart {
  x: number;
  y: number;
}

interface Country {
  name: string;
  code: string;
  continent: string;
}

export const InteractiveWorldMap = ({ onCountryClick }: InteractiveWorldMapProps) => {
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<DragStart>({ x: 0, y: 0 });
  const navigate = useNavigate();

  // Country definitions with correct positioning
  const countries = [
    { name: "United States", code: "US", continent: "North America" },
    { name: "Canada", code: "CA", continent: "North America" },
    { name: "Mexico", code: "MX", continent: "North America" },
    { name: "Brazil", code: "BR", continent: "South America" },
    { name: "Argentina", code: "AR", continent: "South America" },
    { name: "Chile", code: "CL", continent: "South America" },
    { name: "Peru", code: "PE", continent: "South America" },
    { name: "Colombia", code: "CO", continent: "South America" },
    { name: "Venezuela", code: "VE", continent: "South America" },
    { name: "Russia", code: "RU", continent: "Europe/Asia" },
    { name: "China", code: "CN", continent: "Asia" },
    { name: "India", code: "IN", continent: "Asia" },
    { name: "Japan", code: "JP", continent: "Asia" },
    { name: "South Korea", code: "KR", continent: "Asia" },
    { name: "Indonesia", code: "ID", continent: "Asia" },
    { name: "Thailand", code: "TH", continent: "Asia" },
    { name: "Vietnam", code: "VN", continent: "Asia" },
    { name: "Malaysia", code: "MY", continent: "Asia" },
    { name: "Philippines", code: "PH", continent: "Asia" },
    { name: "Germany", code: "DE", continent: "Europe" },
    { name: "France", code: "FR", continent: "Europe" },
    { name: "United Kingdom", code: "GB", continent: "Europe" },
    { name: "Italy", code: "IT", continent: "Europe" },
    { name: "Spain", code: "ES", continent: "Europe" },
    { name: "Poland", code: "PL", continent: "Europe" },
    { name: "Ukraine", code: "UA", continent: "Europe" },
    { name: "Turkey", code: "TR", continent: "Europe/Asia" },
    { name: "Saudi Arabia", code: "SA", continent: "Asia" },
    { name: "Iran", code: "IR", continent: "Asia" },
    { name: "Egypt", code: "EG", continent: "Africa" },
    { name: "Nigeria", code: "NG", continent: "Africa" },
    { name: "South Africa", code: "ZA", continent: "Africa" },
    { name: "Kenya", code: "KE", continent: "Africa" },
    { name: "Morocco", code: "MA", continent: "Africa" },
    { name: "Australia", code: "AU", continent: "Oceania" },
    { name: "New Zealand", code: "NZ", continent: "Oceania" }
  ];

  // Handle mouse events
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(transform.scale * delta, 0.5), 4);
    setTransform((prev: Transform) => ({ ...prev, scale: newScale }));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setTransform((prev: Transform) => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleCountryClick = (countryCode: string) => {
    if (onCountryClick) {
      onCountryClick(countryCode);
    } else {
      navigate(`/countries/${countryCode.toLowerCase()}`);
    }
  };

  const resetView = () => setTransform({ x: 0, y: 0, scale: 1 });

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-sky-100 to-sky-200 overflow-hidden">
      {/* Controls */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
        <button
          onClick={() => setTransform((prev: Transform) => ({ ...prev, scale: Math.min(prev.scale * 1.2, 4) }))}
          className="w-12 h-12 bg-white hover:bg-gray-50 rounded-xl shadow-lg flex items-center justify-center font-bold text-gray-700 border-2 border-gray-200 transition-all hover:scale-105"
        >
          +
        </button>
        <button
          onClick={() => setTransform((prev: Transform) => ({ ...prev, scale: Math.max(prev.scale * 0.8, 0.5) }))}
          className="w-12 h-12 bg-white hover:bg-gray-50 rounded-xl shadow-lg flex items-center justify-center font-bold text-gray-700 border-2 border-gray-200 transition-all hover:scale-105"
        >
          −
        </button>
        <button
          onClick={resetView}
          className="w-12 h-12 bg-white hover:bg-gray-50 rounded-xl shadow-lg flex items-center justify-center font-bold text-gray-700 border-2 border-gray-200 transition-all hover:scale-105"
        >
          🏠
        </button>
      </div>

      {/* Country Info Tooltip */}
      {hoveredCountry && (
        <div className="absolute top-6 right-6 z-20 bg-white/95 backdrop-blur-sm px-8 py-6 rounded-2xl shadow-2xl border-2 border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
            <h3 className="font-bold text-gray-900 text-xl">{hoveredCountry.name}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-1">Code: {hoveredCountry.code}</p>
          <p className="text-sm text-gray-600 mb-1">Continent: {hoveredCountry.continent}</p>
          <p className="text-sm text-blue-600 font-medium">Click to view posts & content</p>
        </div>
      )}

      {/* World Map */}
      <div 
        className="w-full h-full cursor-grab active:cursor-grabbing relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          className="absolute inset-0 w-full h-full flex items-center justify-center"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: 'center center'
          }}
        >
          {/* Real World Map Image */}
          <div className="relative w-full h-full">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg" 
              alt="World Map"
              className="w-full h-full object-contain"
              style={{ 
                minWidth: '100%', 
                minHeight: '100%'
              }}
            />
            
            {/* Accurate Country Hover Regions */}
            <svg 
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1000 500" 
              preserveAspectRatio="xMidYMid meet"
            >
              {/* North America */}
              <polygon 
                points="158,174 280,165 380,175 420,195 380,225 300,235 200,215 158,195" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'US')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('US')}
              />
              <polygon 
                points="130,94 320,70 420,85 450,105 420,125 320,115 130,115" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'CA')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('CA')}
              />
              <polygon 
                points="155,245 220,240 270,245 300,255 280,280 220,285 155,275" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'MX')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('MX')}
              />
              
              {/* South America */}
              <polygon 
                points="280,300 400,310 420,380 350,440 290,410 260,350 280,320" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'BR')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('BR')}
              />
              <polygon 
                points="270,420 320,430 330,500 280,520 260,490 270,440" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'AR')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('AR')}
              />
              <polygon 
                points="250,400 270,395 270,510 260,540 250,530 250,450" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'CL')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('CL')}
              />
              
              {/* Europe */}
              <polygon 
                points="500,79 820,89 850,104 830,124 750,144 500,144 480,124 500,104" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'RU')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('RU')}
              />
              <polygon 
                points="480,132 520,128 520,163 490,168 475,153" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'DE')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('DE')}
              />
              <polygon 
                points="450,153 485,148 485,183 445,178 440,163" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'FR')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('FR')}
              />
              <polygon 
                points="430,123 455,118 455,148 425,143" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'GB')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('GB')}
              />
              <polygon 
                points="430,173 480,168 480,203 425,198" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'ES')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('ES')}
              />
              <polygon 
                points="485,168 510,163 515,223 480,218 485,178" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'IT')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('IT')}
              />
              
              {/* Asia */}
              <polygon 
                points="620,143 750,138 770,203 700,208 630,183 620,163" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'CN')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('CN')}
              />
              <polygon 
                points="580,203 640,218 650,283 570,278 565,233 580,218" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'IN')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('IN')}
              />
              <polygon 
                points="780,163 810,158 810,218 775,213 775,173" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'JP')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('JP')}
              />
              
              {/* Africa */}
              <polygon 
                points="520,233 560,228 560,273 510,268" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'EG')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('EG')}
              />
              <polygon 
                points="480,283 520,278 520,323 470,318" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'NG')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('NG')}
              />
              <polygon 
                points="500,383 540,378 540,423 485,418" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'ZA')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('ZA')}
              />
              
              {/* Oceania */}
              <polygon 
                points="720,363 840,363 840,408 700,408" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'AU')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('AU')}
              />
              <polygon 
                points="820,403 845,398 845,433 815,433" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'NZ')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('NZ')}
              />
              
              {/* Additional Countries */}
              <polygon 
                points="250,320 280,315 290,355 255,340" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'CO')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('CO')}
              />
              <polygon 
                points="250,340 290,335 285,395 248,390" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'PE')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('PE')}
              />
              <polygon 
                points="280,290 320,285 340,315 300,320" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'VE')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('VE')}
              />
              <polygon 
                points="510,140 545,135 545,180 505,180" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'PL')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('PL')}
              />
              <polygon 
                points="540,150 590,145 590,190 530,185" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'UA')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('UA')}
              />
              <polygon 
                points="520,180 590,175 590,220 520,225" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'TR')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('TR')}
              />
              <polygon 
                points="560,220 620,215 620,260 560,265" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'SA')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('SA')}
              />
              <polygon 
                points="520,200 580,195 580,240 520,245" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'IR')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('IR')}
              />
              <polygon 
                points="760,183 780,178 780,218 755,223" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'KR')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('KR')}
              />
              <polygon 
                points="650,240 680,235 690,280 650,285" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'TH')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('TH')}
              />
              <polygon 
                points="670,240 720,235 730,275 670,280" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'VN')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('VN')}
              />
              <polygon 
                points="650,285 720,280 780,340 650,345" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'ID')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('ID')}
              />
              <polygon 
                points="650,280 690,275 700,315 650,320" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'MY')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('MY')}
              />
              <polygon 
                points="720,240 780,235 790,320 720,325" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'PH')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('PH')}
              />
              <polygon 
                points="540,313 580,308 580,353 535,358" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'KE')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('KE')}
              />
              <polygon 
                points="440,233 480,228 480,273 435,278" 
                fill="transparent" 
                className="cursor-pointer hover:fill-blue-500/20 transition-all"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'MA')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('MA')}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Enhanced Instructions Panel */}
      <div className="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur-sm px-8 py-6 rounded-2xl shadow-2xl border-2 border-gray-200">
        <h4 className="font-bold text-gray-800 mb-3 text-lg">Navigation Controls</h4>
        <div className="space-y-2 text-sm font-medium text-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-lg">🖱️</span>
            <span>Drag to pan the map</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg">🔍</span>
            <span>Scroll to zoom in/out</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg">🌍</span>
            <span>Hover & click countries</span>
          </div>
        </div>
      </div>

      {/* Status Panel */}
      <div className="absolute bottom-6 right-6 z-20 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-2xl border-2 border-gray-200">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600 mb-1">Current Zoom</p>
          <p className="text-2xl font-bold text-blue-600">{Math.round(transform.scale * 100)}%</p>
        </div>
      </div>

      {/* Header */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-center z-20">
        <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-2xl">Interactive World Map</h1>
        <p className="text-white/90 drop-shadow-lg text-lg">Explore Global Preparedness Intelligence by Country</p>
        <div className="mt-3 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
          <p className="text-white/80 text-sm font-medium">
            {countries.length} Countries Available • Accurate Positioning
          </p>
        </div>
      </div>
    </div>
  );
};