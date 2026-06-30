import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface InteractiveWorldMapProps {
  onCountryClick?: (countryId: string) => void;
}

export const InteractiveWorldMap = ({ onCountryClick }: InteractiveWorldMapProps) => {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  // Handle mouse events
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(transform.scale * delta, 0.5), 3);
    setTransform(prev => ({ ...prev, scale: newScale }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTransform(prev => ({
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
    <div className="relative w-full h-screen bg-gradient-to-b from-blue-100 to-blue-300 overflow-hidden">
      {/* Controls */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
        <button
          onClick={() => setTransform(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 3) }))}
          className="w-12 h-12 bg-white hover:bg-gray-50 rounded-lg shadow-lg flex items-center justify-center font-bold text-gray-700 border"
        >
          +
        </button>
        <button
          onClick={() => setTransform(prev => ({ ...prev, scale: Math.max(prev.scale * 0.8, 0.5) }))}
          className="w-12 h-12 bg-white hover:bg-gray-50 rounded-lg shadow-lg flex items-center justify-center font-bold text-gray-700 border"
        >
          −
        </button>
        <button
          onClick={resetView}
          className="w-12 h-12 bg-white hover:bg-gray-50 rounded-lg shadow-lg flex items-center justify-center font-bold text-gray-700 border"
        >
          🏠
        </button>
      </div>

      {/* Tooltip */}
      {hoveredCountry && (
        <div className="absolute top-6 right-6 z-20 bg-white px-6 py-4 rounded-lg shadow-xl border">
          <p className="font-bold text-gray-900 text-xl">{hoveredCountry}</p>
          <p className="text-sm text-gray-600">Click to explore content</p>
        </div>
      )}

      {/* Real World Map */}
      <div 
        className="w-full h-full cursor-grab active:cursor-grabbing relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: 'center center'
          }}
        >
          {/* Use a real world map image as background */}
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg" 
            alt="World Map"
            className="w-full h-full object-contain"
            style={{ minWidth: '100%', minHeight: '100%' }}
          />
          
          {/* Overlay clickable regions */}
          <svg 
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 1000 500" 
            preserveAspectRatio="xMidYMid meet"
          >
            {/* United States */}
            <rect x="100" y="150" width="150" height="80" 
                  fill="transparent" 
                  className="cursor-pointer hover:fill-blue-500/30 transition-all"
                  onMouseEnter={() => setHoveredCountry('United States')}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => handleCountryClick('US')}/>
            
            {/* Canada */}
            <rect x="80" y="80" width="200" height="80" 
                  fill="transparent" 
                  className="cursor-pointer hover:fill-blue-500/30 transition-all"
                  onMouseEnter={() => setHoveredCountry('Canada')}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => handleCountryClick('CA')}/>
            
            {/* Brazil */}
            <rect x="200" y="280" width="120" height="150" 
                  fill="transparent" 
                  className="cursor-pointer hover:fill-blue-500/30 transition-all"
                  onMouseEnter={() => setHoveredCountry('Brazil')}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => handleCountryClick('BR')}/>
            
            {/* Russia */}
            <rect x="500" y="80" width="350" height="120" 
                  fill="transparent" 
                  className="cursor-pointer hover:fill-blue-500/30 transition-all"
                  onMouseEnter={() => setHoveredCountry('Russia')}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => handleCountryClick('RU')}/>
            
            {/* China */}
            <rect x="650" y="180" width="150" height="100" 
                  fill="transparent" 
                  className="cursor-pointer hover:fill-blue-500/30 transition-all"
                  onMouseEnter={() => setHoveredCountry('China')}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => handleCountryClick('CN')}/>
            
            {/* India */}
            <rect x="600" y="220" width="80" height="100" 
                  fill="transparent" 
                  className="cursor-pointer hover:fill-blue-500/30 transition-all"
                  onMouseEnter={() => setHoveredCountry('India')}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => handleCountryClick('IN')}/>
            
            {/* Australia */}
            <rect x="750" y="350" width="150" height="100" 
                  fill="transparent" 
                  className="cursor-pointer hover:fill-blue-500/30 transition-all"
                  onMouseEnter={() => setHoveredCountry('Australia')}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => handleCountryClick('AU')}/>
            
            {/* Europe */}
            <rect x="420" y="140" width="100" height="80" 
                  fill="transparent" 
                  className="cursor-pointer hover:fill-blue-500/30 transition-all"
                  onMouseEnter={() => setHoveredCountry('Europe')}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => handleCountryClick('GB')}/>
            
            {/* Africa */}
            <rect x="420" y="220" width="120" height="180" 
                  fill="transparent" 
                  className="cursor-pointer hover:fill-blue-500/30 transition-all"
                  onMouseEnter={() => setHoveredCountry('Africa')}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => handleCountryClick('ZA')}/>
          </svg>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-6 left-6 z-20 bg-white/95 px-6 py-4 rounded-lg shadow-xl border">
        <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
          <span>🖱️ Drag to pan</span>
          <span>🔍 Scroll to zoom</span>
          <span>🌍 Click countries</span>
        </div>
      </div>

      <div className="absolute bottom-6 right-6 z-20 bg-white/95 px-4 py-2 rounded-lg shadow-xl border text-sm font-medium text-gray-700">
        Zoom: {Math.round(transform.scale * 100)}%
      </div>

      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-center z-20">
        <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Interactive World Map</h2>
        <p className="text-white/90 drop-shadow">Explore global preparedness by country</p>
      </div>
    </div>
  );
};