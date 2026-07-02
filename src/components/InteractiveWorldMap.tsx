import React from "react";
import { useNavigate } from "react-router-dom";
import { useSVGWorldMap } from "@/hooks/useSVGWorldMap";
import type { CountryClickEvent } from "@/types/svg-world-map";

interface InteractiveWorldMapProps {
  onCountryClick?: (countryId: string) => void;
}

export const InteractiveWorldMap = ({ onCountryClick }: InteractiveWorldMapProps) => {
  const navigate = useNavigate();

  const handleCountryClick = (country: CountryClickEvent) => {
    console.log('Country clicked:', country);
    
    // Use the country ID (2-letter code) from the SVG map
    const countryCode = country.id?.toLowerCase();
    
    if (onCountryClick) {
      onCountryClick(countryCode);
    } else if (countryCode && countryCode !== 'ocean') {
      navigate(`/countries/${countryCode}`);
    }
  };

  const handleCountryHover = (country: CountryClickEvent) => {
    // Optional: Add hover effects or logging
    console.log('Country hovered:', country.id);
  };

  const { containerRef, mapInstance, isLoading, error } = useSVGWorldMap({
    options: {
      bigMap: true,
      showOcean: true,
      showAntarctica: false,
      showLabels: false,
      showMicroLabels: false,
      showMicroStates: true,
      showInfoBox: false,
      oceanColor: '#f0f8ff',
      worldColor: '#ffffff',
      countryStroke: {
        out: '#e5e7eb',
        over: '#3b82f6',
        click: '#1d4ed8'
      }
    },
    onCountryClick: handleCountryClick,
    onCountryHover: handleCountryHover
  });

  if (isLoading) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Interactive World Map...</p>
          <p className="text-sm text-gray-500">Preparing SVG map with all countries</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="font-bold text-xl text-gray-900 mb-2">Map Loading Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reload Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-gray-50"
      style={{
        cursor: 'grab'
      }}
    >
      {/* The SVG map will be injected here by the library */}
      {/* Custom styles for the SVG world map will be added via CSS classes */}
    </div>
  );
};