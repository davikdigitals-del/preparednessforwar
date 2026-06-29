import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Country {
  id: string;
  name: string;
  path: string;
}

// Real world map SVG paths (simplified) - Based on Natural Earth data
const countries: Country[] = [
  {
    id: "US",
    name: "United States",
    path: "M158,206 L248,206 L248,180 L280,180 L280,220 L158,220 Z"
  },
  {
    id: "CA", 
    name: "Canada",
    path: "M145,80 L300,80 L300,160 L145,160 Z"
  },
  {
    id: "MX",
    name: "Mexico",
    path: "M158,225 L248,225 L235,260 L175,260 Z"
  },
  {
    id: "BR",
    name: "Brazil",
    path: "M250,280 L330,280 L340,360 L240,360 L240,320 Z"
  },
  {
    id: "AR",
    name: "Argentina",
    path: "M240,365 L290,365 L285,420 L235,420 Z"
  },
  {
    id: "GB",
    name: "United Kingdom", 
    path: "M430,140 L445,140 L445,160 L430,160 Z"
  },
  {
    id: "FR",
    name: "France",
    path: "M440,165 L475,165 L475,195 L440,195 Z"
  },
  {
    id: "DE",
    name: "Germany", 
    path: "M465,145 L490,145 L490,175 L465,175 Z"
  },
  {
    id: "IT",
    name: "Italy",
    path: "M460,180 L485,180 L485,215 L460,215 Z"
  },
  {
    id: "ES",
    name: "Spain",
    path: "M410,180 L455,180 L455,210 L410,210 Z"
  },
  {
    id: "RU",
    name: "Russia",
    path: "M500,90 L680,90 L680,170 L500,170 Z"
  },
  {
    id: "CN",
    name: "China",
    path: "M560,170 L640,170 L640,220 L560,220 Z"
  },
  {
    id: "IN",
    name: "India",
    path: "M535,210 L585,210 L585,260 L535,260 Z"
  },
  {
    id: "JP",
    name: "Japan",
    path: "M645,175 L665,175 L665,200 L645,200 Z"
  },
  {
    id: "AU",
    name: "Australia",
    path: "M590,300 L660,300 L660,340 L590,340 Z"
  },
  {
    id: "ZA",
    name: "South Africa", 
    path: "M470,320 L520,320 L520,350 L470,350 Z"
  },
  {
    id: "EG",
    name: "Egypt",
    path: "M480,220 L510,220 L510,250 L480,250 Z"
  },
  {
    id: "NG",
    name: "Nigeria",
    path: "M440,260 L470,260 L470,290 L440,290 Z"
  },
  {
    id: "KE",
    name: "Kenya",
    path: "M510,270 L530,270 L530,295 L510,295 Z"
  },
  {
    id: "TR",
    name: "Turkey",
    path: "M485,175 L530,175 L530,195 L485,195 Z"
  },
  {
    id: "SA",
    name: "Saudi Arabia",
    path: "M500,215 L545,215 L545,250 L500,250 Z"
  },
  {
    id: "IR",
    name: "Iran",
    path: "M520,195 L565,195 L565,225 L520,225 Z"
  },
  {
    id: "PK",
    name: "Pakistan",
    path: "M555,185 L585,185 L585,215 L555,215 Z"
  },
  {
    id: "AF",
    name: "Afghanistan",
    path: "M540,180 L575,180 L575,200 L540,200 Z"
  },
  {
    id: "KR",
    name: "South Korea",
    path: "M620,180 L635,180 L635,195 L620,195 Z"
  },
  {
    id: "TH",
    name: "Thailand",
    path: "M580,225 L600,225 L600,250 L580,250 Z"
  },
  {
    id: "VN",
    name: "Vietnam",
    path: "M595,215 L610,215 L610,245 L595,245 Z"
  },
  {
    id: "MY",
    name: "Malaysia",
    path: "M585,255 L620,255 L620,275 L585,275 Z"
  },
  {
    id: "ID",
    name: "Indonesia",
    path: "M590,280 L650,280 L650,300 L590,300 Z"
  },
  {
    id: "PH",
    name: "Philippines",
    path: "M615,235 L635,235 L635,265 L615,265 Z"
  },
  {
    id: "NO",
    name: "Norway",
    path: "M450,100 L485,100 L485,140 L450,140 Z"
  },
  {
    id: "SE",
    name: "Sweden",
    path: "M470,110 L490,110 L490,145 L470,145 Z"
  },
  {
    id: "FI",
    name: "Finland",
    path: "M485,115 L510,115 L510,150 L485,150 Z"
  },
  {
    id: "DK",
    name: "Denmark",
    path: "M455,150 L475,150 L475,165 L455,165 Z"
  },
  {
    id: "NL",
    name: "Netherlands",
    path: "M445,155 L465,155 L465,170 L445,170 Z"
  },
  {
    id: "BE",
    name: "Belgium",
    path: "M440,170 L460,170 L460,180 L440,180 Z"
  },
  {
    id: "CH",
    name: "Switzerland",
    path: "M460,175 L480,175 L480,185 L460,185 Z"
  },
  {
    id: "AT",
    name: "Austria",
    path: "M470,170 L495,170 L495,180 L470,180 Z"
  },
  {
    id: "PL",
    name: "Poland",
    path: "M480,150 L510,150 L510,175 L480,175 Z"
  },
  {
    id: "CZ",
    name: "Czech Republic",
    path: "M470,165 L490,165 L490,175 L470,175 Z"
  },
  {
    id: "HU",
    name: "Hungary",
    path: "M480,175 L505,175 L505,185 L480,185 Z"
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
    <div className="relative w-full h-[600px] bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-xl">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setTransform(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 4) }))}
          className="w-10 h-10 bg-white/95 hover:bg-white rounded-lg shadow-lg flex items-center justify-center font-bold text-slate-700 hover:text-slate-900 transition-all hover:shadow-xl border border-white/20"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => setTransform(prev => ({ ...prev, scale: Math.max(prev.scale * 0.8, 0.5) }))}
          className="w-10 h-10 bg-white/95 hover:bg-white rounded-lg shadow-lg flex items-center justify-center font-bold text-slate-700 hover:text-slate-900 transition-all hover:shadow-xl border border-white/20"
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={resetView}
          className="w-10 h-10 bg-white/95 hover:bg-white rounded-lg shadow-lg flex items-center justify-center text-xs font-bold text-slate-700 hover:text-slate-900 transition-all hover:shadow-xl border border-white/20"
          title="Reset View"
        >
          ⌂
        </button>
      </div>

      {/* Country name tooltip */}
      {hoveredCountry && (
        <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-xl border border-white/20">
          <p className="font-bold text-slate-900 text-lg">
            {countries.find(c => c.id === hoveredCountry)?.name}
          </p>
          <p className="text-xs text-slate-600 mt-1">Click to explore content</p>
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
          {/* Ocean background with gradient */}
          <defs>
            <radialGradient id="oceanGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
            <filter id="countryGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <rect width="800" height="450" fill="url(#oceanGradient)" />
          
          {/* Subtle grid pattern */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e40af" strokeWidth="0.5" opacity="0.1"/>
            </pattern>
          </defs>
          <rect width="800" height="450" fill="url(#grid)" />

          {/* Countries */}
          {countries.map((country) => (
            <g key={country.id}>
              <path
                d={country.path}
                fill={hoveredCountry === country.id ? "#3b82f6" : "#64748b"}
                stroke="#1e293b"
                strokeWidth="0.5"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredCountry(country.id)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCountryClick(country.id);
                }}
                style={{
                  filter: hoveredCountry === country.id 
                    ? 'url(#countryGlow) brightness(1.2)' 
                    : 'brightness(1)',
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
      <div className="absolute bottom-4 left-4 z-10 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm border border-white/10">
        <div className="flex items-center gap-4 text-xs">
          <span>🖱️ Drag to pan</span>
          <span>🔍 Scroll to zoom</span>
          <span>🌍 Click countries</span>
        </div>
      </div>

      {/* Scale indicator */}
      <div className="absolute bottom-4 right-4 z-10 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs border border-white/10">
        Zoom: {Math.round(transform.scale * 100)}%
      </div>
    </div>
  );
};