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