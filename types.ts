
export enum SourceType {
  // L1 Removed
  L2 = 'L2', // 直连 API (系统同步)
  L3 = 'L3', // OTA 接口 (系统同步)
  L4 = 'L4', // 用户自采 (业务部门录入)
}

export enum HotelStatus {
  OPERATING = 'operating',
  PREPARING = 'preparing',
  OFFLINE = 'offline',
}

export interface ExternalMapping {
  source: string;
  externalId: string;
  status: 'active' | 'error';
}

export interface FieldConflict {
  fieldName: string;
  suggestedValue: string;
  apiSource: string;
}

export interface Hotel {
  id: string;
  name: string;
  nameEn: string;
  brand?: string; // Brand/Group
  sourceType: SourceType;
  status: HotelStatus;
  
  // Address & Location
  address: string; // Local Language
  addressEn?: string; // English
  zipCode?: string;
  country?: string;
  province?: string;
  city?: string;
  district?: string;
  latitude: number;
  longitude: number;
  businessDistrict: string;
  
  star: string;
  lastUpdate: string;
  conflict: boolean;
  mappings: ExternalMapping[];
  fieldConflicts?: FieldConflict[];
  
  // Contact
  phone: string;
  fax?: string;
  email: string;
  
  // Overview
  openingDate: string;
  renovationDate: string;
  description?: string; // Hotel Introduction
  
  // Policies
  checkInTime: string;
  checkOutTime: string;
  frontDeskHours?: string; // New: 前台服务时间
  petPolicy: string;
  childPolicy: string;
  guestPolicy?: string; // New: 可接待人群

  // Facilities
  wifiDetails: string;
  parkingDetails: string;
  meetingRoomDetails: string;
  businessCenterDetails: string;
  gymDetails: string;
  poolDetails: string;
  spaDetails: string;
}

export interface Room {
  id: number;
  name: string;
  area: string;
  bed: string;
  bedCount: number;
  occupancy: string; // 外显：入住人数
  adults?: number;
  children?: number;
  window: string;
  floor: string;
  plans: number;
  source: string; // 'L4' or other
  syncWithSystem?: boolean; // 新增：是否实时同步系统更新 (仅针对 L4)
  smokingPolicy?: string;
  extraBedPolicy?: string;
  features?: string[];
  view?: string;
}

export interface HotelImage {
  id: number;
  url: string;
  type: string;
  isMaster: boolean;
  source: SourceType;
}

export interface GovernanceLog {
  id: number;
  time: string;
  user: string;
  action: string;
  detail: string;
}

export type ActiveTab = 'basic' | 'rooms' | 'policies' | 'facilities' | 'images' | 'governance';
export type View = 'list' | 'detail';
