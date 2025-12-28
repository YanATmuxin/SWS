
import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Globe, Building2, MapPin, Loader2, ArrowRight, Info, Sparkles, CheckCircle2, Download, Eye, Plus } from 'lucide-react';
import { Hotel, SourceType, HotelStatus } from '../types';
import { MOCK_HOTELS } from '../constants';

interface AddResourceModalProps {
  onClose: () => void;
  onConfirm: (hotel: Hotel) => void;
}

// 模拟外部 OTA 数据库
const MOCK_EXTERNAL_DB = [
  { name: '上海宝格丽酒店', nameEn: 'The Bulgari Hotel Shanghai', address: '上海市静安区山西北路108号', star: '5', source: 'Booking', lat: 31.2450, lng: 121.4810 },
  { name: '上海 W 酒店', nameEn: 'W Shanghai - The Bund', address: '上海市虹口区旅顺路66号', star: '5', source: 'Expedia', lat: 31.2488, lng: 121.4922 },
  { name: '上海建业里嘉佩乐酒店', nameEn: 'Capella Shanghai Jian Ye Li', address: '上海市徐汇区建国西路480号', star: '5', source: 'Agoda', lat: 31.2050, lng: 121.4550 },
];

type SearchResult = {
  type: 'EXISTING' | 'EXTERNAL';
  data: any;
};

const AddResourceModal: React.FC<AddResourceModalProps> = ({ onClose, onConfirm }) => {
  const [keyword, setKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const trimmed = keyword.trim();
    if (trimmed.length > 0) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        // 1. 搜索系统内已录入的数据
        const existingMatches = MOCK_HOTELS.filter(h => 
          h.name.includes(trimmed) || h.nameEn.toLowerCase().includes(trimmed.toLowerCase())
        ).map(h => ({ type: 'EXISTING', data: h } as SearchResult));

        // 2. 搜索外部待导入的数据
        const externalMatches = MOCK_EXTERNAL_DB.filter(h => 
          h.name.includes(trimmed) || h.nameEn.toLowerCase().includes(trimmed.toLowerCase())
        ).map(h => ({ type: 'EXTERNAL', data: h } as SearchResult));

        setResults([...existingMatches, ...externalMatches]);
        setIsSearching(false);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
    }
  }, [keyword]);

  const handleImport = (item: any) => {
    const newHotel: Hotel = {
      id: `NEW_${Date.now().toString().slice(-6)}`,
      name: item.name,
      nameEn: item.nameEn,
      sourceType: SourceType.L3, // 修改为 L3 (系统同步)，导入后基础信息不可修改
      status: HotelStatus.PREPARING,
      address: item.address,
      star: item.star,
      lastUpdate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      conflict: false,
      mappings: [{ source: item.source, externalId: 'PENDING', status: 'active' }],
      phone: '',
      email: '',
      openingDate: '',
      renovationDate: '',
      businessDistrict: '',
      latitude: item.lat,
      longitude: item.lng,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      petPolicy: '',
      childPolicy: '',
      wifiDetails: '全馆免费Wi-Fi',
      parkingDetails: '',
      meetingRoomDetails: '',
      businessCenterDetails: '',
      gymDetails: '',
      poolDetails: '',
      spaDetails: ''
    };
    onConfirm(newHotel);
  };

  const handleViewExisting = (hotel: Hotel) => {
    onConfirm(hotel); 
  };

  const handleManualEntry = () => {
    const newHotel: Hotel = {
      id: `MANUAL_${Date.now().toString().slice(-6)}`,
      name: keyword || '新录入酒店',
      nameEn: '',
      sourceType: SourceType.L4, // 手动录入保持 L4
      status: HotelStatus.PREPARING,
      address: '',
      star: '3',
      lastUpdate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      conflict: false,
      mappings: [],
      phone: '',
      email: '',
      openingDate: '',
      renovationDate: '',
      businessDistrict: '',
      latitude: 0, 
      longitude: 0, 
      checkInTime: '14:00',
      checkOutTime: '12:00',
      petPolicy: '',
      childPolicy: '',
      wifiDetails: '',
      parkingDetails: '',
      meetingRoomDetails: '',
      businessCenterDetails: '',
      gymDetails: '',
      poolDetails: '',
      spaDetails: ''
    };
    onConfirm(newHotel);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-[720px] rounded shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="font-bold text-slate-800 text-sm">新增酒店资源</div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 overflow-hidden bg-slate-50">
          {/* Search Bar */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">资源检索 (支持中文/英文/地址)</label>
            <div className="relative group">
              <input 
                ref={inputRef}
                type="text" 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="例如：半岛酒店 / Peninsula" 
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none text-sm transition-all bg-white shadow-sm"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                {isSearching ? <Loader2 className="h-4 w-4 text-blue-500 animate-spin" /> : <Search className="h-4 w-4 text-slate-400" />}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
               <Info className="h-3 w-3 text-blue-500" />
               <span>系统将自动检索【系统已录入】资源及【全网渠道库】可导入资源。</span>
            </div>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto border border-slate-200 rounded bg-white shadow-sm">
             {results.length > 0 ? (
               <div className="divide-y divide-slate-100">
                 {results.map((result, idx) => {
                   const isExisting = result.type === 'EXISTING';
                   const item = result.data;
                   return (
                     <div 
                      key={idx}
                      className={`p-3 flex items-center justify-between group transition-colors ${isExisting ? 'bg-blue-50/20 hover:bg-blue-50' : 'hover:bg-slate-50'}`}
                     >
                       <div className="flex items-start gap-3">
                         <div className={`mt-1 p-1.5 rounded flex items-center justify-center ${isExisting ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-500'}`}>
                           {isExisting ? <CheckCircle2 className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                         </div>
                         <div>
                           <div className="flex items-center gap-2">
                             <span className="text-sm font-bold text-slate-800">{item.name}</span>
                             {isExisting && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 font-medium">已录入</span>}
                             {!isExisting && <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded border border-orange-200 font-medium">外部信源: {item.source}</span>}
                           </div>
                           <div className="text-xs text-slate-500 mt-0.5">{item.nameEn || '-'}</div>
                           <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                             <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.address}</span>
                           </div>
                         </div>
                       </div>

                       <div className="flex items-center gap-2">
                         {isExisting ? (
                           <button 
                            onClick={() => handleViewExisting(item)}
                            className="px-3 py-1.5 border border-blue-200 text-blue-600 rounded text-xs font-bold hover:bg-blue-50 flex items-center gap-1.5 transition-all"
                           >
                             <Eye className="h-3.5 w-3.5" /> 查看
                           </button>
                         ) : (
                           <button 
                            onClick={() => handleImport(item)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 flex items-center gap-1.5 shadow-sm transition-all"
                           >
                             <Download className="h-3.5 w-3.5" /> 导入
                           </button>
                         )}
                       </div>
                     </div>
                   );
                 })}
               </div>
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
                  {keyword ? (
                    <>
                      <Search className="h-8 w-8 mb-2 opacity-20" />
                      <span className="text-xs font-medium">未找到匹配项，请尝试更换关键词</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-8 w-8 mb-2 opacity-20" />
                      <span className="text-xs font-medium">输入关键词，即刻连接全网资源</span>
                    </>
                  )}
                </div>
             )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
             若全网库均无此资源，请手动创建
          </div>
          <button 
            onClick={handleManualEntry}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-sm font-bold hover:border-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> 直接手动录入
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddResourceModal;
