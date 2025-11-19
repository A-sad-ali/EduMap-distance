import React, { useEffect, useRef } from 'react';
import { Coordinates, Institution, RouteInfo } from '../types';
import { DEFAULT_CENTER, DEFAULT_ZOOM, ICON_COLORS, LEVEL_CODES, LAYER_NAMES } from '../constants';
import { Legend } from './Legend';

// Declare global Leaflet variable
declare const L: any;

interface MapComponentProps {
  pinA: Coordinates | null;
  pinB: Coordinates | null;
  setPinA: (coords: Coordinates | null) => void;
  setPinB: (coords: Coordinates | null) => void;
  currentPinMode: 'A' | 'B';
  setCurrentPinMode: (mode: 'A' | 'B') => void;
  institutions: Institution[];
  onRouteCalculated: (info: RouteInfo | null) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({
  pinA,
  pinB,
  setPinA,
  setPinB,
  currentPinMode,
  setCurrentPinMode,
  institutions,
  onRouteCalculated
}) => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  const markerARef = useRef<any>(null);
  const markerBRef = useRef<any>(null);
  const routeControlRef = useRef<any>(null);
  const straightLineRef = useRef<any>(null);
  
  // Refs for layer management
  const layerControlRef = useRef<any>(null);
  const layerGroupsRef = useRef<Record<string, any>>({});

  // Initialize Map
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    // Define Base Layers
    const baseLayers = {
      "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
        attribution: '&copy; OpenStreetMap contributors' 
      }),
      "Terrain (Google)": L.tileLayer('http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}', { 
        attribution: '&copy; Google' 
      }),
      "Carto Light": L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { 
        attribution: '&copy; CartoDB' 
      }),
      "Carto Dark": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { 
        attribution: '&copy; CartoDB' 
      }),
      "Esri Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { 
        attribution: '&copy; Esri' 
      }),
      "Google Roads": L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', { 
        attribution: '&copy; Google' 
      }),
      "Google Satellite": L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { 
        attribution: '&copy; Google' 
      }),
      "Google Hybrid": L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { 
        attribution: '&copy; Google' 
      }),
    };

    // Create Map
    mapRef.current = L.map(mapContainerRef.current, {
      center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
      zoom: DEFAULT_ZOOM,
      layers: [baseLayers["OpenStreetMap"]] // Default base layer
    });

    // Initialize Layer Groups for Overlays
    const overlays: Record<string, any> = {};
    
    // Create a marker cluster group for each category defined in LAYER_NAMES
    Object.entries(LAYER_NAMES).forEach(([key, name]) => {
      const group = L.markerClusterGroup({
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        spiderfyOnMaxZoom: true
      }).addTo(mapRef.current); // Add to map by default
      
      layerGroupsRef.current[key] = group;
      overlays[name] = group;
    });

    // Add Control to Map
    layerControlRef.current = L.control.layers(baseLayers, overlays, { collapsed: true }).addTo(mapRef.current);

    // Click Handler
    mapRef.current.on('click', (e: any) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      window.dispatchEvent(new CustomEvent('map-click', { detail: { lat, lng } }));
    });
  }, []);

  // Handle Map Click via Event
  useEffect(() => {
    const handleMapClick = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const coords = { lat: detail.lat, lng: detail.lng };

      if (currentPinMode === 'A') {
        setPinA(coords);
        setCurrentPinMode('B');
      } else {
        setPinB(coords);
        setCurrentPinMode('A');
      }
    };

    window.addEventListener('map-click', handleMapClick);
    return () => window.removeEventListener('map-click', handleMapClick);
  }, [currentPinMode, setPinA, setPinB, setCurrentPinMode]);

  // Handle Pin A Marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (pinA) {
      if (markerARef.current) {
        markerARef.current.setLatLng([pinA.lat, pinA.lng]);
      } else {
        const icon = L.divIcon({
          className: 'custom-pin-a',
          html: '<i class="fas fa-map-pin" style="color: #e74c3c; font-size: 32px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"></i>',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        markerARef.current = L.marker([pinA.lat, pinA.lng], { 
          icon, 
          draggable: true 
        }).addTo(mapRef.current);
        
        markerARef.current.bindPopup("Pin A (Drag to move)");

        markerARef.current.on('dragend', (e: any) => {
          const pos = e.target.getLatLng();
          setPinA({ lat: pos.lat, lng: pos.lng });
        });
      }
    } else {
      if (markerARef.current) {
        mapRef.current.removeLayer(markerARef.current);
        markerARef.current = null;
      }
    }
  }, [pinA, setPinA]);

  // Handle Pin B Marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (pinB) {
      if (markerBRef.current) {
        markerBRef.current.setLatLng([pinB.lat, pinB.lng]);
      } else {
        const icon = L.divIcon({
          className: 'custom-pin-b',
          html: '<i class="fas fa-map-pin" style="color: #4361ee; font-size: 32px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"></i>',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        markerBRef.current = L.marker([pinB.lat, pinB.lng], { 
          icon, 
          draggable: true 
        }).addTo(mapRef.current);

        markerBRef.current.bindPopup("Pin B (Drag to move)");

        markerBRef.current.on('dragend', (e: any) => {
          const pos = e.target.getLatLng();
          setPinB({ lat: pos.lat, lng: pos.lng });
        });
      }
    } else {
      if (markerBRef.current) {
        mapRef.current.removeLayer(markerBRef.current);
        markerBRef.current = null;
      }
    }
  }, [pinB, setPinB]);

  // Handle Routing and Distance Calculation
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing route
    if (routeControlRef.current) {
      mapRef.current.removeControl(routeControlRef.current);
      routeControlRef.current = null;
    }

    // Clear existing straight line
    if (straightLineRef.current) {
      mapRef.current.removeLayer(straightLineRef.current);
      straightLineRef.current = null;
    }

    if (pinA && pinB) {
      // 1. Draw Straight Line
      straightLineRef.current = L.polyline(
        [[pinA.lat, pinA.lng], [pinB.lat, pinB.lng]], 
        {
            color: 'blue',
            weight: 3,
            dashArray: '5, 10',
            opacity: 0.5
        }
      ).addTo(mapRef.current);

      // 2. Calculate Straight Line Distance Math
      const R = 6371; 
      const dLat = (pinB.lat - pinA.lat) * (Math.PI / 180);
      const dLon = (pinB.lng - pinA.lng) * (Math.PI / 180);
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(pinA.lat * (Math.PI / 180)) * Math.cos(pinB.lat * (Math.PI / 180)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
      const straightDist = R * c;

      // 3. Add Routing
      routeControlRef.current = L.Routing.control({
        waypoints: [
          L.latLng(pinA.lat, pinA.lng),
          L.latLng(pinB.lat, pinB.lng)
        ],
        routeWhileDragging: false,
        showAlternatives: false,
        fitSelectedRoutes: false,
        show: false,
        createMarker: () => null,
        lineOptions: {
          styles: [{ color: '#4361ee', opacity: 0.7, weight: 5 }]
        }
      }).on('routesfound', function(e: any) {
        const routes = e.routes;
        const summary = routes[0].summary;
        
        const hours = Math.floor(summary.totalTime / 3600);
        const minutes = Math.floor((summary.totalTime % 3600) / 60);
        const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;

        onRouteCalculated({
          distance: (summary.totalDistance / 1000).toFixed(2),
          time: timeStr,
          straightDistance: straightDist.toFixed(2)
        });
      }).addTo(mapRef.current);
    } else {
      onRouteCalculated(null);
    }
  }, [pinA, pinB]); 

  // Handle Institution Markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear all groups first
    Object.values(layerGroupsRef.current).forEach(group => group.clearLayers());

    institutions.forEach(inst => {
      // Find appropriate group
      const group = layerGroupsRef.current[inst.level];
      if (!group) return; // Skip if group doesn't exist

      // Colors
      const colorKey = inst.gender as keyof typeof ICON_COLORS;
      const color = ICON_COLORS[colorKey] || ICON_COLORS.unknown;

      // Letter code
      const letter = LEVEL_CODES[inst.level] || '?';
      const fontSize = letter.length > 1 ? '10px' : '12px';

      // HTML Icon
      const html = `
        <div style="
          display:flex; align-items:center; justify-content:center;
          background:${color}; color:white; border:none;
          border-radius:50%; width:28px; height:28px;
          font-weight:700; font-size:${fontSize}; 
          box-shadow:0 0 3px rgba(0,0,0,0.6);
          font-family: Arial, sans-serif;
        ">${letter}</div>
      `;

      const icon = L.divIcon({
        className: 'custom-data-marker',
        html: html,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([inst.lat, inst.lng], { icon });

      // Popup Content
      const popupContent = `
        <div style="font-family:Arial,sans-serif;font-size:13px; min-width: 200px;">
            <div style="font-weight:700;margin-bottom:4px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 4px;">
                ${inst.name}
            </div>
            <table style="width:100%;border-collapse:collapse; margin-top: 5px;">
                <tr><td style="font-weight:600;padding:2px 0;color:#666;">District:</td><td>${inst.district}</td></tr>
                <tr><td style="font-weight:600;padding:2px 0;color:#666;">Type:</td><td>${inst.type}</td></tr>
                <tr><td style="font-weight:600;padding:2px 0;color:#666;">Level:</td><td style="text-transform:capitalize;">${inst.level}</td></tr>
                <tr><td style="font-weight:600;padding:2px 0;color:#666;">Gender:</td><td style="text-transform:capitalize;">${inst.gender}</td></tr>
                ${Object.entries(inst.metadata).map(([k, v]) => v ? `<tr><td style="font-weight:600;padding:2px 0;color:#666;text-transform:capitalize;">${k}:</td><td>${v}</td></tr>` : '').join('')}
            </table>
        </div>
      `;

      marker.bindPopup(popupContent);
      group.addLayer(marker);
    });

  }, [institutions]);

  // Handle Center Map Trigger
  useEffect(() => {
    const handleCenter = () => {
        if(mapRef.current) {
            if (pinA && pinB) {
                const bounds = L.latLngBounds([pinA, pinB]);
                mapRef.current.fitBounds(bounds, { padding: [50, 50] });
            } else if (pinA) {
                mapRef.current.setView(pinA, 12);
            } else {
                mapRef.current.setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], DEFAULT_ZOOM);
            }
        }
    };
    window.addEventListener('center-map-trigger', handleCenter);
    return () => window.removeEventListener('center-map-trigger', handleCenter);
  }, [pinA, pinB]);

  return (
    <div className="relative w-full h-full bg-gray-200">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      <Legend />
    </div>
  );
};

export default MapComponent;