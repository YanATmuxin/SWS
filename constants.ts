
import { Hotel, HotelStatus, SourceType, Room, HotelImage, GovernanceLog } from './types';

export const MOCK_HOTELS: Hotel[] = [
  {
    id: 'HTL_1001',
    name: '上海和平饭店',
    nameEn: 'Fairmont Peace Hotel',
    brand: '费尔蒙 (Fairmont)',
    sourceType: SourceType.L3, // System Sync
    status: HotelStatus.OPERATING,
    address: '南京东路20号',
    addressEn: '20 Nanjing Road East',
    zipCode: '200002',
    country: '中国',
    province: '上海市',
    city: '上海市',
    district: '黄浦区',
    star: '5',
    lastUpdate: '2025-12-23 10:30',
    conflict: true,
    mappings: [
      { source: '艺龙', externalId: 'EL_99821', status: 'active' },
      { source: '直连(PMS)', externalId: 'PMS_HP001', status: 'active' }
    ],
    fieldConflicts: [
      { fieldName: 'name', suggestedValue: '和平饭店(费尔蒙旗舰店)', apiSource: '艺龙' }
    ],
    phone: '021-61386888',
    fax: '021-61386889',
    email: 'peacehotel@fairmont.com',
    openingDate: '1929-08',
    renovationDate: '2010-07',
    description: '上海和平饭店，作为上海地标性建筑，坐落于外滩与南京东路交汇处。酒店拥有九国特色套房及闻名遐迩的爵士吧。',
    businessDistrict: '外滩/南京东路步行街',
    latitude: 31.2397,
    longitude: 121.4905,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    frontDeskHours: '24小时',
    petPolicy: '允许携带宠物，需提前联系酒店并可能收取额外费用。',
    childPolicy: '酒店允许携带儿童入住，12岁以下儿童使用现有床铺免费。',
    guestPolicy: '接待外宾',
    wifiDetails: '全馆免费高速Wi-Fi (100Mbps)',
    parkingDetails: '酒店代客泊车，停车费 120 CNY/24小时',
    meetingRoomDetails: '包含著名的“九国套房”会议厅，最大容纳 300 人',
    businessCenterDetails: '商务中心提供 24 小时行政秘书服务及专业打印',
    gymDetails: '费尔蒙健身中心，配备 LifeFitness 专业器械',
    poolDetails: '室内恒温游泳池，复古自然光天窗',
    spaDetails: '蔚柳溪水疗 (Willow Stream Spa)，提供顶级面部护理'
  },
  {
    id: 'HTL_1004',
    name: '京都·虹夕诺雅(业务录入)',
    nameEn: 'Hoshinoya Kyoto',
    brand: '虹夕诺雅 (Hoshinoya)',
    sourceType: SourceType.L4, // Business Entry
    status: HotelStatus.OPERATING,
    address: '岚山元録山町11-2',
    addressEn: '11-2 Arashiyama Genrokuzancho',
    zipCode: '616-0007',
    country: '日本',
    province: '京都府',
    city: '京都市',
    district: '西京区',
    star: '5',
    lastUpdate: '2025-12-24 15:00',
    conflict: true, // Example of L4 conflict
    mappings: [],
    fieldConflicts: [
       { fieldName: 'address', suggestedValue: '京都府京都市西京区岚山元録山町11-2', apiSource: 'Agoda' },
       { fieldName: 'nameEn', suggestedValue: 'HOSHINOYA Kyoto Resort', apiSource: 'Booking.com' }
    ],
    phone: '+81-50-3786-1144',
    fax: '+81-50-3786-1145',
    email: 'info@hoshinoya.com',
    openingDate: '2009-12',
    renovationDate: '2021-05',
    description: '位于岚山深处的隐世度假村，需乘船前往。每间客房均可欣赏保津川的四季美景。',
    businessDistrict: '岚山地区',
    latitude: 35.0116,
    longitude: 135.6772,
    checkInTime: '15:00',
    checkOutTime: '12:00',
    frontDeskHours: '08:00 - 22:00',
    petPolicy: '不可携带宠物。',
    childPolicy: '欢迎儿童入住，特定年龄段有半餐服务。',
    guestPolicy: '接待外宾',
    wifiDetails: '客房内免费 Wi-Fi (50Mbps)',
    parkingDetails: '酒店周边合作停车场，需预约',
    meetingRoomDetails: '小型禅意冥想室，适合 10 人以内会议',
    businessCenterDetails: '前台代收邮件及快递服务',
    gymDetails: '无健身房，提供河畔瑜伽垫及晨间拉伸课程',
    poolDetails: '无游泳池',
    spaDetails: '室内按摩护理服务，采用京都草本精油'
  },
  {
    id: 'HTL_1002',
    name: '全季酒店(上海延安东路店)',
    nameEn: 'All Seasons Shanghai Yanan East Road',
    brand: '全季 (All Seasons)',
    sourceType: SourceType.L3, // System Sync
    status: HotelStatus.PREPARING,
    address: '延安东路100号',
    addressEn: '100 Yanan East Road',
    zipCode: '200001',
    country: '中国',
    province: '上海市',
    city: '上海市',
    district: '黄浦区',
    star: '4',
    lastUpdate: '2025-12-23 09:15',
    conflict: false,
    mappings: [{ source: '艺龙', externalId: 'EL_88120', status: 'active' }],
    phone: '021-53531188',
    fax: '',
    email: 'reservations@huazhu.com',
    openingDate: '2015-10',
    renovationDate: '2022-03',
    description: '华住集团旗下中档酒店品牌，以简约而富有品质的设计风格著称。',
    businessDistrict: '人民广场/大世界',
    latitude: 31.2304,
    longitude: 121.4737,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    frontDeskHours: '24小时',
    petPolicy: '不可携带宠物。',
    childPolicy: '欢迎儿童入住。',
    guestPolicy: '仅接待大陆客人',
    wifiDetails: '全馆免费 Wi-Fi (20Mbps)',
    parkingDetails: '酒店自带地上停车场，住客免费',
    meetingRoomDetails: '多功能会议室 1 间，最大容纳 40 人',
    businessCenterDetails: '自助咖啡机及自助打印区',
    gymDetails: '小型自助健身房',
    poolDetails: '无游泳池',
    spaDetails: '无水疗中心'
  }
];

// 模拟外部渠道资源库 (用于智能校验 Demo)
export const MOCK_EXTERNAL_RESOURCES = [
  { 
    name: '上海半岛酒店', 
    nameEn: 'The Peninsula Shanghai', 
    address: '上海市黄浦区中山东一路32号', 
    addressEn: 'No. 32 The Bund, Zhongshan East 1st Road',
    star: '5',
    brand: '半岛 (The Peninsula)',
    lat: 31.2425,
    lng: 121.4850,
    phone: '021-23272888',
    desc: '上海半岛酒店坐落于历史悠久的外滩，拥有绝佳的黄浦江景观。'
  }
];

export const MOCK_ROOMS: Room[] = [
  { 
    id: 1, 
    name: '费尔蒙大床房', 
    area: '45㎡', 
    bed: '特大床', 
    bedCount: 1, 
    occupancy: '3人', 
    adults: 3,
    children: 0,
    window: '有窗', 
    floor: '5-8层', 
    plans: 12, 
    source: 'Elong', // System
    smokingPolicy: '禁烟',
    extraBedPolicy: '不支持加床',
    features: ['书屋'],
    view: '城景'
  },
  { 
    id: 2, 
    name: '九国套房', 
    area: '88㎡', 
    bed: '特大床', 
    bedCount: 1, 
    occupancy: '2人', 
    adults: 2,
    children: 0,
    window: '江景', 
    floor: '9层', 
    plans: 4, 
    source: 'Direct', // System
    smokingPolicy: '禁烟',
    extraBedPolicy: '支持加床, 最多1张',
    features: ['水上别墅', '木屋'],
    view: '外滩江景'
  },
  { 
    id: 3, 
    name: '标准双床房', 
    area: '35㎡', 
    bed: '双床', 
    bedCount: 2, 
    occupancy: '2人', 
    adults: 2,
    children: 0,
    window: '有窗', 
    floor: '2-10层', 
    plans: 8, 
    source: 'Elong', // System
    smokingPolicy: '禁烟',
    extraBedPolicy: '不支持加床',
    features: [],
    view: '中庭景'
  },
  { 
    id: 4, 
    name: '豪华景观套房', 
    area: '65㎡', 
    bed: '特大床', 
    bedCount: 1, 
    occupancy: '3人', 
    adults: 3,
    children: 0,
    window: '江景', 
    floor: '15-18层', 
    plans: 5, 
    source: 'L3', // System
    smokingPolicy: '禁烟',
    extraBedPolicy: '支持加床, 最多1张',
    features: ['书屋', '木屋'],
    view: '黄浦江景'
  },
  { 
    id: 5, 
    name: '亲子主题趣玩房', 
    area: '50㎡', 
    bed: '大床+单人床', 
    bedCount: 2, 
    occupancy: '3人', 
    adults: 3,
    children: 0,
    window: '有窗', 
    floor: '12层', 
    plans: 3, 
    source: 'L4', // Business
    syncWithSystem: false,
    smokingPolicy: '禁烟',
    extraBedPolicy: '不支持加床',
    features: ['亲子房', '帐篷房'],
    view: '城景'
  },
  { 
    id: 6, 
    name: '行政大床房', 
    area: '40㎡', 
    bed: '大床', 
    bedCount: 1, 
    occupancy: '2人', 
    adults: 2,
    children: 0,
    window: '部分有窗', 
    floor: '18-20层', 
    plans: 10, 
    source: 'Direct', // System
    smokingPolicy: '禁烟',
    extraBedPolicy: '不支持加床',
    features: [],
    view: '城景'
  },
  { 
    id: 7, 
    name: '雅致单人房', 
    area: '25㎡', 
    bed: '单人床', 
    bedCount: 1, 
    occupancy: '1人', 
    adults: 1,
    children: 0,
    window: '无窗', 
    floor: '3-4层', 
    plans: 2, 
    source: 'L4', // Business
    syncWithSystem: true,
    smokingPolicy: '禁烟',
    extraBedPolicy: '不支持加床',
    features: [],
    view: '无'
  },
  { 
    id: 8, 
    name: '总统套房', 
    area: '200㎡', 
    bed: '特大床', 
    bedCount: 1, 
    occupancy: '4人', 
    adults: 4,
    children: 0,
    window: '全景窗', 
    floor: '最高层', 
    plans: 1, 
    source: 'L3', // System
    smokingPolicy: '禁烟',
    extraBedPolicy: '支持加床',
    features: ['水上别墅', '房车'],
    view: '360度全景'
  }
];

export const MOCK_IMAGES: HotelImage[] = [
  { id: 1, url: 'https://picsum.photos/seed/h1/800/600', type: '外观', isMaster: true, source: SourceType.L3 },
  { id: 2, url: 'https://picsum.photos/seed/h2/800/600', type: '大堂', isMaster: false, source: SourceType.L3 },
  { id: 3, url: 'https://picsum.photos/seed/h3/800/600', type: '餐厅', isMaster: false, source: SourceType.L3 },
  { id: 4, url: 'https://picsum.photos/seed/h4/800/600', type: '房型', isMaster: false, source: SourceType.L3 },
  { id: 5, url: 'https://picsum.photos/seed/h5/800/600', type: '周边', isMaster: false, source: SourceType.L4 },
];

export const MOCK_LOGS: GovernanceLog[] = [
  { id: 1, time: '2025-12-23 10:30', user: '系统自动', action: '字段同步', detail: '从 L3 源同步了坐标信息' },
  { id: 2, time: '2025-12-23 09:15', user: '张建国', action: '冲突解决', detail: '确认使用 L4 录入的中文名称' },
  { id: 3, time: '2025-12-22 18:00', user: 'System', action: '数据同步', detail: '从直连接口更新了 5 个房型信息' },
  { id: 4, time: '2025-12-22 14:20', user: '李晓明', action: '资源建立', detail: '手动录入新房型 [总统套房]' },
];
