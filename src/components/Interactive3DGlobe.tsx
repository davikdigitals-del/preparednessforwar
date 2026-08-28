import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Country {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

// Major countries with their coordinates for the 3D globe
const countries: Country[] = [
  { id: "US", name: "United States", lat: 39.8283, lng: -98.5795 },
  { id: "CA", name: "Canada", lat: 56.1304, lng: -106.3468 },
  { id: "MX", name: "Mexico", lat: 23.6345, lng: -102.5528 },
  { id: "BR", name: "Brazil", lat: -14.2350, lng: -51.9253 },
  { id: "AR", name: "Argentina", lat: -38.4161, lng: -63.6167 },
  { id: "GB", name: "United Kingdom", lat: 55.3781, lng: -3.4360 },
  { id: "FR", name: "France", lat: 46.2276, lng: 2.2137 },
  { id: "DE", name: "Germany", lat: 51.1657, lng: 10.4515 },
  { id: "IT", name: "Italy", lat: 41.8719, lng: 12.5674 },
  { id: "ES", name: "Spain", lat: 40.4637, lng: -3.7492 },
  { id: "RU", name: "Russia", lat: 61.5240, lng: 105.3188 },
  { id: "CN", name: "China", lat: 35.8617, lng: 104.1954 },
  { id: "IN", name: "India", lat: 20.5937, lng: 78.9629 },
  { id: "JP", name: "Japan", lat: 36.2048, lng: 138.2529 },
  { id: "AU", name: "Australia", lat: -25.2744, lng: 133.7751 },
  { id: "ZA", name: "South Africa", lat: -30.5595, lng: 22.9375 },
  { id: "EG", name: "Egypt", lat: 26.8206, lng: 30.8025 },
  { id: "NG", name: "Nigeria", lat: 9.0820, lng: 8.6753 },
  { id: "KE", name: "Kenya", lat: -0.0236, lng: 37.9062 },
  { id: "TR", name: "Turkey", lat: 38.9637, lng: 35.2433 },
  { id: "SA", name: "Saudi Arabia", lat: 23.8859, lng: 45.0792 },
  { id: "IR", name: "Iran", lat: 32.4279, lng: 53.6880 },
  { id: "PK", name: "Pakistan", lat: 30.3753, lng: 69.3451 },
  { id: "AF", name: "Afghanistan", lat: 33.9391, lng: 67.7100 },
  { id: "KR", name: "South Korea", lat: 35.9078, lng: 127.7669 },
  { id: "TH", name: "Thailand", lat: 15.8700, lng: 100.9925 },
  { id: "VN", name: "Vietnam", lat: 14.0583, lng: 108.2772 },
  { id: "MY", name: "Malaysia", lat: 4.2105, lng: 101.9758 },
  { id: "ID", name: "Indonesia", lat: -0.7893, lng: 113.9213 },
  { id: "PH", name: "Philippines", lat: 12.8797, lng: 121.7740 },
  { id: "NO", name: "Norway", lat: 60.4720, lng: 8.4689 },
  { id: "SE", name: "Sweden", lat: 60.1282, lng: 18.6435 },
  { id: "FI", name: "Finland", lat: 61.9241, lng: 25.7482 },
  { id: "DK", name: "Denmark", lat: 56.2639, lng: 9.5018 },
  { id: "NL", name: "Netherlands", lat: 52.1326, lng: 5.2913 },
  { id: "BE", name: "Belgium", lat: 50.5039, lng: 4.4699 },
  { id: "CH", name: "Switzerland", lat: 46.8182, lng: 8.2275 },
  { id: "AT", name: "Austria", lat: 47.5162, lng: 14.5501 },
  { id: "PL", name: "Poland", lat: 51.9194, lng: 19.1451 },
  { id: "CZ", name: "Czech Republic", lat: 49.8175, lng: 15.4730 },
  { id: "HU", name: "Hungary", lat: 47.1625, lng: 19.5033 }
];

interface Interactive3DGlobeProps {
  onCountryClick?: (countryId: string) => void;
}

export const Interactive3DGlobe = ({ onCountryClick }: Interactive3DGlobeProps) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const globeRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const navigate = useNavigate();

  // Auto-rotation when not interacting
  useEffect(() => {
    if (!isDragging) {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        setRotation(prev => ({
          ...prev,
          y: prev.y + 0.2 // Slow auto-rotation
        }));
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDragging]);

  // Convert lat/lng to 3D coordinates on sphere
  const latLngTo3D = (lat: number, lng: number, radius: number = 200) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    return { x, y, z };
  };

  // Apply rotation to 3D point
  const applyRotation = (point: { x: number; y: number; z: number }) => {
    const rotX = rotation.x * (Math.PI / 180);
    const rotY = rotation.y * (Math.PI / 180);
    
    // Rotate around Y axis
    const x1 = point.x * Math.cos(rotY) - point.z * Math.sin(rotY);
    const z1 = point.x * Math.sin(rotY) + point.z * Math.cos(rotY);
    
    // Rotate around X axis
    const y2 = point.y * Math.cos(rotX) - z1 * Math.sin(rotX);
    const z2 = point.y * Math.sin(rotX) + z1 * Math.cos(rotX);
    
    return { x: x1, y: y2, z: z2 };
  };

  // Project 3D to 2D screen coordinates
  const project3D = (point: { x: number; y: number; z: number }) => {
    const perspective = 800;
    const scale = perspective / (perspective + point.z);
    
    return {
      x: point.x * scale,
      y: point.y * scale,
      scale: scale,
      visible: point.z > -200 // Only show front-facing points
    };
  };

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - rotation.y, y: e.clientY - rotation.x });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    
    if (isDragging) {
      setRotation({
        x: e.clientY - dragStart.y,
        y: e.clientX - dragStart.x
      });
    }
  };

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

  // Generate positioned countries
  const positionedCountries = countries.map(country => {
    const point3D = latLngTo3D(country.lat, country.lng);
    const rotated3D = applyRotation(point3D);
    const projected = project3D(rotated3D);
    
    return {
      ...country,
      screen: projected,
      distance: rotated3D.z // For z-index sorting
    };
  }).filter(country => country.screen.visible)
    .sort((a, b) => b.distance - a.distance); // Back to front rendering

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-900 via-blue-900 to-black overflow-hidden">
      {/* Stars background */}
      <div className="absolute inset-0">
        {Array.from({ length: 200 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 0.5}px`,
              height: `${Math.random() * 2 + 0.5}px`,
              opacity: Math.random() * 0.8 + 0.2,
              animation: `twinkle ${Math.random() * 3 + 2}s infinite`
            }}
          />
        ))}
      </div>

      {/* Globe container */}
      <div 
        ref={globeRef}
        className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* 3D Globe */}
        <div className="relative">
          {/* Globe sphere with CSS 3D effect */}
          <div
            className="w-96 h-96 rounded-full relative"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, #3b82f6, #1e40af),
                radial-gradient(circle at 70% 70%, #0ea5e9, #0369a1)
              `,
              boxShadow: `
                inset -20px -20px 50px rgba(0,0,0,0.5),
                inset 20px 20px 50px rgba(255,255,255,0.1),
                0 0 50px rgba(59, 130, 246, 0.3)
              `,
              transform: `rotateX(${rotation.x * 0.3}deg) rotateY(${rotation.y * 0.3}deg)`,
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Globe grid lines */}
            <div className="absolute inset-0 rounded-full overflow-hidden opacity-20">
              {/* Latitude lines */}
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={`lat-${i}`}
                  className="absolute w-full border-t border-cyan-300"
                  style={{
                    top: `${(i + 1) * 10}%`,
                    transform: `scaleX(${Math.sin(((i + 1) * 18) * Math.PI / 180)})`
                  }}
                />
              ))}
              
              {/* Longitude lines */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={`lng-${i}`}
                  className="absolute h-full border-l border-cyan-300"
                  style={{
                    left: `${(i + 1) * 12.5}%`,
                    transformOrigin: 'top center',
                    transform: `rotateZ(${i * 22.5}deg) scaleY(${Math.abs(Math.cos((i * 22.5) * Math.PI / 180))})`
                  }}
                />
              ))}
            </div>

            {/* Country markers */}
            {positionedCountries.map(country => (
              <div
                key={country.id}
                className="absolute w-3 h-3 transform -translate-x-1/2 -translate-y-1/2 z-10"
                style={{
                  left: `${50 + (country.screen.x / 4)}%`,
                  top: `${50 - (country.screen.y / 4)}%`,
                  opacity: country.screen.scale,
                  transform: `translate(-50%, -50%) scale(${Math.max(country.screen.scale, 0.3)})`
                }}
                onMouseEnter={() => setHoveredCountry(country.id)}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCountryClick(country.id);
                }}
              >
                {/* Country dot */}
                <div 
                  className={`w-full h-full rounded-full cursor-pointer transition-all duration-200 ${
                    hoveredCountry === country.id 
                      ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50 scale-150' 
                      : 'bg-red-500 shadow-md shadow-red-500/30'
                  }`}
                  style={{
                    boxShadow: hoveredCountry === country.id 
                      ? '0 0 20px rgba(251, 191, 36, 0.8), 0 0 40px rgba(251, 191, 36, 0.4)'
                      : '0 0 10px rgba(239, 68, 68, 0.6)'
                  }}
                />
                
                {/* Pulse animation for hovered country */}
                {hoveredCountry === country.id && (
                  <div className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-75" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Country tooltip */}
      {hoveredCountry && (
        <div
          className="absolute z-20 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-xl border border-white/20 pointer-events-none"
          style={{
            left: mousePosition.x + 20,
            top: mousePosition.y - 60,
            transform: 'translateX(-50%)'
          }}
        >
          <p className="font-bold text-slate-900 text-lg whitespace-nowrap">
            {countries.find(c => c.id === hoveredCountry)?.name}
          </p>
          <p className="text-xs text-slate-600 mt-1">Click to explore content</p>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-sm text-white px-4 py-3 rounded-lg text-sm border border-white/10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-cyan-400">🖱️</span>
            <span>Drag to rotate the globe</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-yellow-400">🎯</span>
            <span>Hover red dots to see countries</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-green-400">🌍</span>
            <span>Click to explore preparedness content</span>
          </div>
        </div>
      </div>

      {/* Globe title */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-center">
        <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
          Interactive Earth Globe
        </h2>
        <p className="text-cyan-200 text-sm drop-shadow">
          Explore preparedness information by country
        </p>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};