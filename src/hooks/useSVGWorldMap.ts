import { useEffect, useRef, useState } from 'react';
import type { SVGWorldMapOptions, SVGWorldMapInstance, CountryClickEvent } from '@/types/svg-world-map';

interface UseSVGWorldMapProps {
  options?: SVGWorldMapOptions;
  onCountryClick?: (country: CountryClickEvent) => void;
  onCountryHover?: (country: CountryClickEvent) => void;
}

export const useSVGWorldMap = ({
  options = {},
  onCountryClick,
  onCountryHover
}: UseSVGWorldMapProps = {}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<SVGWorldMapInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load the SVG World Map script if not already loaded
        if (!window.svgWorldMap) {
          await loadScript('/svg-world-map/svg-world-map.js');
        }

        if (!isMounted) return;

        // Create global callback functions
        const callbackName = `svgWorldMapCallback_${Date.now()}`;
        
        // Set up global callbacks
        (window as any)[`${callbackName}_click`] = (country: CountryClickEvent) => {
          if (onCountryClick) {
            onCountryClick(country);
          }
        };

        (window as any)[`${callbackName}_over`] = (country: CountryClickEvent) => {
          if (onCountryHover) {
            onCountryHover(country);
          }
        };

        (window as any)[`${callbackName}_out`] = () => {
          // Handle mouse out if needed
        };

        const mapOptions: SVGWorldMapOptions = {
          libPath: '/svg-world-map/',
          bigMap: true,
          showOcean: true,
          showAntarctica: false,
          showLabels: false,
          showMicroLabels: false,
          showMicroStates: true,
          showInfoBox: false,
          oceanColor: '#f0f8ff',
          worldColor: '#ffffff',
          labelFill: {
            out: '#666666',
            over: '#333333',
            click: '#000000'
          },
          countryStroke: {
            out: '#e5e7eb',
            over: '#3b82f6',
            click: '#1d4ed8'
          },
          mapClick: `${callbackName}_click`,
          mapOver: `${callbackName}_over`,
          mapOut: `${callbackName}_out`,
          ...options
        };

        // Initialize the map
        const instance = await window.svgWorldMap(mapOptions);
        
        if (isMounted) {
          setMapInstance(instance);
        }

      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load map');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMap();

    return () => {
      isMounted = false;
      if (mapInstance) {
        mapInstance.destroy?.();
      }
    };
  }, [options, onCountryClick, onCountryHover]);

  return {
    containerRef,
    mapInstance,
    isLoading,
    error
  };
};

// Helper function to dynamically load scripts
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
};