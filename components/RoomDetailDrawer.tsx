
import React, { useState, useEffect } from 'react';
import { X, Plus, Info, Image as ImageIcon, Database, AlertCircle, Save, ArrowRight, Lock, RefreshCw, Tag, Trash2, Copy, Users, Star, GripVertical } from 'lucide-react';
import { Room } from '../types';

interface RoomDetailDrawerProps {
  room: Room | null;
  existingRooms: Room[];
  isOpen: boolean;
  onClose: () => void;
}

const STANDARD_TAGS = [
  '独立卫浴',
  '空气净化器/新风系统',
  '带浴缸',
  '景观房',
  '智能卫浴',
  '榻榻米房',
  '无障碍房'
];

interface BedItem {
  id: string;
  type: string;
  width: string;
  count: string;
}

interface BedGroup {
  id: string;
  items: BedItem[];
}

interface RoomImageState {
  id: number;
  url: string;
  isCover: boolean;
}

const RoomDetailDrawer: React.FC<RoomDetailDrawerProps> = ({ room, existingRooms, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    bed: '',
    window: '',
    floor: '',
    occupancy: '', // 入住人数展示文案
    adults: 2,
    children: 0,
    source: 'L4' as string,
    syncWithSystem: false,
    features: [] as string[]
  });
  
  // 面积专用状态
  const [areaType, setAreaType] = useState<'fixed' | 'range'>('fixed');
  const [areaValues, setAreaValues] = useState({ min: '', max: '' });

  // 床型配置专用状态 (支持 或/及 逻辑)
  const [bedGroups, setBedGroups] = useState<BedGroup[]>([]);
  
  // 房型图片状态
  const [roomImages, setRoomImages] = useState<RoomImageState[]>([]);

  const [showToast, setShowToast] = useState<string | null>(null);
  
  // Drag and Drop State
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);

  // 解析床型字符串到结构化数据
  const parseBedString = (str: string): BedGroup[] => {
    if (!str) return [{ id: Date.now().toString(), items: [{ id: 'b1', type: '', width: '', count: '1' }] }];

    // Split by OR (或)
    const groupStrs = str.split(/ 或 | or /i);
    
    return groupStrs.map((gStr, gIdx) => {
      // Split by AND (及)
      const itemStrs = gStr.split(/ 及 | and | \+ /i);
      const items = itemStrs.map((iStr, iIdx) => {
        // Regex to extract count, width, type. E.g. "1张1.8米大床" or "大床"
        // Try match: (\d+)张?([\d\.]+)米?(.+)
        const match = iStr.match(/(\d+)[张个]?\s*([\d\.]+)[米m]?\s*(.+)/);
        if (match) {
          return {
            id: `${gIdx}-${iIdx}`,
            count: match[1],
            width: match[2],
            type: match[3].trim()
          };
        } else {
            // Simple fallback
            return {
                id: `${gIdx}-${iIdx}`,
                count: '1',
                width: '',
                type: iStr.trim()
            };
        }
      });
      return { id: `g-${gIdx}`, items };
    });
  };

  useEffect(() => {
    if (room && isOpen) {
      setFormData({
        name: room.name || '',
        bed: room.bed || '',
        window: room.window || '',
        floor: room.floor || '',
        occupancy: room.occupancy || '',
        adults: room.adults || 2,
        children: 0, // 不再区分儿童，重置为0
        source: room.source || 'L4',
        syncWithSystem: room.syncWithSystem || false,
        features: room.features || []
      });

      // 解析面积字段
      const rawArea = (room.area || '').replace('㎡', '');
      if (rawArea.includes('-')) {
        const [min, max] = rawArea.split('-');
        setAreaType('range');
        setAreaValues({ min: min || '', max: max || '' });
      } else {
        setAreaType('fixed');
        setAreaValues({ min: rawArea, max: '' });
      }

      // 解析床型
      setBedGroups(parseBedString(room.bed || ''));
      
      // Init Room Images (Mock)
      setRoomImages([
        { id: 1, url: `https://picsum.photos/seed/room-${room.id}-1/200/200`, isCover: true },
        { id: 2, url: `https://picsum.photos/seed/room-${room.id}-2/200/200`, isCover: false }
      ]);

    } else if (!room && isOpen) {
      // 新增模式重置
      setFormData({
        name: '',
        bed: '',
        window: '',
        floor: '',
        occupancy: '2人',
        adults: 2,
        children: 0,
        source: 'L4',
        syncWithSystem: false,
        features: []
      });
      setAreaType('fixed');
      setAreaValues({ min: '', max: '' });
      setBedGroups([{ id: Date.now().toString(), items: [{ id: 'b1', type: '', width: '', count: '1' }] }]);
      setRoomImages([]);
    }
  }, [room, isOpen]);

  // 当 bedGroups 变化时，自动序列化回 formData.bed
  useEffect(() => {
      // 生成文案: "1张1.8米大床 及 1张1.2米单人床 或 2张1.5米双床"
      const str = bedGroups.map(group => {
          return group.items.map(item => {
              const widthStr = item.width ? `${item.width}米` : '';
              const typeStr = item.type || '';
              // 如果没有类型，至少显示个占位，或者如果完全空就不显示
              if (!typeStr && !widthStr) return '';
              return `${item.count}张${widthStr}${typeStr}`;
          }).filter(Boolean).join(' 及 ');
      }).filter(Boolean).join(' 或 ');

      setFormData(prev => ({ ...prev, bed: str }));
  }, [bedGroups]);

  if (!isOpen) return null;

  const isSystemSource = formData.source !== 'L4';
  const sourceLabel = isSystemSource ? `系统同步 (${formData.source})` : '业务录入';

  // 计算最终面积字符串
  const getFinalAreaString = () => {
    if (areaType === 'fixed') {
      return areaValues.min ? `${areaValues.min}㎡` : '';
    } else {
      return (areaValues.min && areaValues.max) ? `${areaValues.min}-${areaValues.max}㎡` : '';
    }
  };

  const handleSave = () => {
    if (isSystemSource) return;

    const finalArea = getFinalAreaString();

    const duplicate = existingRooms.find(r => 
      r.id !== room?.id &&
      r.area === finalArea &&
      r.bed === formData.bed &&
      r.window === formData.window &&
      r.floor === formData.floor
    );

    if (duplicate) {
      setShowToast(`存在相似物理房型[${duplicate.name}]，建议复用`);
      setTimeout(() => setShowToast(null), 5000);
      return;
    }
    // 模拟保存逻辑
    console.log('Saved:', { ...formData, area: finalArea });
    onClose();
  };

  const toggleTag = (tag: string) => {
    if (isSystemSource) return;
    setFormData(prev => {
      const newFeatures = prev.features.includes(tag) 
         ? prev.features.filter(f => f !== tag)
         : [...prev.features, tag];
      return { ...prev, features: newFeatures };
    });
  };

  // -------------------------
  // 入住人数逻辑处理 (Simplified)
  // -------------------------
  const handleOccupancyChange = (val: string) => {
    const num = parseInt(val) || 0;
    setFormData(prev => ({
      ...prev,
      adults: num,
      children: 0,
      occupancy: `${num}人`
    }));
  };

  // 床型操作方法
  const updateBedItem = (gId: string, itemId: string, field: keyof BedItem, value: string) => {
    if (isSystemSource) return;
    setBedGroups(prev => prev.map(g => {
        if (g.id !== gId) return g;
        return {
            ...g,
            items: g.items.map(i => i.id === itemId ? { ...i, [field]: value } : i)
        };
    }));
  };

  const addBedItem = (gId: string) => {
      setBedGroups(prev => prev.map(g => {
          if (g.id !== gId) return g;
          return {
              ...g,
              items: [...g.items, { id: Date.now().toString(), type: '', width: '', count: '1' }]
          };
      }));
  };

  const removeBedItem = (gId: string, itemId: string) => {
      setBedGroups(prev => prev.map(g => {
          if (g.id !== gId) return g;
          // 至少保留一个
          if (g.items.length === 1) return g;
          return {
              ...g,
              items: g.items.filter(i => i.id !== itemId)
          };
      }));
  };

  const addBedGroup = () => {
      setBedGroups(prev => [...prev, { 
          id: Date.now().toString(), 
          items: [{ id: Date.now().toString() + '1', type: '', width: '', count: '1' }] 
      }]);
  };

  const removeBedGroup = (gId: string) => {
      setBedGroups(prev => {
          if (prev.length === 1) return prev;
          return prev.filter(g => g.id !== gId);
      });
  };
  
  // Image Handlers
  const handleSetCover = (id: number) => {
      if (isSystemSource) return;
      setRoomImages(prev => prev.map(img => ({
          ...img,
          isCover: img.id === id
      })));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
      if (isSystemSource) return;
      setDraggedImageIndex(index);
      e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
      if (isSystemSource) return;
      e.preventDefault();
      if (draggedImageIndex === null || draggedImageIndex === index) return;
      
      const newImages = [...roomImages];
      const draggedItem = newImages[draggedImageIndex];
      newImages.splice(draggedImageIndex, 1);
      newImages.splice(index, 0, draggedItem);
      
      setRoomImages(newImages);
      setDraggedImageIndex(index);
  };
  
  const handleDragEnd = () => {
      setDraggedImageIndex(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px] animate-in fade-in duration-200" onClick={onClose} />
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-[600px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <div>
            <h2 className="text-base font-bold text-slate-900">{room ? '房型详情' : '新增房型'}</h2>
            <div className={`mt-1 flex items-center gap-1.5 text-xs ${isSystemSource ? 'text-slate-500' : 'text-blue-600'}`}>
              <Database className="h-3 w-3" />
              <span>数据来源: {sourceLabel}</span>
              {isSystemSource && <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 rounded text-slate-400 border border-slate-200 ml-2"><Lock className="h-3 w-3" /> 只读</span>}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {/* Toast Message */}
          {showToast && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-amber-700">{showToast}</p>
            </div>
          )}

          {/* Sync Option for L4 */}
          {!isSystemSource && (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-md flex items-center gap-3">
               <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                 <RefreshCw className="h-4 w-4" />
               </div>
               <div className="flex-1">
                 <div className="flex items-center justify-between">
                   <label htmlFor="sync-toggle" className="text-sm font-bold text-slate-800 cursor-pointer">实时同步系统更新数据</label>
                   <div className="relative inline-flex items-center cursor-pointer">
                      <input 
                        id="sync-toggle" 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={formData.syncWithSystem}
                        onChange={(e) => setFormData({...formData, syncWithSystem: e.target.checked})}
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                   </div>
                 </div>
                 <p className="text-xs text-slate-500 mt-1">开启后，若系统源有更新，将自动覆盖当前的业务录入数据。</p>
               </div>
            </div>
          )}

          {/* Form Group */}
          <div className="bg-white p-5 rounded border border-slate-200 space-y-5 shadow-sm">
             <div className="grid gap-5">
               {/* 房型名称 */}
               <div>
                 <label className="block text-xs font-bold text-slate-600 mb-1.5">
                   <span className="text-rose-500 mr-1">*</span>房型名称
                 </label>
                 <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    readOnly={isSystemSource}
                    className={`w-full px-3 py-2 border border-slate-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none ${isSystemSource ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'bg-white'}`}
                  />
                  {!isSystemSource && <p className="mt-1.5 text-[10px] text-slate-400">请勿包含“特惠”、“促销”等营销词汇</p>}
               </div>

               {/* 物理属性 Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 
                 {/* 入住人数 (Simplified to single input with no gray background) */}
                 <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      <span className="text-rose-500 mr-1">*</span>最多入住人数
                    </label>

                    <div className="relative">
                        <input 
                            type="number" 
                            value={formData.adults}
                            onChange={(e) => handleOccupancyChange(e.target.value)}
                            readOnly={isSystemSource}
                            placeholder="如: 2"
                            min="1"
                            className={`w-full pl-3 pr-8 py-2 border border-slate-300 rounded text-sm outline-none ${isSystemSource ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'bg-white focus:border-blue-500'}`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">人</span>
                    </div>
                 </div>

                 {/* 面积设置 (支持范围) */}
                 <div className="md:col-span-2 p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-slate-600">
                        <span className="text-rose-500 mr-1">*</span>面积 (㎡)
                      </label>
                      
                      {/* 切换开关 */}
                      {!isSystemSource && (
                        <div className="flex bg-white rounded p-0.5 border border-slate-200">
                          <button
                            onClick={() => setAreaType('fixed')}
                            className={`px-2 py-0.5 text-[10px] rounded transition-all ${areaType === 'fixed' ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            固定
                          </button>
                          <button
                            onClick={() => setAreaType('range')}
                            className={`px-2 py-0.5 text-[10px] rounded transition-all ${areaType === 'range' ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            范围
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {areaType === 'fixed' ? (
                         <div className="relative flex-1">
                            <input 
                              type="number" 
                              value={areaValues.min}
                              onChange={(e) => setAreaValues({...areaValues, min: e.target.value})}
                              readOnly={isSystemSource}
                              placeholder="如: 25"
                              className={`w-full pl-3 pr-8 py-2 border border-slate-300 rounded text-sm outline-none ${isSystemSource ? 'bg-slate-100 text-slate-500' : 'bg-white focus:border-blue-500'}`}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">㎡</span>
                         </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-1">
                          <div className="relative flex-1">
                            <input 
                              type="number" 
                              value={areaValues.min}
                              onChange={(e) => setAreaValues({...areaValues, min: e.target.value})}
                              readOnly={isSystemSource}
                              placeholder="最小"
                              className={`w-full pl-3 pr-8 py-2 border border-slate-300 rounded text-sm outline-none ${isSystemSource ? 'bg-slate-100 text-slate-500' : 'bg-white focus:border-blue-500'}`}
                            />
                          </div>
                          <span className="text-slate-400">-</span>
                          <div className="relative flex-1">
                            <input 
                              type="number" 
                              value={areaValues.max}
                              onChange={(e) => setAreaValues({...areaValues, max: e.target.value})}
                              readOnly={isSystemSource}
                              placeholder="最大"
                              className={`w-full pl-3 pr-8 py-2 border border-slate-300 rounded text-sm outline-none ${isSystemSource ? 'bg-slate-100 text-slate-500' : 'bg-white focus:border-blue-500'}`}
                            />
                          </div>
                          <span className="text-xs text-slate-500 ml-1">㎡</span>
                        </div>
                      )}
                    </div>
                 </div>

                 {/* 窗户与楼层 */}
                 <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      <span className="text-rose-500 mr-1">*</span>窗户
                    </label>
                    <select 
                      value={formData.window}
                      onChange={(e) => setFormData({...formData, window: e.target.value})}
                      disabled={isSystemSource}
                      className={`w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none ${isSystemSource ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : 'bg-white focus:border-blue-500'}`}
                    >
                      <option value="">请选择</option>
                      <option value="有窗">有窗</option>
                      <option value="部分有窗">部分有窗</option>
                      <option value="无窗">无窗</option>
                      <option value="内窗">内窗</option>
                      <option value="天窗">天窗</option>
                      <option value="江景">江景</option>
                      <option value="全景窗">全景窗</option>
                    </select>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-600 mb-1.5">所在楼层</label>
                     <input 
                        type="text" 
                        value={formData.floor}
                        onChange={(e) => setFormData({...formData, floor: e.target.value})}
                        readOnly={isSystemSource}
                        placeholder="如: 3-5"
                        className={`w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none ${isSystemSource ? 'bg-slate-50 text-slate-500' : 'focus:border-blue-500'}`}
                      />
                   </div>
               </div>

               {/* 床型配置 (New) */}
               <div>
                 <label className="block text-xs font-bold text-slate-600 mb-2">
                   <span className="text-rose-500 mr-1">*</span>床型配置
                 </label>
                 <div className="space-y-4">
                   {bedGroups.map((group, gIndex) => (
                     <div key={group.id} className="relative">
                       {/* OR Separator */}
                       {gIndex > 0 && (
                         <div className="relative flex items-center justify-center my-3">
                           <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                           <span className="relative bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">或 (OR)</span>
                         </div>
                       )}

                       <div className={`p-3 rounded border transition-all ${isSystemSource ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'}`}>
                         {/* Header for Group if multiple */}
                         {bedGroups.length > 1 && (
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">方案 {gIndex + 1}</span>
                                {!isSystemSource && (
                                  <button onClick={() => removeBedGroup(group.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                            </div>
                         )}

                         <div className="space-y-2">
                           {group.items.map((item, iIndex) => (
                             <div key={item.id} className="flex flex-col gap-1">
                               {iIndex > 0 && (
                                 <div className="flex items-center gap-2 pl-2">
                                   <div className="w-px h-3 bg-slate-200"></div>
                                   <span className="text-[10px] font-bold text-slate-400">及</span>
                                 </div>
                               )}
                               <div className="flex gap-2 items-center">
                                 {/* Type */}
                                 <select 
                                    value={item.type}
                                    onChange={(e) => updateBedItem(group.id, item.id, 'type', e.target.value)}
                                    disabled={isSystemSource}
                                    className={`flex-[3] px-3 py-2 border border-slate-300 rounded text-sm outline-none ${isSystemSource ? 'bg-slate-100 text-slate-500' : 'bg-white focus:border-blue-500'}`}
                                  >
                                    <option value="">选择床型</option>
                                    <option value="大床">大床</option>
                                    <option value="双床">双床</option>
                                    <option value="单人床">单人床</option>
                                    <option value="特大床">特大床</option>
                                    <option value="圆床">圆床</option>
                                    <option value="上下铺">上下铺</option>
                                  </select>
                                  
                                  {/* Width */}
                                  <div className="relative flex-[2]">
                                     <input 
                                       type="text" 
                                       value={item.width}
                                       onChange={(e) => updateBedItem(group.id, item.id, 'width', e.target.value)}
                                       readOnly={isSystemSource}
                                       placeholder="宽度" 
                                       className={`w-full px-3 py-2 border border-slate-300 rounded text-sm outline-none ${isSystemSource ? 'bg-slate-100 text-slate-500' : 'bg-white focus:border-blue-500'}`}
                                     />
                                     <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">米</span>
                                  </div>

                                  {/* Count */}
                                  <div className="relative w-16">
                                     <input 
                                       type="number" 
                                       value={item.count}
                                       onChange={(e) => updateBedItem(group.id, item.id, 'count', e.target.value)}
                                       readOnly={isSystemSource}
                                       min="1"
                                       className={`w-full px-2 py-2 border border-slate-300 rounded text-sm text-center outline-none ${isSystemSource ? 'bg-slate-100 text-slate-500' : 'bg-white focus:border-blue-500'}`} 
                                     />
                                     <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">张</span>
                                  </div>

                                  {/* Delete Item */}
                                  {!isSystemSource && group.items.length > 1 && (
                                     <button 
                                       onClick={() => removeBedItem(group.id, item.id)}
                                       className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
                                     >
                                       <X className="h-4 w-4" />
                                     </button>
                                  )}
                               </div>
                             </div>
                           ))}
                         </div>

                         {/* Add Bed Item (AND) */}
                         {!isSystemSource && (
                           <button 
                             onClick={() => addBedItem(group.id)}
                             className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors px-1"
                           >
                             <Plus className="h-3.5 w-3.5" /> 组合其他床型 (及)
                           </button>
                         )}
                       </div>
                     </div>
                   ))}

                   {/* Add Bed Group (OR) */}
                   {!isSystemSource && (
                     <button 
                       onClick={addBedGroup}
                       className="w-full py-2 border border-dashed border-slate-300 rounded text-xs font-bold text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                     >
                       <Plus className="h-4 w-4" /> 添加备选方案 (或)
                     </button>
                   )}
                 </div>
               </div>

               {/* 房型标签 */}
               <div>
                 <div className="flex items-center gap-1.5 mb-2">
                    <Tag className="h-3.5 w-3.5 text-blue-600" />
                    <label className="block text-xs font-bold text-slate-600">
                      房型标签
                    </label>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {STANDARD_TAGS.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        disabled={isSystemSource}
                        className={`px-3 py-1.5 rounded text-xs border transition-all ${
                          formData.features.includes(tag)
                            ? (isSystemSource ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-blue-50 text-blue-600 border-blue-200 font-medium')
                            : (isSystemSource ? 'bg-slate-50 text-slate-300 border-slate-100' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300')
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                 </div>
                 {!isSystemSource && <p className="mt-2 text-[10px] text-slate-400">选择准确的标签有助于提升用户筛选效率</p>}
               </div>

             </div>
          </div>

          {/* 图片区域 */}
          <div className="bg-white p-5 rounded border border-slate-200 space-y-4 shadow-sm">
             <h3 className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center justify-between">
                <span><span className="text-rose-500 mr-1">*</span>房型照片</span>
                {!isSystemSource && <span className="text-[10px] font-normal text-slate-400">支持拖拽排序</span>}
             </h3>
             
             {isSystemSource ? (
               <div className="flex gap-2">
                 {[1,2].map(i => (
                   <div key={i} className="w-20 h-20 bg-slate-100 rounded border border-slate-200 overflow-hidden relative group">
                     <img src={`https://picsum.photos/seed/room-${i}/200/200`} className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" alt="" />
                   </div>
                 ))}
               </div>
             ) : (
                <div className="flex flex-wrap gap-2">
                   {roomImages.map((img, index) => (
                      <div 
                        key={img.id} 
                        draggable={!isSystemSource}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`w-24 h-24 bg-slate-100 rounded border overflow-hidden relative group cursor-move ${draggedImageIndex === index ? 'opacity-50 border-blue-500 border-dashed' : 'border-slate-200'}`}
                      >
                        <img src={img.url} className="w-full h-full object-cover" alt="" />
                        
                        {/* Drag Handle Indicator */}
                        <div className="absolute top-1 right-1 bg-black/40 p-0.5 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="h-3 w-3" />
                        </div>

                        {/* Set Cover Button / Indicator */}
                        {img.isCover ? (
                            <div className="absolute top-0 left-0 bg-rose-600 text-white text-[9px] px-1.5 py-0.5 rounded-br font-bold shadow-sm">封面</div>
                        ) : (
                             <button 
                                onClick={() => handleSetCover(img.id)}
                                className="absolute bottom-1 right-1 bg-white/90 p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 hover:text-rose-600 transition-all text-slate-500"
                                title="设为封面"
                             >
                                <Star className="h-3 w-3" />
                             </button>
                        )}
                      </div>
                   ))}
                   <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded flex flex-col items-center justify-center gap-1 hover:bg-slate-50 hover:border-blue-400 transition-colors cursor-pointer text-slate-400 hover:text-blue-500">
                     <Plus className="h-5 w-5" />
                     <span className="text-[10px]">添加</span>
                   </div>
                </div>
             )}
          </div>
        </div>

        {/* Footer */}
        {!isSystemSource && (
          <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-end gap-3 shrink-0">
            <button onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-600 rounded text-sm font-medium hover:bg-slate-50 transition-colors">
              取消
            </button>
            <button 
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 shadow-sm flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              保存
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDetailDrawer;
