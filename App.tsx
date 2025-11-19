import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MapComponent from './components/MapComponent';
import { Coordinates, Institution, RouteInfo } from './types';

function App() {
  // State
  const [pinA, setPinA] = useState<Coordinates | null>(null);
  const [pinB, setPinB] = useState<Coordinates | null>(null);
  const [currentPinMode, setCurrentPinMode] = useState<'A' | 'B'>('A');
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  
  // Initialize with empty array - no mock data
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  // Check URL params for shared path
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pathData = params.get('path');
    if (pathData) {
      try {
        const decoded = JSON.parse(atob(pathData));
        if (decoded.p1) setPinA(decoded.p1);
        if (decoded.p2) setPinB(decoded.p2);
        // Set mode to done
        if (decoded.p1 && decoded.p2) setCurrentPinMode('A'); 
      } catch (e) {
        console.error("Failed to load path", e);
      }
    }
  }, []);

  // Handlers
  const handleClearPins = () => {
    setPinA(null);
    setPinB(null);
    setRouteInfo(null);
    setCurrentPinMode('A');
  };

  const handleSwapPins = () => {
    if (pinA && pinB) {
      setPinA(pinB);
      setPinB(pinA);
    }
  };

  const handleCenterMap = () => {
    window.dispatchEvent(new Event('center-map-trigger'));
  };

  const handleDataLoaded = (newData: Institution[]) => {
    setInstitutions(prev => [...prev, ...newData]);
  };

  const handleClearData = () => {
    setInstitutions([]);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        pinA={pinA}
        pinB={pinB}
        onClearPins={handleClearPins}
        onSwapPins={handleSwapPins}
        onCenterMap={handleCenterMap}
        routeInfo={routeInfo}
        onDataLoaded={handleDataLoaded}
        onClearData={handleClearData}
        currentPinMode={currentPinMode}
      />

      {/* Map Area */}
      <div className="flex-grow h-[50vh] md:h-full relative">
        <MapComponent 
          pinA={pinA}
          pinB={pinB}
          setPinA={setPinA}
          setPinB={setPinB}
          currentPinMode={currentPinMode}
          setCurrentPinMode={setCurrentPinMode}
          institutions={institutions}
          onRouteCalculated={setRouteInfo}
        />
      </div>
    </div>
  );
}

export default App;