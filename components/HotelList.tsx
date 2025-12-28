
import React, { useState } from 'react';
import { Search, Plus, Users, Globe, AlertCircle, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Hotel, SourceType } from '../types';

interface HotelListProps {
  hotels: Hotel[];
  onEdit: (hotel: Hotel) => void;
  onAddNew: () => void;
}

const HotelList: React.FC<HotelListProps> = ({ hotels, onEdit, onAddNew }) => {
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterSource, setFilterSource] = useState<string>('');

  const FilterSelect = ({ 
    label, 
    options, 
    value, 
    onChange 
  }: { 
    label: string, 
    options: { value: string, label: string }[],
    value?: string,
    onChange?: (val: string) => void
  }) => (
    <div className="relative">
      <select 
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="appearance-none h-9 pl-3 pr-9 text-sm border border-slate-300 rounded hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none bg-white text-slate-600 cursor-pointer transition-all min-w-[110px]"
      >
        <option value="">{label}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
    </div>
  );

  // 筛选逻辑实现
  const filteredHotels = hotels.filter(hotel => {
    const isConflict = hotel.sourceType === SourceType.L4 && hotel.conflict;

    // 状态筛选: 数据正常 vs 冲突待决
    if (filterStatus === 'normal') {
      if (isConflict) return false;
    } else if (filterStatus === 'conflict') {
      if (!isConflict) return false;
    }

    // 来源筛选
    if (filterSource === 'system' && hotel.sourceType !== SourceType.L3) return false;
    if (filterSource === 'business' && hotel.sourceType !== SourceType.L4) return false;

    return true;
  });

  return (
    <div className="space-y-4 font-sans">
      {/* Search & Action Bar - Optimized Filter Layout */}
      <div className="bg-white p-4 border border-slate-200 rounded flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="名称 / ID / 地址" 
              className="pl-9 pr-4 w-full h-9 text-sm border border-slate-300 rounded hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          
          <FilterSelect 
            label="所有城市" 
            options={[
              { value: 'shanghai', label: '上海' },
              { value: 'kyoto', label: '京都' },
              { value: 'bangkok', label: '曼谷' },
              { value: 'tokyo', label: '东京' }
            ]} 
          />

          <FilterSelect 
            label="所有钻级" 
            options={[
              { value: '5', label: '5钻' },
              { value: '4', label: '4钻' },
              { value: '3', label: '3钻' },
              { value: '2', label: '2钻及以下' }
            ]} 
          />
          
          <FilterSelect 
            label="所有来源" 
            value={filterSource}
            onChange={setFilterSource}
            options={[
              { value: 'system', label: '系统同步' },
              { value: 'business', label: '业务录入' }
            ]} 
          />

          <FilterSelect 
            label="所有状态" 
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: 'normal', label: '数据正常' },
              { value: 'conflict', label: '冲突待决' }
            ]} 
          />

          <button className="h-9 px-5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors shadow-sm border border-blue-600 font-bold">
            查询
          </button>
        </div>

        <button 
          onClick={onAddNew}
          className="h-9 px-4 bg-white text-blue-600 text-sm rounded hover:bg-blue-50 shadow-sm flex items-center gap-1.5 border border-blue-200 font-bold transition-all"
        >
          <Plus className="h-4 w-4" /> 新增酒店
        </button>
      </div>

      {/* Table - "Common Table" Spec */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm mt-4">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#f5f7fa] text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 w-[80px]">ID</th>
              <th className="py-3 px-4">酒店名称</th>
              <th className="py-3 px-4">城市</th>
              <th className="py-3 px-4">数据来源</th>
              <th className="py-3 px-4">地址</th>
              <th className="py-3 px-4">数据状态</th>
              <th className="py-3 px-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredHotels.length > 0 ? (
              filteredHotels.map((hotel) => {
                const isConflict = hotel.sourceType === SourceType.L4 && hotel.conflict;
                return (
                  <tr key={hotel.id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="py-3 px-4 font-mono text-slate-500 text-xs">{hotel.id.split('_')[1] || hotel.id}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={`https://picsum.photos/seed/${hotel.id}/100/100`} 
                          className="w-8 h-8 rounded object-cover border border-slate-200"
                          alt="" 
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{hotel.name}</span>
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[10px] font-bold border border-amber-100 whitespace-nowrap">
                              {hotel.star}钻
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">{hotel.nameEn || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                        <div className="font-medium text-slate-700">{hotel.city || '-'}</div>
                        {hotel.country && <div className="text-[10px] text-slate-400">{hotel.country}</div>}
                    </td>
                    <td className="py-3 px-4">
                       {hotel.sourceType === SourceType.L4 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-600 text-xs">
                          <Users className="h-3 w-3" /> 业务录入
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-500 text-xs">
                          <Globe className="h-3 w-3" /> 系统同步
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate" title={hotel.address}>
                      {hotel.address}
                    </td>
                    <td className="py-3 px-4">
                      {/* 数据状态: 列表仅显示 数据正常 / 冲突待决 */}
                      {isConflict ? (
                        <span className="text-amber-600 flex items-center gap-1 text-xs font-bold">
                          <AlertCircle className="h-3 w-3" /> 冲突待决
                        </span>
                      ) : (
                        <span className="text-emerald-600 flex items-center gap-1 text-xs font-bold">
                          <CheckCircle2 className="h-3 w-3" /> 数据正常
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        onClick={() => onEdit(hotel)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm mr-2"
                      >
                        详情
                      </button>
                      <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                        房型
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                  暂无匹配数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Pagination - "Basic Pagination C" */}
        <div className="py-3 px-4 border-t border-slate-200 flex items-center justify-between bg-white">
          <div className="text-xs text-slate-500">共 {filteredHotels.length} 条数据</div>
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 border border-slate-200 rounded-sm text-xs text-slate-600 hover:border-blue-500 disabled:opacity-50">上一页</button>
            <button className="px-2 py-1 bg-blue-600 text-white rounded-sm text-xs border border-blue-600">1</button>
            <button className="px-2 py-1 border border-slate-200 rounded-sm text-xs text-slate-600 hover:border-blue-500 hover:text-blue-500">2</button>
            <button className="px-2 py-1 border border-slate-200 rounded-sm text-xs text-slate-600 hover:border-blue-500 hover:text-blue-500">3</button>
            <span className="text-xs text-slate-400">...</span>
            <button className="px-2 py-1 border border-slate-200 rounded-sm text-xs text-slate-600 hover:border-blue-500 disabled:opacity-50">下一页</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelList;
