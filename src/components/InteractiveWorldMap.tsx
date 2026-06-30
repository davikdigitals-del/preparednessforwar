import React from "react";

interface InteractiveWorldMapProps {
  onCountryClick?: (countryId: string) => void;
}

export const InteractiveWorldMap = ({ onCountryClick }: InteractiveWorldMapProps) => {

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-sky-100 to-sky-200 overflow-hidden">
      {/* Clean World Map - No Controls, No Text, No Zoom */}
      <div className="w-full h-full flex items-center justify-center">
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
  );
};