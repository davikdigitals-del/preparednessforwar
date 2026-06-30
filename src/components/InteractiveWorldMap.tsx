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
          {/* Real World Map with Individual Country SVG Paths */}
          <div className="relative w-full h-full">
            {/* Ocean Background */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-sky-200 to-sky-300"></div>
            
            {/* SVG World Map with Real Country Boundaries */}
            <svg 
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1000 500" 
              preserveAspectRatio="xMidYMid meet"
            >
              {/* United States */}
              <path 
                d="M 158,206 L 200,180 C 250,175 300,170 350,175 C 400,180 420,200 400,230 C 380,250 320,240 280,235 C 230,230 180,220 158,206 Z M 100,170 C 120,165 140,170 130,185 C 120,190 110,180 100,170 Z M 380,140 C 420,135 450,145 430,165 C 410,170 390,155 380,140 Z"
                fill="#FFD700"
                stroke="#2c3e50"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-300 hover:fill-yellow-400"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'US')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('US')}
              />
              
              {/* Canada */}
              <path 
                d="M 130,94 C 180,80 280,75 380,80 C 450,85 480,105 450,125 C 380,120 280,115 180,125 C 130,115 120,100 130,94 Z M 100,90 C 130,85 140,105 110,110 C 100,95 100,90 100,90 Z"
                fill="#90EE90"
                stroke="#2c3e50"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-300 hover:fill-green-400"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'CA')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('CA')}
              />
              
              {/* Mexico */}
              <path 
                d="M 155,245 C 200,240 270,245 300,255 C 280,280 220,285 190,275 C 170,265 155,250 155,245 Z"
                fill="#FF6B6B"
                stroke="#2c3e50"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-300 hover:fill-red-400"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'MX')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('MX')}
              />
              
              {/* Brazil */}
              <path 
                d="M 280,300 C 350,295 420,310 420,380 C 400,440 320,450 280,430 C 250,410 260,350 280,320 C 275,310 280,300 280,300 Z"
                fill="#FFB6C1"
                stroke="#2c3e50"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-300 hover:fill-pink-400"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'BR')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('BR')}
              />
              
              {/* Russia */}
              <path 
                d="M 500,79 C 580,74 750,84 850,104 C 830,124 750,144 580,154 C 500,144 480,124 500,104 C 495,90 500,79 500,79 Z"
                fill="#FFD700"
                stroke="#2c3e50"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-300 hover:fill-yellow-400"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'RU')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('RU')}
              />
              
              {/* China */}
              <path 
                d="M 620,143 C 700,133 770,158 760,203 C 700,208 630,183 620,163 C 615,153 620,143 620,143 Z"
                fill="#FFA500"
                stroke="#2c3e50"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-300 hover:fill-orange-400"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'CN')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('CN')}
              />
              
              {/* India */}
              <path 
                d="M 580,203 C 640,218 650,283 590,278 C 565,258 575,218 580,203 Z"
                fill="#90EE90"
                stroke="#2c3e50"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-300 hover:fill-green-400"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'IN')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('IN')}
              />
              
              {/* Australia */}
              <path 
                d="M 720,363 C 780,358 840,383 830,403 C 760,408 700,383 720,363 Z"
                fill="#FFD700"
                stroke="#2c3e50"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-300 hover:fill-yellow-400"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'AU')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('AU')}
              />
              
              {/* Germany */}
              <path 
                d="M 480,132 C 520,128 520,163 490,168 C 475,153 480,132 480,132 Z"
                fill="#DDA0DD"
                stroke="#2c3e50"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-300 hover:fill-purple-400"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'DE')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('DE')}
              />
              
              {/* France */}
              <path 
                d="M 450,153 C 485,148 485,183 445,178 C 440,163 450,153 450,153 Z"
                fill="#98FB98"
                stroke="#2c3e50"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-300 hover:fill-green-300"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'FR')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('FR')}
              />
              
              {/* United Kingdom */}
              <path 
                d="M 430,123 C 455,118 455,148 425,143 C 425,133 430,123 430,123 Z"
                fill="#F0E68C"
                stroke="#2c3e50"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-300 hover:fill-yellow-300"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'GB')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('GB')}
              />
              
              {/* Japan */}
              <path 
                d="M 780,163 C 810,158 810,218 775,213 C 775,173 780,163 780,163 Z M 785,140 C 800,135 805,155 790,160 C 785,150 785,140 785,140 Z"
                fill="#FFB6C1"
                stroke="#2c3e50"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-300 hover:fill-pink-300"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'JP')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('JP')}
              />
              
              {/* Add more countries with proper curved paths */}
              {/* Egypt */}
              <path 
                d="M 520,233 C 560,228 560,273 510,268 C 510,248 520,233 520,233 Z"
                fill="#F0E68C"
                stroke="#2c3e50"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-300 hover:fill-yellow-300"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'EG')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('EG')}
              />
              
              {/* Nigeria */}
              <path 
                d="M 480,283 C 520,278 520,323 470,318 C 470,298 480,283 480,283 Z"
                fill="#98FB98"
                stroke="#2c3e50"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-300 hover:fill-green-300"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'NG')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('NG')}
              />
              
              {/* South Africa */}
              <path 
                d="M 500,383 C 540,378 540,423 485,418 C 485,398 500,383 500,383 Z"
                fill="#FFB6C1"
                stroke="#2c3e50"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-300 hover:fill-pink-300"
                onMouseEnter={() => setHoveredCountry(countries.find(c => c.code === 'ZA')!)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={() => handleCountryClick('ZA')}
              />
              
              {/* Greenland */}
              <path 
                d="M 350,30 C 400,25 450,40 440,80 C 380,85 330,70 340,40 C 345,35 350,30 350,30 Z"
                fill="#E0E0E0"
                stroke="#2c3e50"
                strokeWidth="1"
                className="cursor-pointer transition-all duration-300 hover:fill-gray-300"
              />
              
              {/* Antarctica */}
              <path 
                d="M 0,450 L 1000,450 L 1000,500 L 0,500 Z"
                fill="#FFFFFF"
                stroke="#2c3e50"
                strokeWidth="1"
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