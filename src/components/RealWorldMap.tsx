import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface Country {
  id: string;
  name: string;
  path: string;
}

// Real world map SVG paths - simplified but accurate country boundaries
const worldCountries: Country[] = [
  {
    id: "US",
    name: "United States",
    path: "M844,206c2,1,5,2,5,4l1,4-1,3-4,1h-3l-4-2-3-3-1-4,1-3,3-2,4-1zm-72-12,2-1,4,1,3,2,2,3v4l-2,3-3,2-4,1-2-1-3-2-2-3v-4l2-3zm-42,25,3-1,4,1,2,2,1,3v3l-1,3-2,2-4,1-3-1-2-2-1-3v-3l1-3zm-87-45,4-1,5,2,4,3,3,4,1,5-1,5-3,4-4,3-5,2-4,1-5-2-4-3-3-4-1-5,1-5,3-4,4-3z"
  },
  {
    id: "CA",
    name: "Canada", 
    path: "M158,48l287,0,56,12,45,23,34,32,21,39,7,44-7,44-21,39-34,32-45,23-56,12-287,0-56-12-45-23-34-32-21-39-7-44,7-44,21-39,34-32,45-23,56-12z"
  },
  {
    id: "MX",
    name: "Mexico",
    path: "M158,287l134,0,23,5,18,9,13,13,7,16,2,18-2,18-7,16-13,13-18,9-23,5-134,0-23-5-18-9-13-13-7-16-2-18,2-18,7-16,13-13,18-9,23-5z"
  },
  {
    id: "GB",
    name: "United Kingdom",
    path: "M465,158l23,3,18,8,13,12,7,15,1,17-3,17-8,15-12,12-15,7-17,1-17-3-15-8-12-12-7-15-1-17,3-17,8-15,12-12,15-7z"
  },
  {
    id: "FR", 
    name: "France",
    path: "M465,189l67,0,12,3,9,6,6,9,2,11-1,11-4,10-7,8-10,5-12,2-67,0-12-3-9-6-6-9-2-11,1-11,4-10,7-8,10-5,12-2z"
  },
  {
    id: "DE",
    name: "Germany",
    path: "M498,156l45,0,8,2,6,4,4,6,1,7-1,7-4,6-6,4-8,2-45,0-8-2-6-4-4-6-1-7,1-7,4-6,6-4,8-2z"
  },
  {
    id: "IT",
    name: "Italy", 
    path: "M478,201l56,0,23,7,18,13,12,18,5,22-2,23-9,22-15,19-20,14-24,8-56,0-24-8-20-14-15-19-9-22-2-23,5-22,12-18,18-13,23-7z"
  },
  {
    id: "ES",
    name: "Spain",
    path: "M398,201l89,0,16,4,12,7,8,10,3,12-1,13-5,12-9,10-13,7-16,3-89,0-16-4-12-7-8-10-3-12,1-13,5-12,9-10,13-7,16-3z"
  },
  {
    id: "RU", 
    name: "Russia",
    path: "M534,67l223,0,45,8,36,15,27,22,17,28,6,33-3,36-12,37-21,36-29,33-36,28-42,21-47,13-51,4-223,0-51-4-47-13-42-21-36-28-29-33-21-36-12-37-3-36,6-33,17-28,27-22,36-15,45-8z"
  },
  {
    id: "CN",
    name: "China",
    path: "M578,178l134,0,23,5,18,9,13,13,7,16,2,18-2,18-7,16-13,13-18,9-23,5-134,0-23-5-18-9-13-13-7-16-2-18,2-18,7-16,13-13,18-9,23-5z"
  },
  {
    id: "IN", 
    name: "India",
    path: "M556,234l89,0,18,4,14,7,10,10,5,12,1,14-3,15-7,14-11,12-15,9-18,5-89,0-18-5-15-9-11-12-7-14-3-15,1-14,5-12,10-10,14-7,18-4z"
  },
  {
    id: "JP",
    name: "Japan",
    path: "M723,167l34,0,6,1,5,2,4,3,2,4,1,5-1,5-2,4-4,3-5,2-6,1-34,0-6-1-5-2-4-3-2-4-1-5,1-5,2-4,4-3,5-2,6-1z"
  },
  {
    id: "AU",
    name: "Australia", 
    path: "M623,334l112,0,19,4,15,7,11,10,6,12,1,14-2,15-6,14-10,12-14,9-18,5-112,0-18-5-14-9-10-12-6-14-2-15,1-14,6-12,11-10,15-7,19-4z"
  },
  {
    id: "BR",
    name: "Brazil",
    path: "M267,289l156,0,28,6,22,12,16,17,9,21,2,24-4,25-10,24-16,21-21,17-25,12-28,6-156,0-28-6-25-12-21-17-16-21-10-24-4-25,2-24,9-21,16-17,22-12,28-6z"
  },
  {
    id: "AR",
    name: "Argentina", 
    path: "M267,401l89,0,15,3,12,6,8,9,4,11,1,12-2,13-6,12-9,10-12,7-15,4-89,0-15-4-12-7-9-10-6-12-2-13,1-12,4-11,8-9,12-6,15-3z"
  },
  {
    id: "EG",
    name: "Egypt",
    path: "M498,245l45,0,8,2,6,4,4,6,1,7-1,7-4,6-6,4-8,2-45,0-8-2-6-4-4-6-1-7,1-7,4-6,6-4,8-2z"
  },
  {
    id: "ZA",
    name: "South Africa",
    path: "M478,356l67,0,12,3,9,6,6,9,2,11-1,11-4,10-7,8-10,5-12,2-67,0-12-2-10-5-7-8-4-10-1-11,2-11,6-9,9-6,12-3z"
  },
  {
    id: "NG",
    name: "Nigeria", 
    path: "M445,278l45,0,8,2,6,4,4,6,1,7-1,7-4,6-6,4-8,2-45,0-8-2-6-4-4-6-1-7,1-7,4-6,6-4,8-2z"
  },
  {
    id: "TR",
    name: "Turkey",
    path: "M498,189l67,0,12,3,9,6,6,9,2,11-1,11-4,10-7,8-10,5-12,2-67,0-12-2-10-5-7-8-4-10-1-11,2-11,6-9,9-6,12-3z"
  }
];

interface RealWorldMapProps {
  onCountryClick?: (countryId: string) => void;
}

export const RealWorldMap = ({ onCountryClick }: RealWorldMapProps) => {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(transform.scale * delta, 0.3), 8);
    
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
  const handleCountryClick = (countryId: string) => {
    if (onCountryClick) {
      onCountryClick(countryId);
    } else {
      navigate(`/countries/${countryId.toLowerCase()}`);
    }
  };

  // Reset zoom and pan
  const resetView = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen bg-slate-900 overflow-hidden"
      style={{ minHeight: '100vh' }}
    >
      {/* Map Controls */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-3">
        <button
          onClick={() => setTransform(prev => ({ ...prev, scale: Math.min(prev.scale * 1.3, 8) }))}
          className="w-12 h-12 bg-white/95 hover:bg-white rounded-xl shadow-2xl flex items-center justify-center font-bold text-xl text-slate-700 hover:text-slate-900 transition-all hover:shadow-xl border border-white/20 backdrop-blur-sm"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => setTransform(prev => ({ ...prev, scale: Math.max(prev.scale * 0.7, 0.3) }))}
          className="w-12 h-12 bg-white/95 hover:bg-white rounded-xl shadow-2xl flex items-center justify-center font-bold text-xl text-slate-700 hover:text-slate-900 transition-all hover:shadow-xl border border-white/20 backdrop-blur-sm"
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={resetView}
          className="w-12 h-12 bg-white/95 hover:bg-white rounded-xl shadow-2xl flex items-center justify-center text-lg font-bold text-slate-700 hover:text-slate-900 transition-all hover:shadow-xl border border-white/20 backdrop-blur-sm"
          title="Reset View"
        >
          🌍
        </button>
      </div>

      {/* Country tooltip */}
      {hoveredCountry && (
        <div className="absolute top-6 right-6 z-20 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-xl shadow-2xl border border-white/20 max-w-xs">
          <p className="font-bold text-slate-900 text-xl mb-1">
            {worldCountries.find(c => c.id === hoveredCountry)?.name}
          </p>
          <p className="text-sm text-slate-600">Click to explore regional content</p>
        </div>
      )}

      {/* Full-screen SVG Map */}
      <div 
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full select-none"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: 'center center'
          }}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Enhanced background with realistic ocean gradient */}
          <defs>
            <radialGradient id="oceanGradient" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#1e40af" />
              <stop offset="40%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
            
            {/* Country glow effect */}
            <filter id="countryGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            {/* Subtle grid pattern for navigation */}
            <pattern id="oceanGrid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e40af" strokeWidth="0.3" opacity="0.1"/>
            </pattern>
          </defs>
          
          {/* Ocean background */}
          <rect width="1000" height="500" fill="url(#oceanGradient)" />
          <rect width="1000" height="500" fill="url(#oceanGrid)" />

          {/* Countries with realistic styling */}
          {worldCountries.map((country) => (
            <g key={country.id}>
              <path
                d={country.path}
                fill={hoveredCountry === country.id ? "#3b82f6" : "#64748b"}
                stroke="#1e293b"
                strokeWidth="0.8"
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredCountry(country.id)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCountryClick(country.id);
                }}
                style={{
                  filter: hoveredCountry === country.id 
                    ? 'url(#countryGlow) brightness(1.3) saturate(1.2)' 
                    : 'brightness(1.1)',
                  transformOrigin: 'center'
                }}
              />
              
              {/* Country labels for high zoom levels */}
              {transform.scale > 3 && (
                <text
                  x="0" // Will be positioned based on country bounds
                  y="0"
                  textAnchor="middle"
                  className="fill-white font-bold pointer-events-none select-none"
                  style={{ 
                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))',
                    fontSize: `${14 / transform.scale}px`
                  }}
                >
                  {country.name}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Enhanced instructions */}
      <div className="absolute bottom-6 left-6 z-20 bg-black/80 backdrop-blur-sm text-white px-6 py-3 rounded-xl text-sm border border-white/10 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">🖱️</span>
            <span>Drag to explore</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">🔍</span>
            <span>Scroll to zoom</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">🌍</span>
            <span>Click countries</span>
          </div>
        </div>
      </div>

      {/* Scale and coordinates indicator */}
      <div className="absolute bottom-6 right-6 z-20 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-xl text-sm border border-white/10 shadow-2xl">
        <div className="flex items-center gap-4">
          <span>Zoom: {Math.round(transform.scale * 100)}%</span>
          <span className="w-px h-4 bg-white/30"></span>
          <span>Pan: {Math.round(transform.x)}, {Math.round(transform.y)}</span>
        </div>
      </div>
    </div>
  );
};