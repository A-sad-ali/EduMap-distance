import React, { useRef, useState } from 'react';
import { Coordinates, Institution, RouteInfo } from '../types';
import { parseHSSCData, parseCollegeData } from '../utils/excelParser';

interface SidebarProps {
  pinA: Coordinates | null;
  pinB: Coordinates | null;
  onClearPins: () => void;
  onSwapPins: () => void;
  onCenterMap: () => void;
  routeInfo: RouteInfo | null;
  onDataLoaded: (data: Institution[]) => void;
  onClearData: () => void;
  currentPinMode: 'A' | 'B';
}

const Sidebar: React.FC<SidebarProps> = ({
  pinA,
  pinB,
  onClearPins,
  onSwapPins,
  onCenterMap,
  routeInfo,
  onDataLoaded,
  onClearData,
  currentPinMode
}) => {
  const hsscInputRef = useRef<HTMLInputElement>(null);
  const collegeInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copyStatus, setCopyStatus] = useState('');

  // File upload status state
  const [hsscStatus, setHsscStatus] = useState<{name: string, count: number} | null>(null);
  const [collegeStatus, setCollegeStatus] = useState<{name: string, count: number} | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'hssc' | 'college') => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setLoading(true);
    const file = e.target.files[0];
    
    try {
      let data: Institution[] = [];
      
      if (type === 'hssc') {
        data = await parseHSSCData(file);
        setHsscStatus({ name: file.name, count: data.length });
      } else {
        data = await parseCollegeData(file);
        setCollegeStatus({ name: file.name, count: data.length });
      }
      
      onDataLoaded(data);
    } catch (err) {
      console.error(err);
      alert('Error parsing file. Please ensure it matches the expected format.');
    } finally {
      setLoading(false);
      if (e.target) e.target.value = ''; // Reset input so same file can be selected again if needed
    }
  };

  const handleClearAllData = () => {
      onClearData();
      setHsscStatus(null);
      setCollegeStatus(null);
  };

  const generateShareLink = () => {
    if (!pinA || !pinB) {
        alert("Place both pins first");
        return;
    }
    const dummyLink = `${window.location.origin}?path=${btoa(JSON.stringify({
        p1: pinA,
        p2: pinB
    }))}`;
    setShareLink(dummyLink);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopyStatus('Copied!');
    setTimeout(() => setCopyStatus(''), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-white shadow-xl z-20 overflow-y-auto w-full md:w-[400px] border-r border-gray-200">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-primary to-secondary text-white shrink-0">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <i className="fas fa-ruler-combined"></i> EduMap Calc
        </h1>
        <p className="text-sm opacity-80 mt-1">Distance Calculator & Data Viz</p>
      </div>

      <div className="p-4 space-y-6 flex-grow">
        
        {/* Data Import Section */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
             <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                <i className="fas fa-database text-accent"></i> Data Import
             </h3>
             {(hsscStatus || collegeStatus) && (
                 <button 
                    onClick={handleClearAllData} 
                    className="text-xs text-danger hover:text-red-700 font-medium underline transition-colors"
                 >
                    Reset Data
                 </button>
             )}
          </div>
          
          <div className="space-y-3">
            {/* HSSC Upload */}
            <div className={`relative group cursor-pointer border-2 border-dashed rounded-lg p-3 transition-all duration-200 ${hsscStatus ? 'border-success bg-green-50' : 'border-slate-300 hover:border-primary hover:bg-slate-100'}`}>
                <input 
                    type="file" 
                    accept=".xlsx, .xls"
                    ref={hsscInputRef}
                    onChange={(e) => handleFileChange(e, 'hssc')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={loading}
                />
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${hsscStatus ? 'bg-success text-white' : 'bg-slate-200 text-slate-500'}`}>
                        <i className={`fas ${hsscStatus ? 'fa-check' : 'fa-school'}`}></i>
                    </div>
                    <div className="flex-grow min-w-0">
                        {hsscStatus ? (
                            <>
                                <p className="text-sm font-bold text-slate-700 truncate">{hsscStatus.name}</p>
                                <p className="text-xs text-success font-medium">{hsscStatus.count} records loaded</p>
                            </>
                        ) : (
                            <>
                                <p className="text-sm font-medium text-slate-700">Upload HSSC Data</p>
                                <p className="text-xs text-slate-500">Click to browse .xlsx</p>
                            </>
                        )}
                    </div>
                    {!hsscStatus && <i className="fas fa-cloud-upload-alt text-slate-400 group-hover:text-primary transition-colors"></i>}
                </div>
            </div>

            {/* College Upload */}
            <div className={`relative group cursor-pointer border-2 border-dashed rounded-lg p-3 transition-all duration-200 ${collegeStatus ? 'border-success bg-green-50' : 'border-slate-300 hover:border-secondary hover:bg-slate-100'}`}>
                <input 
                    type="file" 
                    accept=".xlsx, .xls"
                    ref={collegeInputRef}
                    onChange={(e) => handleFileChange(e, 'college')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={loading}
                />
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${collegeStatus ? 'bg-success text-white' : 'bg-slate-200 text-slate-500'}`}>
                        <i className={`fas ${collegeStatus ? 'fa-check' : 'fa-university'}`}></i>
                    </div>
                    <div className="flex-grow min-w-0">
                        {collegeStatus ? (
                            <>
                                <p className="text-sm font-bold text-slate-700 truncate">{collegeStatus.name}</p>
                                <p className="text-xs text-success font-medium">{collegeStatus.count} records loaded</p>
                            </>
                        ) : (
                            <>
                                <p className="text-sm font-medium text-slate-700">Upload College Data</p>
                                <p className="text-xs text-slate-500">Click to browse .xlsx</p>
                            </>
                        )}
                    </div>
                    {!collegeStatus && <i className="fas fa-cloud-upload-alt text-slate-400 group-hover:text-secondary transition-colors"></i>}
                </div>
            </div>

            {loading && <div className="text-xs text-center text-primary animate-pulse font-medium mt-2">
                <i className="fas fa-spinner fa-spin mr-1"></i> Processing file...
            </div>}
          </div>
        </div>

        {/* Pin Coordinates */}
        <div className="space-y-4">
          {/* Pin A */}
          <div className={`p-3 rounded-lg border transition-colors ${currentPinMode === 'A' && !pinA ? 'border-danger ring-2 ring-danger/20 bg-red-50' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-danger flex items-center gap-2">
                <i className="fas fa-map-pin"></i> Pin A
              </h3>
              {!pinA && currentPinMode === 'A' && <span className="text-xs text-danger font-semibold animate-pulse">Place on map</span>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="text" 
                placeholder="Latitude" 
                value={pinA?.lat.toFixed(6) || ''} 
                readOnly 
                className="bg-gray-100 border-none rounded px-3 py-1.5 text-sm text-gray-600 w-full"
              />
              <input 
                type="text" 
                placeholder="Longitude" 
                value={pinA?.lng.toFixed(6) || ''} 
                readOnly 
                className="bg-gray-100 border-none rounded px-3 py-1.5 text-sm text-gray-600 w-full"
              />
            </div>
          </div>

          {/* Pin B */}
          <div className={`p-3 rounded-lg border transition-colors ${currentPinMode === 'B' && !pinB ? 'border-primary ring-2 ring-primary/20 bg-blue-50' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <i className="fas fa-map-pin"></i> Pin B
              </h3>
              {!pinB && currentPinMode === 'B' && <span className="text-xs text-primary font-semibold animate-pulse">Place on map</span>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="text" 
                placeholder="Latitude" 
                value={pinB?.lat.toFixed(6) || ''} 
                readOnly 
                className="bg-gray-100 border-none rounded px-3 py-1.5 text-sm text-gray-600 w-full"
              />
              <input 
                type="text" 
                placeholder="Longitude" 
                value={pinB?.lng.toFixed(6) || ''} 
                readOnly 
                className="bg-gray-100 border-none rounded px-3 py-1.5 text-sm text-gray-600 w-full"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
            <button onClick={onClearPins} className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                <i className="fas fa-trash"></i> Clear
            </button>
            <button onClick={onSwapPins} className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                <i className="fas fa-exchange-alt"></i> Swap
            </button>
             <button onClick={onCenterMap} className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 col-span-2">
                <i className="fas fa-crosshairs"></i> Recenter Map
            </button>
        </div>

        {/* Results */}
        {routeInfo && (
          <div className="bg-gradient-to-br from-primary to-secondary text-white p-5 rounded-xl shadow-md">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <i className="fas fa-calculator"></i> Results
            </h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold">{routeInfo.distance}</span>
              <span className="text-lg opacity-80">km</span>
            </div>
            <div className="space-y-2 text-sm border-t border-white/20 pt-3">
              <div className="flex justify-between">
                <span className="opacity-80">Travel Time (Driving):</span>
                <span className="font-semibold">{routeInfo.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-80">Straight Line:</span>
                <span className="font-semibold">{routeInfo.straightDistance} km</span>
              </div>
            </div>
            
            {/* Share */}
            <div className="mt-4 pt-3 border-t border-white/20">
                {!shareLink ? (
                    <button onClick={generateShareLink} className="w-full bg-white/20 hover:bg-white/30 py-2 rounded text-sm transition-colors">
                        Generate Share Link
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <input value={shareLink} readOnly className="bg-white/10 border border-white/30 rounded px-2 py-1 text-xs w-full text-white" />
                        <button onClick={copyToClipboard} className="bg-accent hover:bg-accent/80 text-white px-3 py-1 rounded text-xs font-bold">
                           {copyStatus || <i className="fas fa-copy"></i>} 
                        </button>
                    </div>
                )}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 text-center text-xs text-gray-400 border-t border-gray-200 shrink-0">
        Designed with React & Tailwind
      </div>
    </div>
  );
};

export default Sidebar;