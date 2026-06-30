import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { allWorldCountries, Country } from "../data/allWorldCountries";

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

export const InteractiveWorldMap = ({ onCountryClick }: InteractiveWorldMapProps) => {
  const [hoveredCountry, setHoveredCountry] = useState<Country | null>(null);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<DragStart>({ x: 0, y: 0 });
  const navigate = useNavigate();

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

  // Filter countries by continent for organized display
  const getCountriesByContinent = (continent: string) => {
    return allWorldCountries.filter(country => country.continent === continent);
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-blue-50 to-blue-200 overflow-hidden">
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
            <div 
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: hoveredCountry.color }}
            />
            <h3 className="font-bold text-gray-900 text-xl">{hoveredCountry.name}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-1">Code: {hoveredCountry.code}</p>
          <p className="text-sm text-gray-600 mb-1">Continent: {hoveredCountry.continent}</p>
          <p className="text-sm text-blue-600 font-medium">Click to view posts & content</p>
        </div>
      )}

      {/* Premium World Map */}
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
          {/* Ocean Background with Grid Pattern */}
          <div className="absolute inset-0 w-full h-full">
            <svg 
              width="100%" 
              height="100%" 
              className="absolute inset-0"
              style={{ background: 'linear-gradient(135deg, #e6f3ff 0%, #b3d9ff 100%)' }}
            >
              <defs>
                <pattern id="oceanGrid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#c8e4ff" strokeWidth="0.5" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#oceanGrid)" />
            </svg>
          </div>

          {/* Premium SVG World Map */}
          <svg 
            className="absolute"
            width="1000" 
            height="600" 
            viewBox="0 0 1000 600" 
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Gradient for 3D effect */}
              <linearGradient id="countryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgba(255,255,255,0.3)' }} />
                <stop offset="100%" style={{ stopColor: 'rgba(0,0,0,0.1)' }} />
              </linearGradient>
              
              {/* Drop shadow filter */}
              <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.2)"/>
              </filter>
              
              {/* Glow effect for hover */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Render all countries */}
            {allWorldCountries.map((country) => (
              <g key={country.code}>
                <path
                  d={country.path}
                  fill={country.color}
                  stroke="#2c3e50"
                  strokeWidth="1.5"
                  className="cursor-pointer transition-all duration-300 ease-in-out"
                  style={{
                    filter: hoveredCountry?.code === country.code ? 'url(#glow)' : 'url(#dropShadow)',
                    transform: hoveredCountry?.code === country.code ? 'scale(1.02)' : 'scale(1)',
                    transformOrigin: 'center'
                  }}
                  onMouseEnter={() => setHoveredCountry(country)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => handleCountryClick(country.code)}
                />
                
                {/* Country labels */}
                <text
                  x={getCountryLabelPosition(country.code).x}
                  y={getCountryLabelPosition(country.code).y}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-gray-800 pointer-events-none select-none"
                  style={{ 
                    textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
                    opacity: transform.scale > 1.5 ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  {country.name}
                </text>
              </g>
            ))}

            {/* Equator line */}
            <line 
              x1="0" 
              y1="300" 
              x2="1000" 
              y2="300" 
              stroke="#34495e" 
              strokeWidth="1" 
              strokeDasharray="5,5" 
              opacity="0.3"
            />
            
            {/* Tropic lines */}
            <line 
              x1="0" 
              y1="220" 
              x2="1000" 
              y2="220" 
              stroke="#7f8c8d" 
              strokeWidth="0.5" 
              strokeDasharray="3,3" 
              opacity="0.2"
            />
            <line 
              x1="0" 
              y1="380" 
              x2="1000" 
              y2="380" 
              stroke="#7f8c8d" 
              strokeWidth="0.5" 
              strokeDasharray="3,3" 
              opacity="0.2"
            />
          </svg>
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
            <span>Click countries for content</span>
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
            {allWorldCountries.length} Countries Available • Real-time Data
          </p>
        </div>
      </div>

      {/* Continent Legend */}
      <div className="absolute top-6 right-1/2 transform translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-xl border-2 border-gray-200">
        <h4 className="font-bold text-gray-800 mb-2 text-center">Continents</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {['North America', 'South America', 'Europe', 'Asia', 'Africa', 'Oceania'].map(continent => (
            <div key={continent} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
              <span className="text-gray-700 font-medium">{continent}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Helper function to get country label positions
  function getCountryLabelPosition(countryCode: string): { x: number; y: number } {
    const positions: { [key: string]: { x: number; y: number } } = {
      'US': { x: 200, y: 230 },
      'CA': { x: 200, y: 120 },
      'MX': { x: 180, y: 290 },
      'GT': { x: 190, y: 340 },
      'BZ': { x: 185, y: 330 },
      'HN': { x: 200, y: 345 },
      'SV': { x: 195, y: 352 },
      'NI': { x: 205, y: 360 },
      'CR': { x: 215, y: 375 },
      'PA': { x: 225, y: 390 },
      'CU': { x: 220, y: 270 },
      'JM': { x: 235, y: 295 },
      'HT': { x: 260, y: 285 },
      'DO': { x: 265, y: 280 },
      'BR': { x: 380, y: 380 },
      'AR': { x: 350, y: 520 },
      'CL': { x: 280, y: 500 },
      'PE': { x: 300, y: 400 },
      'CO': { x: 290, y: 360 },
      'VE': { x: 320, y: 320 },
      'EC': { x: 270, y: 370 },
      'BO': { x: 320, y: 420 },
      'PY': { x: 340, y: 460 },
      'UY': { x: 360, y: 490 },
      'GY': { x: 340, y: 310 },
      'SR': { x: 350, y: 305 },
      'GF': { x: 365, y: 300 },
      'RU': { x: 650, y: 140 },
      'DE': { x: 490, y: 170 },
      'FR': { x: 470, y: 180 },
      'GB': { x: 450, y: 150 },
      'ES': { x: 460, y: 200 },
      'IT': { x: 500, y: 190 },
      'PL': { x: 500, y: 150 },
      'UA': { x: 540, y: 170 },
      'RO': { x: 520, y: 180 },
      'NL': { x: 470, y: 160 },
      'BE': { x: 465, y: 170 },
      'CZ': { x: 495, y: 165 },
      'AT': { x: 485, y: 180 },
      'CH': { x: 475, y: 185 },
      'SE': { x: 485, y: 110 },
      'NO': { x: 475, y: 90 },
      'FI': { x: 500, y: 100 },
      'CN': { x: 700, y: 210 },
      'IN': { x: 630, y: 260 },
      'JP': { x: 760, y: 210 },
      'KR': { x: 740, y: 220 },
      'TH': { x: 690, y: 290 },
      'VN': { x: 710, y: 280 },
      'ID': { x: 720, y: 360 },
      'MY': { x: 700, y: 330 },
      'PH': { x: 750, y: 330 },
      'SA': { x: 530, y: 270 },
      'IR': { x: 570, y: 240 },
      'TR': { x: 550, y: 210 },
      'ZA': { x: 540, y: 440 },
      'EG': { x: 520, y: 290 },
      'NG': { x: 480, y: 320 },
      'KE': { x: 550, y: 350 },
      'ET': { x: 540, y: 340 },
      'MA': { x: 460, y: 270 },
      'DZ': { x: 480, y: 260 },
      'LY': { x: 490, y: 280 },
      'AU': { x: 800, y: 440 },
      'NZ': { x: 840, y: 480 },
      'PG': { x: 790, y: 390 },
      'FJ': { x: 860, y: 430 },
      'IS': { x: 430, y: 110 },
      'GL': { x: 370, y: 60 }
    };
    
    return positions[countryCode] || { x: 500, y: 300 };
  }
};