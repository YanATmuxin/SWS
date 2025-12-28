
import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Building2, MapPin, 
  Wifi, ImageIcon, RefreshCw, FileText, 
  Layers, Save, Phone, 
  ShieldCheck, Fingerprint, 
  X, Send, Map as LucideMap, 
  Car, Utensils, Coffee,
  Plus, Upload, ExternalLink,
  Bed, Maximize, LayoutTemplate,
  Tag, AlertCircle, Trash2,
  ChevronDown, MapPin as MapPinIcon,
  Navigation, ConciergeBell, Bus, Plane,
  Briefcase, Languages, Wine, 
  BellRing, Clock,
  Star as StarIcon, Image as LucideImage,
  Users as UsersIcon, Lock, Check, Globe, ScrollText,
  Info, Crosshair
} from 'lucide-react';
import { Hotel, ActiveTab, SourceType, Room, HotelImage } from '../types';
import { MOCK_LOGS, MOCK_IMAGES, MOCK_ROOMS, MOCK_HOTELS, MOCK_EXTERNAL_RESOURCES } from '../constants';
import SectionTitle from './SectionTitle';
import SourceField, { ValidationFeedback } from './SourceField';
import RoomDetailDrawer from './RoomDetailDrawer';
import MapPickerModal from './MapPickerModal';
import Combobox from './Combobox';

interface HotelDetailProps {
  hotel: Hotel;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onBack: () => void;
}

const IMAGE_TAGS = ['外观', '大堂', '客房', '餐厅', '会议室', '周边', '设施', '其他'];

// Simple Region Data for Demo
const REGION_DATA: Record<string, { provinces: string[]; cities: Record<string, string[]> }> = {
  '中国': {
    provinces: ['北京市', '上海市', '广东省', '浙江省', '江苏省', '四川省', '云南省'],
    cities: {
      '北京市': ['北京市'],
      '上海市': ['上海市'],
      '广东省': ['广州市', '深圳市', '珠海市', '佛山市'],
      '浙江省': ['杭州市', '宁波市', '温州市'],
      '江苏省': ['南京市', '苏州市', '无锡市'],
      '四川省': ['成都市', '绵阳市'],
      '云南省': ['昆明市', '丽江市', '大理白族自治州']
    }
  },
  '日本': {
    provinces: ['東京都', '京都府', '大阪府', '北海道', '沖縄県'],
    cities: {
      '東京都': ['千代田区', '新宿区', '渋谷区', '中央区'],
      '京都府': ['京都市', '宇治市'],
      '大阪府': ['大阪市'],
      '北海道': ['札幌市', '函館市']
    }
  },
  '英国': {
    provinces: ['大伦敦', '苏格兰', '威尔士', '北爱尔兰'],
    cities: {
      '大伦敦': ['伦敦', '威斯敏斯特'],
      '苏格兰': ['爱丁堡', '格拉斯哥']
    }
  },
  '美国': {
    provinces: ['加利福尼亚州', '纽约州', '得克萨斯州', '华盛顿州'],
    cities: {
      '加利福尼亚州': ['洛杉矶', '旧金山', '圣地亚哥'],
      '纽约州': ['纽约市', '布法罗']
    }
  }
};

const COUNTRIES = ['中国', '日本', '英国', '美国', '泰国', '新加坡', '法国', '澳大利亚'];

interface SearchSelectProps {
  label: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  options?: string[];
  onChange?: (val: string) => void;
}

// Optimized SearchSelect to handle native Select for Country
const SearchSelect: React.FC<SearchSelectProps> = ({ 
  label, value, placeholder, disabled, required = false, options = [], onChange 
}) => (
  <div className="mb-5 relative group">
    <label className="text-xs font-bold text-slate-600 mb-1.5 block">
      {required && <span className="text-rose-500 mr-1">*</span>}
      {label}
    </label>
    <div className="relative">
      <select 
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        disabled={disabled}
        className={`appearance-none block w-full pl-3 pr-8 py-2 border rounded text-sm transition-all outline-none ${
            disabled 
              ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' 
              : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-slate-800 bg-white cursor-pointer hover:border-blue-400 shadow-sm'
        }`}
      >
        <option value="">{placeholder || '请选择'}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none ${disabled ? 'text-slate-300' : 'text-slate-400'}`} />
    </div>
  </div>
);

interface CheckboxProps {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: () => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, disabled, onChange }) => (
  <div 
    onClick={() => !disabled && onChange && onChange()}
    className={`flex items-center gap-2.5 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer group'}`}
  >
    <div className={`
      w-4 h-4 rounded-[3px] flex items-center justify-center transition-all border
      ${checked 
          ? (disabled ? 'bg-slate-300 border-slate-300' : 'bg-blue-600 border-blue-600 group-hover:bg-blue-700 shadow-sm') 
          : (disabled ? 'bg-slate-100 border-slate-200' : 'bg-white border-slate-300 group-hover:border-blue-500 shadow-sm')
      }
    `}>
      {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
    </div>
    <span className={`text-sm font-medium ${disabled ? 'text-slate-400' : 'text-slate-700'}`}>{label}</span>
  </div>
);

const HotelDetail: React.FC<HotelDetailProps> = ({ 
  hotel, activeTab, onTabChange, onBack
}) => {
  const [currentHotel, setCurrentHotel] = useState(hotel);
  const [selectedFacilities, setSelectedFacilities] = useState(['wifi_room_free', 'wifi_lobby_free', '24h', 'elevator', 'parking_free', 'breakfast_cn']);
  const [images, setImages] = useState(MOCK_IMAGES.sort((a, b) => (a.isMaster === b.isMaster ? 0 : a.isMaster ? -1 : 1)));
  const [isRoomDrawerOpen, setIsRoomDrawerOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: hotel.latitude, lng: hotel.longitude });
  // Guest Policy State for L4 Editing
  const [guestPolicy, setGuestPolicy] = useState(hotel.guestPolicy || '接待外宾');

  // Smart Validation State
  const [nameValidation, setNameValidation] = useState<ValidationFeedback | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isSystemSource = currentHotel.sourceType !== SourceType.L4;
  const getConflict = (fieldName: string) => currentHotel.fieldConflicts?.find(c => c.fieldName === fieldName);

  // Determine if this is a new manually entered hotel
  const isNewOrManual = currentHotel.id.startsWith('NEW_') || currentHotel.id.startsWith('MANUAL_');

  useEffect(() => {
    setCurrentHotel(hotel);
    setCoordinates({ lat: hotel.latitude, lng: hotel.longitude });
    setGuestPolicy(hotel.guestPolicy || '接待外宾');
    setNameValidation(null);
  }, [hotel]);

  // Handle Smart Validation for Hotel Name
  const handleNameBlur = (val: string) => {
    if (!val || isSystemSource) return;

    // 1. Check Internal Database (MOCK_HOTELS)
    const internalMatch = MOCK_HOTELS.find(h => 
      h.name.includes(val) || (h.nameEn && h.nameEn.includes(val))
    );

    if (internalMatch && internalMatch.id !== currentHotel.id) {
       setNameValidation({
         type: 'EXISTING_INTERNAL',
         message: `系统检测到同名酒店（ID: ${internalMatch.id.split('_')[1]}），状态：数据正常`,
         data: internalMatch
       });
       return;
    }

    // 2. Check External Database (MOCK_EXTERNAL_RESOURCES)
    const externalMatch = MOCK_EXTERNAL_RESOURCES.find(r => 
      r.name.includes(val) || (r.nameEn && r.nameEn.includes(val))
    );

    if (externalMatch) {
      setNameValidation({
        type: 'EXISTING_EXTERNAL',
        message: '系统检测到全网渠道存在匹配资源',
        data: externalMatch
      });
      return;
    }
    setNameValidation(null);
  };

  const handleValidationAction = (feedback: ValidationFeedback) => {
    if (feedback.type === 'EXISTING_INTERNAL') {
      alert(`正在跳转查看 ID: ${feedback.data.id} 的详情页...`);
    } else if (feedback.type === 'EXISTING_EXTERNAL') {
      const extData = feedback.data;
      setCurrentHotel(prev => ({
        ...prev,
        name: extData.name,
        nameEn: extData.nameEn,
        address: extData.address,
        addressEn: extData.addressEn,
        star: extData.star,
        brand: extData.brand,
        description: extData.desc,
        phone: extData.phone,
        latitude: extData.lat,
        longitude: extData.lng
      }));
      setCoordinates({ lat: extData.lat, lng: extData.lng });
      setNameValidation(null);
    }
  };

  const toggleFacility = (id: string) => {
    setSelectedFacilities(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleSetMaster = (id: number) => {
    setImages(prev => {
        const newImages = prev.map(img => ({
            ...img,
            isMaster: img.id === id
        }));
        return newImages.sort((a, b) => (a.isMaster === b.isMaster ? 0 : a.isMaster ? -1 : 1));
    });
  };

  const handleDeleteImage = (id: number) => {
      setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleUpdateImageType = (id: number, newType: string) => {
      setImages(prev => prev.map(img => img.id === id ? { ...img, type: newType } : img));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImages: HotelImage[] = Array.from(files).map((file, index) => ({
        id: Date.now() + index,
        url: URL.createObjectURL(file as Blob),
        type: '其他',
        isMaster: false,
        source: SourceType.L4
      }));
      setImages(prev => [...prev, ...newImages]);
    }
    if (event.target) event.target.value = '';
  };

  const handleOpenRoomDetail = (room: Room | null) => {
    setSelectedRoom(room);
    setIsRoomDrawerOpen(true);
  };

  const handleMapConfirm = (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
  };

  const getStatusText = () => {
    if (isNewOrManual) return '数据未生效，待保存发布';
    if (currentHotel.conflict && currentHotel.sourceType === SourceType.L4) return '存在待解决冲突数据';
    return '数据正常';
  };

  // ------------------------------------------
  // Address Cascade Logic
  // ------------------------------------------
  const handleCountryChange = (val: string) => {
    setCurrentHotel(prev => ({
      ...prev,
      country: val,
      province: '',
      city: '',
      district: ''
    }));
  };

  const handleProvinceChange = (val: string) => {
    setCurrentHotel(prev => ({
      ...prev,
      province: val,
      city: '',
      district: ''
    }));
  };

  const getProvinceOptions = () => {
    const country = currentHotel.country || '';
    return REGION_DATA[country]?.provinces || [];
  };

  const getCityOptions = () => {
    const country = currentHotel.country || '';
    const province = currentHotel.province || '';
    return REGION_DATA[country]?.cities[province] || [];
  };

  // Basic update handlers
  const handleNameChange = (val: string) => setCurrentHotel(prev => ({...prev, name: val}));
  const handleAddressChange = (val: string) => setCurrentHotel(prev => ({...prev, address: val}));
  const handleAddressEnChange = (val: string) => setCurrentHotel(prev => ({...prev, addressEn: val}));

  return (
    <div className="h-full flex flex-col bg-white relative">
      {/* 1. Breadcrumbs */}
      <div className="px-8 py-4 text-[10px] text-slate-400 border-b border-slate-100 flex items-center font-bold uppercase tracking-widest shrink-0">
        <span onClick={onBack} className="hover:text-blue-500 cursor-pointer transition-colors">资源管理中心</span>
        <span className="mx-3 opacity-30 text-slate-900">/</span>
        <span onClick={onBack} className="hover:text-blue-500 cursor-pointer transition-colors">酒店信息</span>
        <span className="mx-3 opacity-30 text-slate-900">/</span>
        <span className="text-slate-900">酒店详情</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          
          {/* Header Action Bar */}
          <div className="bg-white p-4 border border-slate-200 rounded flex items-center justify-between mb-6 shadow-sm">
            <div className="flex items-center gap-4">
              <button 
                onClick={onBack} 
                className="p-2 rounded hover:bg-slate-100 text-slate-500 transition-colors border border-transparent hover:border-slate-200"
                title="返回列表"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="h-8 w-px bg-slate-200"></div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-slate-900">{currentHotel.name}</h1>
                  {currentHotel.sourceType === SourceType.L4 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      <UsersIcon className="h-3 w-3" />
                      业务录入
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <Globe className="h-3 w-3" />
                      系统同步
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                   <span>ID: {currentHotel.id}</span>
                   <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                   <span>更新: {currentHotel.lastUpdate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Navigation Tabs */}
          <div className="bg-white border-b border-slate-200 px-4 pt-2 mb-6">
            <div className="flex gap-8">
              {[
                { id: 'basic', label: '基础信息', icon: Building2 },
                { id: 'rooms', label: '房型管理', icon: Layers },
                { id: 'policies', label: '酒店政策', icon: ScrollText },
                { id: 'facilities', label: '设施服务', icon: Wifi },
                { id: 'images', label: '图片素材', icon: ImageIcon },
                { id: 'governance', label: '数据治理', icon: FileText },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id as ActiveTab)}
                  className={`pb-2.5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
                    activeTab === tab.id 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Content Area */}
          <div className="min-h-[600px] space-y-6">
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 gap-6">
                {/* 1. Identity Information */}
                <section className="bg-white p-6 rounded border border-slate-200 shadow-sm">
                  <SectionTitle title="身份信息" icon={Fingerprint} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                    <SourceField 
                      label="酒店中文名" 
                      value={currentHotel.name} 
                      source={currentHotel.sourceType} 
                      conflictValue={getConflict('name')?.suggestedValue} 
                      apiSource={getConflict('name')?.apiSource} 
                      required
                      onBlur={handleNameBlur}
                      onChange={handleNameChange}
                      validationFeedback={nameValidation}
                      onValidationAction={handleValidationAction}
                    />
                    <SourceField 
                      label="官方英文名" 
                      value={currentHotel.nameEn} 
                      source={currentHotel.sourceType}
                      conflictValue={getConflict('nameEn')?.suggestedValue} 
                      apiSource={getConflict('nameEn')?.apiSource}
                    />
                    <SearchSelect label="网评钻级" value={`${currentHotel.star}钻`} required disabled={isSystemSource} options={['5钻', '4钻', '3钻', '2钻']} />
                    <SearchSelect label="品牌/集团" value={currentHotel.brand} placeholder="选择所属品牌或集团" disabled={isSystemSource} options={['费尔蒙 (Fairmont)', '半岛 (The Peninsula)', '虹夕诺雅 (Hoshinoya)', '全季 (All Seasons)', '万豪 (Marriott)', '希尔顿 (Hilton)']} />
                  </div>
                </section>
                
                {/* 2. Address & Location (NEW STRUCTURE) */}
                <section className="bg-white p-6 rounded border border-slate-200 shadow-sm">
                  <SectionTitle title="地址与位置" icon={MapPin} />
                  <div className="space-y-6">
                    
                    {/* Combined Row: Country / Province / City / District - REMOVED CONTAINER BOX */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <SearchSelect 
                          label="国家/地区" 
                          value={currentHotel.country || '中国'} 
                          required 
                          disabled={isSystemSource}
                          options={COUNTRIES}
                          onChange={handleCountryChange}
                        />
                      <Combobox 
                        label="省/州/大区" 
                        value={currentHotel.province || ''}
                        options={getProvinceOptions()}
                        onChange={handleProvinceChange}
                        disabled={isSystemSource}
                        placeholder={isSystemSource ? '' : "选择或输入"}
                        required={currentHotel.country === '中国'} 
                      />
                      <Combobox 
                        label="城市/市/区域" 
                        value={currentHotel.city || ''}
                        options={getCityOptions()}
                        onChange={(val) => setCurrentHotel(prev => ({...prev, city: val}))}
                        disabled={isSystemSource}
                        placeholder={isSystemSource ? '' : "选择或输入"}
                        required
                      />
                      <Combobox 
                        label="区/县/行政区" 
                        value={currentHotel.district || ''}
                        options={['黄浦区', '徐汇区', '静安区', '浦东新区', '朝阳区', '海淀区']} // Demo list
                        onChange={(val) => setCurrentHotel(prev => ({...prev, district: val}))}
                        disabled={isSystemSource}
                        placeholder={isSystemSource ? '' : "选择或输入"}
                        required={currentHotel.country === '中国'} 
                      />
                    </div>
                    
                    {/* Row 3: Address Fields */}
                    <div className="w-full">
                       <SourceField 
                          label="详细地址 (街道门牌号)" 
                          value={currentHotel.address} 
                          source={currentHotel.sourceType} 
                          conflictValue={getConflict('address')?.suggestedValue} 
                          apiSource={getConflict('address')?.apiSource}
                          required
                          onChange={handleAddressChange}
                       />
                    </div>
                     <div className="w-full">
                       <SourceField 
                          label="详细地址 (英语 - 选填)" 
                          value={currentHotel.addressEn || ''} 
                          source={currentHotel.sourceType} 
                          conflictValue={getConflict('addressEn')?.suggestedValue} 
                          apiSource={getConflict('addressEn')?.apiSource}
                          onChange={handleAddressEnChange}
                       />
                    </div>

                    {/* Lat/Lng Module */}
                    <div className="p-4 bg-slate-50 rounded border border-slate-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">
                            <span className="text-rose-500 mr-1">*</span>经度 (Longitude)
                          </label>
                          <input 
                            type="number"
                            value={coordinates.lng || ''} 
                            placeholder="输入地址后匹配"
                            onChange={(e) => !isSystemSource && setCoordinates(prev => ({ ...prev, lng: parseFloat(e.target.value) }))}
                            readOnly={isSystemSource}
                            className={`w-full p-2 border border-slate-200 rounded text-sm font-mono shadow-sm outline-none transition-colors ${
                              isSystemSource 
                                ? 'bg-slate-100 text-slate-500 cursor-not-allowed' 
                                : 'bg-white text-slate-700 focus:border-blue-500'
                            }`} 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">
                            <span className="text-rose-500 mr-1">*</span>纬度 (Latitude)
                          </label>
                          <input 
                            type="number"
                            value={coordinates.lat || ''} 
                            placeholder="输入地址后匹配"
                            onChange={(e) => !isSystemSource && setCoordinates(prev => ({ ...prev, lat: parseFloat(e.target.value) }))}
                            readOnly={isSystemSource}
                            className={`w-full p-2 border border-slate-200 rounded text-sm font-mono shadow-sm outline-none transition-colors ${
                              isSystemSource 
                                ? 'bg-slate-100 text-slate-500 cursor-not-allowed' 
                                : 'bg-white text-slate-700 focus:border-blue-500'
                            }`} 
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pl-1">
                            <Crosshair className="h-3.5 w-3.5" />
                            <span>腾讯坐标系 (GCJ-02)</span>
                          </div>
                          {currentHotel.sourceType === SourceType.L4 ? (
                             <button
                                onClick={() => setIsMapPickerOpen(true)}
                                className="h-[30px] px-3 bg-white text-blue-600 hover:bg-blue-50 rounded text-xs transition-all flex items-center gap-1.5 border border-slate-200 shadow-sm font-bold"
                            >
                                <MapPinIcon className="h-3.5 w-3.5" />
                                地图选点
                            </button>
                          ) : (
                             <div className="h-[30px] px-3 bg-slate-100 text-slate-400 rounded text-xs flex items-center gap-1.5 border border-slate-200 cursor-not-allowed">
                                <Lock className="h-3 w-3" />
                                锁定中
                             </div>
                          )}
                      </div>
                    </div>
                    
                    {/* Business District & Zip Code */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                       <SearchSelect label="所在商圈" value={currentHotel.businessDistrict} disabled={isSystemSource} />
                       <SourceField 
                          label="邮政编码" 
                          value={currentHotel.zipCode || ''} 
                          source={currentHotel.sourceType}
                       />
                    </div>
                  </div>
                </section>

                {/* 3. Contact Information */}
                <section className="bg-white p-6 rounded border border-slate-200 shadow-sm">
                  <SectionTitle title="联系方式" icon={Phone} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8">
                    <SourceField label="酒店电话" value={currentHotel.phone} source={currentHotel.sourceType} required />
                    <SourceField label="传真号码" value={currentHotel.fax || ''} source={currentHotel.sourceType} />
                    <SourceField label="联系邮箱" value={currentHotel.email} source={currentHotel.sourceType} />
                  </div>
                </section>

                {/* 4. Hotel Overview */}
                <section className="bg-white p-6 rounded border border-slate-200 shadow-sm">
                   <SectionTitle title="酒店概况" icon={FileText} />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 mb-4">
                      <SourceField label="开业时间" value={currentHotel.openingDate} source={currentHotel.sourceType} type="month" />
                      <SourceField label="最近装修时间" value={currentHotel.renovationDate} source={currentHotel.sourceType} type="month" />
                   </div>
                   <SourceField 
                      label="酒店介绍" 
                      value={currentHotel.description || ''} 
                      source={currentHotel.sourceType} 
                      type="textarea"
                   />
                </section>
              </div>
            )}
            
            {/* ... Other Tabs remain identical (Rooms, Policies, Facilities, Images, Governance) ... */}
            {activeTab === 'rooms' && (
              <div className="bg-white p-6 rounded border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800">房型库管理</h3>
                  <button 
                    onClick={() => handleOpenRoomDetail(null)}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 shadow-sm border border-blue-600 font-bold"
                  >
                    <Plus className="h-4 w-4" /> 新增房型
                  </button>
                </div>
                <div className="grid gap-4">
                  {MOCK_ROOMS.map((room) => (
                    <div key={room.id} className="border border-slate-100 rounded p-4 flex gap-6 hover:border-blue-300 transition-all bg-white hover:bg-blue-50/20 group shadow-sm">
                      <div className="w-32 h-24 bg-slate-100 rounded border border-slate-200 overflow-hidden shrink-0 shadow-inner">
                        <img src={`https://picsum.photos/seed/room-${room.id}/500/400`} className="w-full h-full object-cover" alt="room" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                             {room.name}
                             {room.source === 'L4' ? (
                                 <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100 font-bold uppercase tracking-widest">业务录入</span>
                             ) : (
                                 <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full border border-slate-200 font-bold uppercase tracking-widest">系统同步</span>
                             )}
                             {room.syncWithSystem && room.source === 'L4' && (
                               <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 font-bold flex items-center gap-0.5 uppercase tracking-widest">
                                 <RefreshCw className="h-3 w-3" /> 实时
                               </span>
                             )}
                          </h4>
                          <div className="flex items-center gap-2">
                             <button 
                              onClick={() => handleOpenRoomDetail(room)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-bold transition-colors ml-2 underline underline-offset-4"
                             >
                               详情
                             </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-3 font-medium">
                           <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded"><UsersIcon className="h-3.5 w-3.5 opacity-50" /> {room.occupancy}</div>
                           <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded"><Maximize className="h-3.5 w-3.5 opacity-50" /> {room.area}</div>
                           <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded"><Bed className="h-3.5 w-3.5 opacity-50" /> {room.bed}</div>
                           <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded"><LayoutTemplate className="h-3.5 w-3.5 opacity-50" /> {room.window}</div>
                           <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded"><Building2 className="h-3.5 w-3.5 opacity-50" /> {room.floor}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'policies' && (
              <div className="space-y-6">
                <section className="bg-white p-6 rounded border border-slate-200 shadow-sm">
                  <SectionTitle title="接待与入离" icon={Clock} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <SourceField label="最早入住时间" value={currentHotel.checkInTime || '14:00'} source={currentHotel.sourceType} required />
                    <SourceField label="最晚离店时间" value={currentHotel.checkOutTime || '12:00'} source={currentHotel.sourceType} required />
                    <SourceField label="前台服务时间" value={currentHotel.frontDeskHours || '24小时'} source={currentHotel.sourceType} />
                    <div className="relative group">
                        <label className="text-xs font-bold text-slate-600 mb-1.5 block">
                           <span className="text-rose-500 mr-1">*</span>可接待人群
                        </label>
                        <select 
                          value={guestPolicy}
                          onChange={(e) => setGuestPolicy(e.target.value)}
                          disabled={isSystemSource}
                          className={`block w-full px-3 py-2 border rounded text-sm transition-all outline-none appearance-none ${
                            isSystemSource 
                              ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed' 
                              : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-slate-800 bg-white cursor-pointer hover:border-blue-400'
                          }`}
                        >
                          <option value="接待外宾">接待外宾</option>
                          <option value="仅接待大陆和港澳台客人">仅接待大陆和港澳台客人</option>
                          <option value="仅接待大陆客人">仅接待大陆客人</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-[34px] h-4 w-4 text-slate-400 pointer-events-none" />
                     </div>
                  </div>
                </section>
                <section className="bg-white p-6 rounded border border-slate-200 shadow-sm">
                   <SectionTitle title="儿童与宠物" icon={Briefcase} />
                   <div className="space-y-6">
                      <div>
                        <SourceField label="儿童及加床政策" value={currentHotel.childPolicy} source={currentHotel.sourceType} type="textarea" />
                        <div className="flex items-start gap-1.5 mt-1">
                          <Info className="h-3 w-3 text-slate-400 mt-0.5" />
                          <span className="text-[10px] text-slate-400">建议模糊具体收费金额，例如：“加床需额外收费，详情请咨询前台”。</span>
                        </div>
                      </div>
                      <SourceField label="宠物政策" value={currentHotel.petPolicy} source={currentHotel.sourceType} type="textarea" />
                   </div>
                </section>
              </div>
            )}

            {activeTab === 'facilities' && (
              <div className="bg-white p-6 rounded border border-slate-200 shadow-sm space-y-12">
                <div>
                  <SectionTitle title="网络设施" icon={Wifi} />
                  <div className="grid grid-cols-4 gap-6 px-4">
                    {[
                      { id: 'wifi_room_free', label: '客房WIFI免费' },
                      { id: 'wifi_lobby_free', label: '大堂WIFI免费' },
                      { id: 'wifi_meeting_paid', label: '会议室WIFI收费' }
                    ].map(item => (
                       <Checkbox key={item.id} label={item.label} checked={selectedFacilities.includes(item.id)} disabled={isSystemSource} onChange={() => toggleFacility(item.id)} />
                    ))}
                  </div>
                </div>
                <div>
                   <SectionTitle title="交通服务" icon={Car} />
                   <div className="grid grid-cols-4 gap-6 px-4">
                     {[
                       { id: 'parking_free', label: '免费停车场' },
                       { id: 'parking_paid', label: '收费停车场' },
                       { id: 'valet', label: '代客泊车' },
                       { id: 'shuttle', label: '接送机服务' },
                       { id: 'taxi', label: '叫车服务' },
                       { id: 'rental', label: '租车服务' },
                     ].map(item => (
                        <Checkbox key={item.id} label={item.label} checked={selectedFacilities.includes(item.id)} disabled={isSystemSource} onChange={() => toggleFacility(item.id)} />
                     ))}
                   </div>
                </div>
                <div>
                   <SectionTitle title="综合服务" icon={ConciergeBell} />
                   <div className="grid grid-cols-4 gap-6 px-4">
                     {[
                       { id: '24h', label: '24小时前台' },
                       { id: 'luggage', label: '行李寄存' },
                       { id: 'wakeup', label: '叫醒服务' },
                       { id: 'elevator', label: '电梯' },
                       { id: 'atm', label: 'ATM机' },
                       { id: 'safe', label: '前台保险柜' },
                     ].map(item => (
                        <Checkbox key={item.id} label={item.label} checked={selectedFacilities.includes(item.id)} disabled={isSystemSource} onChange={() => toggleFacility(item.id)} />
                     ))}
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="bg-white p-6 rounded border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800">图片素材库</h3>
                  <div className="flex gap-2">
                     <input type="file" ref={fileInputRef} multiple className="hidden" accept="image/*" onChange={handleFileChange} />
                     <button onClick={handleUploadClick} className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 shadow-sm border border-blue-600 font-bold">
                       <Upload className="h-4 w-4" /> 批量上传
                     </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 lg:grid-cols-5 gap-4">
                  {images.map((img) => (
                    <div key={img.id} className="group relative border border-slate-200 rounded overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
                      <div className="aspect-[4/3] relative bg-slate-100">
                        <img src={img.url} className="w-full h-full object-cover" alt={img.type} />
                        {img.isMaster && <div className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded shadow-lg font-bold uppercase tracking-wider">封面</div>}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                           {!img.isMaster && <button onClick={() => handleSetMaster(img.id)} className="bg-white p-2 rounded-full hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors shadow-lg" title="设为封面"><StarIcon className="h-4 w-4" /></button>}
                           {img.source === SourceType.L4 && <button onClick={() => handleDeleteImage(img.id)} className="bg-white p-2 rounded-full hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-colors shadow-lg" title="删除"><Trash2 className="h-4 w-4" /></button>}
                        </div>
                      </div>
                      <div className="p-2 border-t border-slate-50 bg-slate-50/50">
                        {img.source === SourceType.L4 ? (
                           <select value={img.type} onChange={(e) => handleUpdateImageType(img.id, e.target.value)} className="w-full text-xs font-bold text-slate-700 px-1 py-1 bg-white border border-slate-200 rounded outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all cursor-pointer hover:border-blue-300">
                             {IMAGE_TAGS.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                           </select>
                        ) : (
                            <div className="flex items-center justify-between px-1 py-1">
                              <span className="text-xs font-bold text-slate-700 px-2 py-0.5 bg-slate-200/50 rounded border border-slate-200">{img.type}</span>
                              <div className="flex items-center gap-1" title="系统同步锁定"><Lock className="h-3 w-3 text-slate-400" /></div>
                            </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div onClick={handleUploadClick} className="border-2 border-dashed border-slate-200 rounded flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-slate-50 transition-all cursor-pointer text-slate-400 hover:text-blue-500 min-h-[160px] group shadow-inner">
                    <Plus className="h-6 w-6 opacity-30 group-hover:opacity-100 transition-opacity" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">点击添加</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'governance' && (
              <div className="bg-white p-6 rounded border border-slate-200 shadow-sm">
                <div className="mb-8 flex items-start gap-4 p-4 bg-blue-50 border border-blue-100 rounded text-blue-900 shadow-sm">
                   <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5 text-blue-600" />
                   <div>
                     <p className="font-bold text-sm">治理体系说明</p>
                     <p className="text-xs mt-1 leading-relaxed opacity-80 font-medium">系统仅针对“业务录入”的数据冲突进行人工介入提醒。对于与“系统同步”的数据将自动自动更新通过，以保持数据的时效性与准确性。</p>
                   </div>
                </div>
                {isNewOrManual ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                    <FileText className="h-8 w-8 mb-2 opacity-20" />
                    <span className="text-xs font-medium">暂无历史治理记录</span>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {MOCK_LOGS.map((log) => (
                      <div key={log.id} className="flex gap-6 p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors group">
                        <div className="flex flex-col items-center min-w-[80px] shrink-0">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.time.split(' ')[0]}</span>
                          <span className="text-[10px] text-slate-300 font-mono mt-0.5">{log.time.split(' ')[1]}</span>
                        </div>
                        <div className="relative pl-6 border-l border-slate-200">
                          <div className="absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full bg-slate-300 group-hover:bg-blue-400 transition-colors"></div>
                          <div className="flex items-center gap-3 mb-1.5">
                            <span className="text-sm font-bold text-slate-800">{log.action}</span>
                            <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-bold uppercase tracking-wider border border-slate-200">{log.user}</span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">{log.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="px-8 py-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="text-xs text-slate-400 font-medium">
           数据状态: {getStatusText()}
        </div>
        <div className="flex items-center gap-3">
           <button onClick={onBack} className="px-6 py-2 border border-slate-300 text-slate-700 rounded text-sm font-bold hover:bg-slate-50 transition-colors">取消</button>
           <button className="px-6 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 shadow-sm flex items-center gap-2"><Save className="h-4 w-4" /> 保存并发布</button>
        </div>
      </div>

      {isRoomDrawerOpen && <RoomDetailDrawer room={selectedRoom} existingRooms={MOCK_ROOMS} isOpen={isRoomDrawerOpen} onClose={() => setIsRoomDrawerOpen(false)} />}
      {isMapPickerOpen && <MapPickerModal isOpen={isMapPickerOpen} onClose={() => setIsMapPickerOpen(false)} initialLat={coordinates.lat} initialLng={coordinates.lng} onConfirm={handleMapConfirm} />}
    </div>
  );
};

export default HotelDetail;
