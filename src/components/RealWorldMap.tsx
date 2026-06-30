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

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(transform.scale * delta, 0.5), 4);
    
    setTransform(prev => ({
      ...prev,
      scale: newScale
    }));
  };

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  // Handle drag move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  };

  // Handle drag end
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle country click
  const handleCountryClick = (countryCode: string) => {
    if (onCountryClick) {
      onCountryClick(countryCode);
    } else {
      navigate(`/countries/${countryCode.toLowerCase()}`);
    }
  };

  // Reset zoom and pan
  const resetView = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-sky-200 to-sky-400 overflow-hidden">
      {/* Map Controls */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
        <button
          onClick={() => setTransform(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 4) }))}
          className="w-12 h-12 bg-white hover:bg-gray-50 rounded-lg shadow-lg flex items-center justify-center font-bold text-gray-700 hover:text-gray-900 transition-all hover:shadow-xl border"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => setTransform(prev => ({ ...prev, scale: Math.max(prev.scale * 0.8, 0.5) }))}
          className="w-12 h-12 bg-white hover:bg-gray-50 rounded-lg shadow-lg flex items-center justify-center font-bold text-gray-700 hover:text-gray-900 transition-all hover:shadow-xl border"
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={resetView}
          className="w-12 h-12 bg-white hover:bg-gray-50 rounded-lg shadow-lg flex items-center justify-center text-sm font-bold text-gray-700 hover:text-gray-900 transition-all hover:shadow-xl border"
          title="Reset View"
        >
          🏠
        </button>
      </div>

      {/* Country tooltip */}
      {hoveredCountry && (
        <div className="absolute top-6 right-6 z-10 bg-white px-6 py-4 rounded-lg shadow-xl border">
          <p className="font-bold text-gray-900 text-xl">{hoveredCountry}</p>
          <p className="text-sm text-gray-600 mt-1">Click to explore preparedness content</p>
        </div>
      )}

      {/* Embedded Google Maps-style iframe */}
      <div 
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: 'center center'
        }}
      >
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d198979282.04765198!2d-98.5795!3d39.8283!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDAwJzAwLjAiTiA5N8KwMzUnMDAuMCJX!5e0!3m2!1sen!2sus!4v1635123456789!5m2!1sen!2sus&maptype=terrain"
          width="100%" 
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="pointer-events-none"
        />
        
        {/* Overlay clickable regions for countries */}
        <div className="absolute inset-0 pointer-events-auto">
          {/* USA */}
          <div 
            className="absolute bg-transparent hover:bg-blue-500/20 cursor-pointer transition-colors"
            style={{ 
              left: '15%', 
              top: '25%', 
              width: '25%', 
              height: '20%' 
            }}
            onMouseEnter={() => setHoveredCountry('United States')}
            onMouseLeave={() => setHoveredCountry(null)}
            onClick={() => handleCountryClick('US')}
            title="United States"
          />
          
          {/* Canada */}
          <div 
            className="absolute bg-transparent hover:bg-blue-500/20 cursor-pointer transition-colors"
            style={{ 
              left: '10%', 
              top: '10%', 
              width: '35%', 
              height: '20%' 
            }}
            onMouseEnter={() => setHoveredCountry('Canada')}
            onMouseLeave={() => setHoveredCountry(null)}
            onClick={() => handleCountryClick('CA')}
            title="Canada"
          />
          
          {/* Brazil */}
          <div 
            className="absolute bg-transparent hover:bg-blue-500/20 cursor-pointer transition-colors"
            style={{ 
              left: '25%', 
              top: '55%', 
              width: '20%', 
              height: '25%' 
            }}
            onMouseEnter={() => setHoveredCountry('Brazil')}
            onMouseLeave={() => setHoveredCountry(null)}
            onClick={() => handleCountryClick('BR')}
            title="Brazil"
          />
          
          {/* Russia */}
          <div 
            className="absolute bg-transparent hover:bg-blue-500/20 cursor-pointer transition-colors"
            style={{ 
              left: '60%', 
              top: '10%', 
              width: '35%', 
              height: '25%' 
            }}
            onMouseEnter={() => setHoveredCountry('Russia')}
            onMouseLeave={() => setHoveredCountry(null)}
            onClick={() => handleCountryClick('RU')}
            title="Russia"
          />
          
          {/* China */}
          <div 
            className="absolute bg-transparent hover:bg-blue-500/20 cursor-pointer transition-colors"
            style={{ 
              left: '70%', 
              top: '30%', 
              width: '20%', 
              height: '20%' 
            }}
            onMouseEnter={() => setHoveredCountry('China')}
            onMouseLeave={() => setHoveredCountry(null)}
            onClick={() => handleCountryClick('CN')}
            title="China"
          />
          
          {/* India */}
          <div 
            className="absolute bg-transparent hover:bg-blue-500/20 cursor-pointer transition-colors"
            style={{ 
              left: '65%', 
              top: '40%', 
              width: '12%', 
              height: '15%' 
            }}
            onMouseEnter={() => setHoveredCountry('India')}
            onMouseLeave={() => setHoveredCountry(null)}
            onClick={() => handleCountryClick('IN')}
            title="India"
          />
          
          {/* Australia */}
          <div 
            className="absolute bg-transparent hover:bg-blue-500/20 cursor-pointer transition-colors"
            style={{ 
              left: '75%', 
              top: '70%', 
              width: '18%', 
              height: '15%' 
            }}
            onMouseEnter={() => setHoveredCountry('Australia')}
            onMouseLeave={() => setHoveredCountry(null)}
            onClick={() => handleCountryClick('AU')}
            title="Australia"
          />
          
          {/* Europe region */}
          <div 
            className="absolute bg-transparent hover:bg-blue-500/20 cursor-pointer transition-colors"
            style={{ 
              left: '48%', 
              top: '25%', 
              width: '15%', 
              height: '15%' 
            }}
            onMouseEnter={() => setHoveredCountry('Europe')}
            onMouseLeave={() => setHoveredCountry(null)}
            onClick={() => handleCountryClick('GB')}
            title="Europe"
          />
          
          {/* Africa region */}
          <div 
            className="absolute bg-transparent hover:bg-blue-500/20 cursor-pointer transition-colors"
            style={{ 
              left: '48%', 
              top: '45%', 
              width: '15%', 
              height: '25%' 
            }}
            onMouseEnter={() => setHoveredCountry('Africa')}
            onMouseLeave={() => setHoveredCountry(null)}
            onClick={() => handleCountryClick('ZA')}
            title="Africa"
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-6 left-6 z-10 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-lg shadow-xl border">
        <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Drag to pan
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Scroll to zoom
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Click regions to explore
          </span>
        </div>
      </div>

      {/* Scale indicator */}
      <div className="absolute bottom-6 right-6 z-10 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-xl border text-sm font-medium text-gray-700">
        Zoom: {Math.round(transform.scale * 100)}%
      </div>

      {/* Map title */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 drop-shadow-sm">
          Interactive World Map
        </h2>
        <p className="text-gray-600 drop-shadow-sm">
          Explore global preparedness information by country
        </p>
      </div>
    </div>
  );
};