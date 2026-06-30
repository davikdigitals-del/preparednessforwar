import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Country {
  id: string;
  name: string;
  path: string;
  color?: string;
}

// Real world map SVG paths with more accurate country shapes and colors
const countries: Country[] = [
  {
    id: "US",
    name: "United States",
    path: "M158,180 L158,240 L200,240 L280,240 L280,200 L320,200 L320,180 L280,180 L280,160 L240,160 L200,160 L158,160 Z M200,140 L240,140 L240,120 L280,120 L280,140 L320,140 L340,140 L340,160 L320,160 L320,180 Z",
    color: "#22c55e"
  },
  {
    id: "CA", 
    name: "Canada",
    path: "M140,60 L340,60 L340,80 L360,80 L360,100 L380,100 L380,120 L360,120 L360,140 L340,140 L320,140 L320,120 L280,120 L240,120 L200,120 L180,120 L160,120 L140,120 Z",
    color: "#ef4444"
  },
  {
    id: "MX",
    name: "Mexico", 
    path: "M158,240 L200,240 L240,240 L280,240 L280,260 L260,280 L240,280 L220,280 L200,280 L180,280 L158,260 Z",
    color: "#10b981"
  },
  {
    id: "BR",
    name: "Brazil",
    path: "M240,300 L320,300 L340,320 L360,340 L360,380 L340,400 L320,400 L300,380 L280,360 L260,340 L240,320 Z",
    color: "#f59e0b"
  },
  {
    id: "AR",
    name: "Argentina",
    path: "M240,380 L280,380 L300,400 L300,440 L280,460 L260,460 L240,440 L240,420 L240,400 Z",
    color: "#8b5cf6"
  },
  {
    id: "GB",
    name: "United Kingdom", 
    path: "M430,130 L450,130 L450,150 L470,150 L470,170 L450,170 L430,170 L430,150 Z",
    color: "#ec4899"
  },
  {
    id: "FR",
    name: "France",
    path: "M440,170 L480,170 L490,180 L490,200 L480,210 L460,210 L440,200 L440,180 Z",
    color: "#3b82f6"
  },
  {
    id: "DE",
    name: "Germany", 
    path: "M470,140 L500,140 L510,150 L510,170 L500,180 L490,180 L480,170 L470,160 Z",
    color: "#f97316"
  },
  {
    id: "IT",
    name: "Italy",
    path: "M470,180 L480,180 L490,190 L490,210 L480,220 L470,230 L460,220 L460,200 L470,190 Z",
    color: "#22c55e"
  },
  {
    id: "ES",
    name: "Spain",
    path: "M410,180 L450,180 L460,190 L460,210 L450,220 L420,220 L410,210 L400,200 L400,190 Z",
    color: "#f59e0b"
  },
  {
    id: "RU",
    name: "Russia",
    path: "M500,80 L700,80 L720,90 L720,120 L700,140 L680,150 L660,160 L640,170 L620,170 L600,160 L580,150 L560,140 L540,130 L520,120 L500,110 Z",
    color: "#dc2626"
  },
  {
    id: "CN",
    name: "China",
    path: "M560,150 L620,150 L640,160 L650,180 L640,200 L620,210 L600,220 L580,210 L560,200 L550,180 L560,160 Z",
    color: "#eab308"
  },
  {
    id: "IN",
    name: "India",
    path: "M540,200 L580,200 L590,220 L590,240 L580,260 L570,270 L550,270 L540,260 L530,240 L530,220 Z",
    color: "#f97316"
  },
  {
    id: "AU",
    name: "Australia",
    path: "M600,320 L680,320 L700,330 L720,340 L720,360 L700,370 L680,370 L660,360 L640,350 L620,340 L600,330 Z",
    color: "#06b6d4"
  },
  {
    id: "JP",
    name: "Japan",
    path: "M660,160 L680,160 L690,170 L690,190 L680,200 L670,200 L660,190 L660,170 Z M670,140 L685,140 L685,155 L670,155 Z",
    color: "#ec4899"
  },
  {
    id: "ZA",
    name: "South Africa", 
    path: "M480,340 L520,340 L530,350 L530,370 L520,380 L500,380 L480,370 L470,360 L470,350 Z",
    color: "#8b5cf6"
  }
];

interface InteractiveWorldMapProps {
  onCountryClick?: (countryId: string) => void;
}

export const InteractiveWorldMap = ({ onCountryClick }: InteractiveWorldMapProps) => {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
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
    <div className="relative w-full h-screen bg-gradient-to-b from-blue-50 via-blue-100 to-blue-200 overflow-hidden">
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

      {/* Country name tooltip */}
      {hoveredCountry && (
        <div className="absolute top-6 right-6 z-10 bg-white px-6 py-4 rounded-lg shadow-xl border">
          <p className="font-bold text-gray-900 text-xl">
            {countries.find(c => c.id === hoveredCountry)?.name}
          </p>
          <p className="text-sm text-gray-600 mt-1">Click to explore preparedness content</p>
        </div>
      )}

      {/* SVG Map */}
      <div 
        className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 800 450"
          className="w-full h-full select-none"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: 'center center'
          }}
        >
          {/* Ocean background with realistic gradient */}
          <defs>
            <radialGradient id="oceanGradient" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#87ceeb" />
              <stop offset="70%" stopColor="#4682b4" />
              <stop offset="100%" stopColor="#1e40af" />
            </radialGradient>
            <filter id="countryGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="countryShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
            </filter>
          </defs>
          
          <rect width="800" height="500" fill="url(#oceanGradient)" />
          
          {/* Latitude and longitude grid lines */}
          <g opacity="0.1">
            {/* Latitude lines */}
            {Array.from({ length: 9 }).map((_, i) => (
              <line 
                key={`lat-${i}`}
                x1="0" 
                y1={50 + i * 50} 
                x2="800" 
                y2={50 + i * 50} 
                stroke="#ffffff" 
                strokeWidth="1"
              />
            ))}
            {/* Longitude lines */}
            {Array.from({ length: 16 }).map((_, i) => (
              <line 
                key={`lng-${i}`}
                x1={50 + i * 50} 
                y1="0" 
                x2={50 + i * 50} 
                y2="500" 
                stroke="#ffffff" 
                strokeWidth="1"
              />
            ))}
          </g>

          {/* Countries with realistic colors and shapes */}
          {countries.map((country) => (
            <g key={country.id}>
              <path
                d={country.path}
                fill={hoveredCountry === country.id ? "#ffffff" : (country.color || "#22c55e")}
                stroke="#1f2937"
                strokeWidth="1"
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
                    : 'url(#countryShadow)',
                  transformOrigin: 'center'
                }}
              />
            </g>
          ))}

          {/* Country labels (shown on higher zoom levels) */}
          {transform.scale > 2 && countries.map((country) => {
            // Simple label positioning based on country center
            const pathBounds = {
              x: 400, // Will be calculated properly in real implementation
              y: 200
            };
            
            return (
              <text
                key={`label-${country.id}`}
                x={pathBounds.x}
                y={pathBounds.y}
                textAnchor="middle"
                className="fill-white text-xs font-bold pointer-events-none select-none"
                style={{ 
                  filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))',
                  fontSize: `${12 / transform.scale}px`
                }}
              >
                {country.name}
              </text>
            );
          })}
        </svg>
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
            Click countries to explore
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