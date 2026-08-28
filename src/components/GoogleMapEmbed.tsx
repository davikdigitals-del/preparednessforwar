import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface GoogleMapEmbedProps {
  onCountryClick?: (countryId: string) => void;
}

export const GoogleMapEmbed = ({ onCountryClick }: GoogleMapEmbedProps) => {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('satellite');
  const navigate = useNavigate();

  const handleViewCountryList = () => {
    navigate('/countries?view=list');
  };

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden">
      
      {/* Map/Satellite Toggle */}
      <div className="absolute top-6 left-6 z-20 bg-white rounded-lg shadow-lg overflow-hidden border">
        <button
          onClick={() => setMapType('roadmap')}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            mapType === 'roadmap' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Map
        </button>
        <button
          onClick={() => setMapType('satellite')}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            mapType === 'satellite' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Risk Levels Legend */}
      <div className="absolute top-6 left-44 z-20 bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white">
        <h3 className="font-semibold text-sm mb-3">Risk Levels</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs">Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-xs">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs">Extreme</span>
          </div>
        </div>
        
        {/* View Country List Link */}
        <div className="mt-4 pt-3 border-t border-white/20">
          <button
            onClick={handleViewCountryList}
            className="flex items-center gap-2 text-xs text-blue-300 hover:text-blue-200 transition-colors"
          >
            <span>📋</span>
            <span>View Country List</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Fullscreen Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <button
          className="w-10 h-10 bg-white/90 hover:bg-white rounded-lg shadow-lg flex items-center justify-center text-gray-700 hover:text-gray-900 transition-all border"
          title="Toggle Fullscreen"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* Google Maps Embed */}
      <div className="w-full h-full">
        <iframe
          src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d143663105.40750602!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e${mapType === 'satellite' ? '1' : '0'}!3m2!1sen!2sus!4v1703123456789!5m2!1sen!2sus`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        ></iframe>
      </div>

      {/* Google Attribution */}
      <div className="absolute bottom-2 left-2 z-20">
        <img 
          src="https://developers.google.com/maps/documentation/images/google_on_white.png" 
          alt="Google" 
          className="h-4 opacity-80" 
        />
      </div>

      {/* View Country List Button */}
      <div className="absolute bottom-6 right-6 z-20">
        <button
          onClick={handleViewCountryList}
          className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-xl transition-all hover:shadow-2xl"
        >
          <span>View Country List</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-6 left-6 z-20 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm border border-white/10">
        <div className="flex items-center gap-4">
          <span>🌍 Interactive Google Maps</span>
          <span>🗺️ Toggle map/satellite</span>
          <span>📍 Click for country info</span>
        </div>
      </div>
    </div>
  );
};