export interface Product {
  id: string;
  category: string;
  nameZh: string;
  nameEn: string;
  descZh: string;
  descEn: string;
  specsZh: string[];
  specsEn: string[];
  price: string;
  image: string;
  images: string[];
  features: string[];
}

export const categories = [
  { id: 'all', nameZh: '全部产品', nameEn: 'All Products' },
  { id: 'carousel', nameZh: '旋转木马', nameEn: 'Carousel' },
  { id: 'roller-coaster', nameZh: '过山车', nameEn: 'Roller Coaster' },
  { id: 'bumper-car', nameZh: '碰碰车', nameEn: 'Bumper Car' },
  { id: 'ferris-wheel', nameZh: '摩天轮', nameEn: 'Ferris Wheel' },
  { id: 'water-ride', nameZh: '水上游乐', nameEn: 'Water Rides' },
  { id: 'kids-ride', nameZh: '儿童游乐', nameEn: "Kids' Rides" },
];

export const products: Product[] = [
  {
    id: 'classic-carousel',
    category: 'carousel',
    nameZh: '经典双层旋转木马',
    nameEn: 'Classic Double-Decker Carousel',
    descZh: '经典欧式风格双层旋转木马，精美的雕刻工艺与手工彩绘，搭配绚丽LED灯光系统和立体声音响，营造梦幻般的童话氛围。适合主题乐园、城市广场、商业综合体等场所。',
    descEn: 'Classic European-style double-decker carousel featuring exquisite carving and hand-painted artwork, with绚丽的 LED lighting system and stereo sound, creating a dreamy fairy-tale atmosphere. Perfect for theme parks, city squares, and commercial complexes.',
    specsZh: [
      '尺寸：直径12m × 高度10m',
      '载客量：48人（上层24人，下层24人）',
      '功率：15kW',
      '转速：4-6 rpm',
      '材质：玻璃钢+不锈钢+实木',
      '灯光：LED全彩动态灯光',
    ],
    specsEn: [
      'Dimensions: 12m diameter × 10m height',
      'Capacity: 48 persons (upper 24, lower 24)',
      'Power: 15kW',
      'Speed: 4-6 rpm',
      'Material: FRP + Stainless Steel + Solid Wood',
      'Lighting: Full-color LED dynamic lighting',
    ],
    price: '¥680,000',
    image: 'https://images.unsplash.com/photo-1570488344390-4c9e3c0c1e3e?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1570488344390-4c9e3c0c1e3e?w=800&q=80',
      'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=800&q=80',
    ],
    features: ['手工彩绘', 'LED灯光', '立体声音响', '欧式雕刻'],
  },
  {
    id: 'speed-roller-coaster',
    category: 'roller-coaster',
    nameZh: '极速过山车',
    nameEn: 'Speed Roller Coaster',
    descZh: '采用最新电磁弹射技术，最高时速可达120km/h，配备多重安全冗余系统和智能监控系统，在保证安全的前提下提供极致刺激体验。',
    descEn: 'Featuring the latest electromagnetic launch technology with a top speed of 120km/h, equipped with multiple safety redundancy systems and intelligent monitoring, delivering the ultimate thrill experience while ensuring maximum safety.',
    specsZh: [
      '轨道长度：1200m',
      '最高时速：120km/h',
      '最大高度：60m',
      '载客量：24人/车',
      '加速度：0-120km/h 3.5秒',
      '安全系统：3重冗余制动',
    ],
    specsEn: [
      'Track Length: 1200m',
      'Max Speed: 120km/h',
      'Max Height: 60m',
      'Capacity: 24 persons/train',
      'Acceleration: 0-120km/h in 3.5s',
      'Safety: Triple redundant braking',
    ],
    price: '¥3,800,000',
    image: 'https://images.unsplash.com/photo-1567095761054-7a02e69e4b5c?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1567095761054-7a02e69e4b5c?w=800&q=80',
      'https://images.unsplash.com/photo-1536228897999-8b8b5e6e7f1f?w=800&q=80',
    ],
    features: ['电磁弹射', '智能监控', '安全冗余', '极速体验'],
  },
  {
    id: 'smart-bumper-car',
    category: 'bumper-car',
    nameZh: '智能碰碰车',
    nameEn: 'Smart Bumper Car',
    descZh: '新一代智能碰碰车，配备智能防碰撞系统和安全缓冲装置，支持多车联网对战，适合各年龄段游客体验驾驶乐趣。',
    descEn: 'Next-generation smart bumper cars with intelligent collision avoidance system and safety buffers, supporting multi-car networked battles, suitable for visitors of all ages to enjoy driving fun.',
    specsZh: [
      '尺寸：1.8m × 1.2m × 0.9m',
      '载客量：1人/车',
      '电压：48V DC',
      '最大速度：8km/h',
      '电池续航：6-8小时',
      '场地面积：建议≥200㎡',
    ],
    specsEn: [
      'Dimensions: 1.8m × 1.2m × 0.9m',
      'Capacity: 1 person/car',
      'Voltage: 48V DC',
      'Max Speed: 8km/h',
      'Battery Life: 6-8 hours',
      'Area Required: ≥200㎡',
    ],
    price: '¥28,000',
    image: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=800&q=80',
      'https://images.unsplash.com/photo-1570488344390-4c9e3c0c1e3e?w=800&q=80',
    ],
    features: ['智能防撞', '多车联网', '安全缓冲', '节能环保'],
  },
  {
    id: 'panoramic-ferris-wheel',
    category: 'ferris-wheel',
    nameZh: '观景摩天轮',
    nameEn: 'Panoramic Ferris Wheel',
    descZh: '大型观景摩天轮，直径可达120米，配备全景玻璃轿厢和空调系统，轿厢内设互动显示屏，可俯瞰城市全景。',
    descEn: 'Large panoramic ferris wheel with up to 120m diameter, featuring全景 glass cabins with air conditioning and interactive displays, offering breathtaking city views.',
    specsZh: [
      '直径：60-120m（可定制）',
      '轿厢数量：36-60个',
      '载客量：6-8人/轿厢',
      '旋转一圈时间：20-30分钟',
      '驱动方式：液压/电动',
      '灯光：LED灯光秀系统',
    ],
    specsEn: [
      'Diameter: 60-120m (customizable)',
      'Cabins: 36-60',
      'Capacity: 6-8 persons/cabin',
      'Rotation Time: 20-30 min',
      'Drive: Hydraulic/Electric',
      'Lighting: LED light show system',
    ],
    price: '¥5,200,000',
    image: 'https://images.unsplash.com/photo-1561ae3c4e3c3e3c4e3c3e3c4e?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1561ae3c4e3c3e3c4e3c3e3c4e?w=800&q=80',
      'https://images.unsplash.com/photo-1536228897999-8b8b5e6e7f1f?w=800&q=80',
    ],
    features: ['全景玻璃', '空调系统', '灯光秀', '互动显示屏'],
  },
  {
    id: 'white-water-rapids',
    category: 'water-ride',
    nameZh: '激流勇进',
    nameEn: 'White Water Rapids',
    descZh: '大型水上滑道项目，结合声光电特效，营造沉浸式探险体验。配备大容量水槽和强力水泵系统，确保水流效果持续稳定。',
    descEn: 'Large water slide attraction combining sound, light, and electrical effects for an immersive adventure experience. Equipped with large-capacity water tanks and powerful pump systems for consistent water flow.',
    specsZh: [
      '滑道长度：400m',
      '最大落差：20m',
      '载客量：6人/船',
      '每小时载客：600人',
      '水泵功率：75kW',
      '特效系统：声光电联动',
    ],
    specsEn: [
      'Slide Length: 400m',
      'Max Drop: 20m',
      'Capacity: 6 persons/boat',
      'Hourly Capacity: 600 persons',
      'Pump Power: 75kW',
      'Effects: Sound + Light + Electrical',
    ],
    price: '¥2,600,000',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80',
      'https://images.unsplash.com/photo-1567095761054-7a02e69e4b5c?w=800&q=80',
    ],
    features: ['声光电特效', '沉浸体验', '大容量', '安全可靠'],
  },
  {
    id: 'kids-swing-ride',
    category: 'kids-ride',
    nameZh: '儿童旋转飞椅',
    nameEn: "Kids' Swing Ride",
    descZh: '专为3-12岁儿童设计的温和型旋转飞椅，色彩鲜艳造型可爱，配备安全压杆和软包座椅，让小朋友在安全环境中享受飞翔乐趣。',
    descEn: 'Gentle swing ride designed for children aged 3-12, with vibrant colors and cute designs. Equipped with safety bars and padded seats, allowing children to enjoy the fun of flying in a safe environment.',
    specsZh: [
      '尺寸：直径8m × 高度4.5m',
      '载客量：24人',
      '功率：5.5kW',
      '转速：3-5 rpm',
      '适合年龄：3-12岁',
      '安全配置：安全压杆+软包',
    ],
    specsEn: [
      'Dimensions: 8m diameter × 4.5m height',
      'Capacity: 24 persons',
      'Power: 5.5kW',
      'Speed: 3-5 rpm',
      'Age Range: 3-12 years',
      'Safety: Safety bars + Padded seats',
    ],
    price: '¥180,000',
    image: 'https://images.unsplash.com/photo-1570488344390-4c9e3c0c1e3e?w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1570488344390-4c9e3c0c1e3e?w=800&q=80',
      'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=800&q=80',
    ],
    features: ['安全软包', '色彩鲜艳', '温和旋转', '亲子友好'],
  },
];