/**
 * TypeScript definitions for SVG World Map library
 */

declare global {
  interface Window {
    svgWorldMap: (options?: SVGWorldMapOptions) => Promise<SVGWorldMapInstance>;
  }
}

export interface SVGWorldMapOptions {
  bigMap?: boolean;
  showOcean?: boolean;
  showAntarctica?: boolean;
  showLabels?: boolean;
  showMicroLabels?: boolean;
  showMicroStates?: boolean;
  showInfoBox?: boolean;
  backgroundImage?: string;
  oceanColor?: string;
  worldColor?: string;
  labelFill?: {
    out: string;
    over: string;
    click: string;
  };
  countryStroke?: {
    out: string;
    over: string;
    click: string;
  };
  mapOut?: string;
  mapOver?: string;
  mapClick?: string;
  libPath?: string;
}

export interface Country {
  id: string;
  name: string;
  longname: string;
  sovereignty: string;
  region: string;
  population: number;
  provinces?: Province[];
}

export interface Province {
  id: string;
  name: string;
  country: Country;
}

export interface CountryClickEvent {
  id: string;
  country: Country;
  event: MouseEvent;
}

export interface SVGWorldMapInstance {
  over: (countryId: string) => void;
  out: (countryId: string) => void;
  click: (countryId: string) => void;
  labels: (type: 'all' | 'micro' | 'none') => void;
  download: (format: 'svg' | 'png') => void;
  destroy: () => void;
}

export {};