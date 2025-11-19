import React from 'react';
import { ICON_COLORS } from '../constants';

export const Legend: React.FC = () => {
  return (
    <div className="leaflet-bottom leaflet-left" style={{ bottom: '20px', left: '20px', pointerEvents: 'auto' }}>
      <div className="bg-white/95 p-4 rounded-lg shadow-lg text-sm font-sans leading-relaxed border border-gray-200">
        <b className="block mb-2 text-gray-800">Legend</b>
        <div className="space-y-1">
          <div className="flex items-center">
            <span style={{ background: ICON_COLORS.boys }} className="w-3 h-3 rounded-full inline-block mr-2"></span>
            <span>Boys</span>
          </div>
          <div className="flex items-center">
            <span style={{ background: ICON_COLORS.girls }} className="w-3 h-3 rounded-full inline-block mr-2"></span>
            <span>Girls</span>
          </div>
          <div className="flex items-center">
            <span style={{ background: ICON_COLORS['co-edu'] }} className="w-3 h-3 rounded-full inline-block mr-2"></span>
            <span>Co-Edu</span>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-600 pt-2 border-t border-gray-100">
          HSSC: H/HS letters <br/> 
          Colleges: D/I/C/PE/PG letters
        </div>
        <div className="mt-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
           <div className="flex items-center gap-2 mb-1">
             <i className="fas fa-map-pin text-red-500"></i> Pin A
           </div>
           <div className="flex items-center gap-2">
             <i className="fas fa-map-pin text-blue-500"></i> Pin B
           </div>
        </div>
      </div>
    </div>
  );
};