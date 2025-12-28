
import React, { useState, useEffect } from 'react';
import { X, MapPin, Search, Navigation, Crosshair } from 'lucide-react';

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
  onConfirm: (lat: number, lng: number) => void;
}

const MapPickerModal: React.FC<MapPickerModalProps> = ({ 
  isOpen, 
  onClose, 
  initialLat = 31.1798, 
  initialLng = 121.4398,
  onConfirm 
}) => {
  const [latitude, setLatitude] = useState(initialLat.toString());
  const [longitude, setLongitude] = useState(initialLng.toString());
  const [markerPosition, setMarkerPosition] = useState({ lat: initialLat, lng: initialLng });

  useEffect(() => {
    if (isOpen) {
      setLatitude(initialLat.toString());
      setLongitude(initialLng.toString());
      setMarkerPosition({ lat: initialLat, lng: initialLng });
    }
  }, [isOpen, initialLat, initialLng]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      onConfirm(lat, lng);
      onClose();
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    // 模拟坐标计算
    const newLng = initialLng + (x - 0.5) * 0.1;
    const newLat = initialLat + (0.5 - y) * 0.1;
    
    setMarkerPosition({ lat: newLat, lng: newLng });
    setLatitude(newLat.toFixed(4));
    setLongitude(newLng.toFixed(4));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl rounded shadow-xl overflow-hidden flex flex-col h-[600px] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="font-bold text-slate-800 text-sm">地图选点 (腾讯坐标)</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
           {/* Sidebar Inputs */}
           <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-4 shrink-0">
             <div>
               <label className="block text-xs font-bold text-slate-600 mb-1.5">搜索地址</label>
               <div className="relative">
                 <input className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none" placeholder="输入关键字..." />
                 <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
               </div>
             </div>
             
             <div className="h-px bg-slate-200 my-1"></div>

             <div>
               <label className="block text-xs font-bold text-slate-600 mb-1.5">经度 (Lng)</label>
               <input 
                  type="text" 
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm font-mono focus:border-blue-500 outline-none"
                />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-600 mb-1.5">纬度 (Lat)</label>
               <input 
                  type="text" 
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm font-mono focus:border-blue-500 outline-none"
                />
             </div>
           </div>

           {/* Map Area */}
           <div className="flex-1 relative bg-slate-100 cursor-crosshair group" onClick={handleMapClick}>
              {/* Grid Background */}
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} />

              {/* Center Marker - 保持红色作为地图标记的标准色 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none">
                 <div className="bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded mb-1 whitespace-nowrap text-center shadow-lg">当前选择</div>
                 <MapPin className="h-8 w-8 text-rose-600 drop-shadow-lg fill-white" />
              </div>

              {/* Coordinates Overlay */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-2 rounded shadow border border-slate-200 text-xs font-mono text-slate-700 pointer-events-none">
                {markerPosition.lng.toFixed(6)}, {markerPosition.lat.toFixed(6)}
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
             <Crosshair className="h-3.5 w-3.5" />
             <span>坐标系: 腾讯地图 (GCJ-02)</span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-600 rounded text-sm hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button 
              onClick={handleConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 shadow-sm transition-colors"
            >
              确认坐标
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPickerModal;
