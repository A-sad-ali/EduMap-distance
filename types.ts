export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PinData {
  location: Coordinates;
  name: string;
}

export interface RouteInfo {
  distance: string; // km
  time: string; // formatted time
  straightDistance: string; // km
}

// Data types for the Excel Visualizer
export type InstitutionType = 'HSSC' | 'College';

export interface Institution {
  id: string;
  name: string;
  district: string;
  gender: string; // 'boys', 'girls', 'co-edu'
  level: string; 
  lat: number;
  lng: number;
  type: InstitutionType;
  metadata: Record<string, any>;
}

export interface LayerVisibility {
  // HSSC
  'high': boolean;
  'higher secondary': boolean;
  // Colleges
  'degree': boolean;
  'inter': boolean;
  'commerce': boolean;
  'physical': boolean;
  'post graduate': boolean;
}

export interface ShareData {
  pinA?: Coordinates;
  pinB?: Coordinates;
  includeRoute: boolean;
  includeMapView: boolean;
  mapView?: {
    center: Coordinates;
    zoom: number;
  };
}