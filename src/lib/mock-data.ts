export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  categoryName: string;
  brand: string;
  brandName: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  inStock: boolean;
  isNew: boolean;
  isSale: boolean;
  sku: string;
  specs: { label: string; value: string }[];
  options?: { name: string; values: string[] }[];
}

export const categories = [
  { id: 'electronics', name: '电子产品', nameEn: 'Electronics', icon: '📱', count: 48 },
  { id: 'clothing', name: '服装鞋帽', nameEn: 'Clothing', icon: '👕', count: 156 },
  { id: 'home', name: '家居生活', nameEn: 'Home & Living', icon: '🏠', count: 89 },
  { id: 'sports', name: '运动户外', nameEn: 'Sports & Outdoors', icon: '⚽', count: 67 },
  { id: 'beauty', name: '美妆个护', nameEn: 'Beauty & Personal Care', icon: '💄', count: 73 },
  { id: 'toys', name: '玩具游戏', nameEn: 'Toys & Games', icon: '🧸', count: 42 },
  { id: 'books', name: '图书文具', nameEn: 'Books & Stationery', icon: '📚', count: 34 },
  { id: 'food', name: '食品饮料', nameEn: 'Food & Beverages', icon: '🍎', count: 55 },
];

export const brands = [
  { id: 'nike', name: 'Nike', nameEn: 'Nike', logo: '/brands/nike.svg', productCount: 128 },
  { id: 'apple', name: 'Apple', nameEn: 'Apple', logo: '/brands/apple.svg', productCount: 96 },
  { id: 'samsung', name: 'Samsung', nameEn: 'Samsung', logo: '/brands/samsung.svg', productCount: 85 },
  { id: 'adidas', name: 'Adidas', nameEn: 'Adidas', logo: '/brands/adidas.svg', productCount: 112 },
  { id: 'sony', name: 'Sony', nameEn: 'Sony', logo: '/brands/sony.svg', productCount: 64 },
  { id: 'xiaomi', name: '小米', nameEn: 'Xiaomi', logo: '/brands/xiaomi.svg', productCount: 78 },
  { id: 'huawei', name: '华为', nameEn: 'Huawei', logo: '/brands/huawei.svg', productCount: 52 },
  { id: 'lg', name: 'LG', nameEn: 'LG', logo: '/brands/lg.svg', productCount: 43 },
];

export const products: Product[] = [
  {
    id: 1, name: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max',
    description: '搭载 A17 Pro 芯片，钛金属设计，4800 万像素主摄系统，支持 USB-C 接口。强悍的芯片为各种重度使用场景和游戏带来前所未有的表现力。',
    price: 8999, originalPrice: 9999,
    image: 'https://picsum.photos/seed/iphone15/600/600', images: ['https://picsum.photos/seed/iphone15/600/600', 'https://picsum.photos/seed/iphone15b/600/600'],
    category: 'electronics', categoryName: '电子产品', brand: 'apple', brandName: 'Apple',
    rating: 4.8, reviewCount: 2341, soldCount: 15678, inStock: true, isNew: true, isSale: true,
    sku: 'IP15PM-256-BK', specs: [
      { label: '处理器', value: 'A17 Pro' }, { label: '屏幕尺寸', value: '6.7英寸' },
      { label: '存储容量', value: '256GB' }, { label: '颜色', value: '黑色钛金属' },
    ], options: [{ name: '颜色', values: ['黑色', '白色', '蓝色', '金色'] }, { name: '容量', values: ['256GB', '512GB', '1TB'] }],
  },
  {
    id: 2, name: 'Samsung Galaxy S24 Ultra', slug: 'samsung-galaxy-s24-ultra',
    description: '搭载 Galaxy AI 智能助手，钛金属框架，2亿像素摄像头，内置 S Pen。AI 智能体验与强悍硬件的完美结合。',
    price: 7999, originalPrice: 8999,
    image: 'https://picsum.photos/seed/s24ultra/600/600', images: ['https://picsum.photos/seed/s24ultra/600/600'],
    category: 'electronics', categoryName: '电子产品', brand: 'samsung', brandName: 'Samsung',
    rating: 4.7, reviewCount: 1892, soldCount: 12340, inStock: true, isNew: true, isSale: false,
    sku: 'S24U-256-GR', specs: [
      { label: '处理器', value: 'Snapdragon 8 Gen 3' }, { label: '屏幕尺寸', value: '6.8英寸' },
      { label: '存储容量', value: '256GB' }, { label: '摄像头', value: '2亿像素' },
    ], options: [{ name: '颜色', values: ['灰色', '黑色', '紫色', '黄色'] }],
  },
  {
    id: 3, name: 'Nike Air Max 270', slug: 'nike-air-max-270',
    description: 'Nike Air Max 270 男子运动鞋，采用大型 Air 气垫，提供卓越缓震性能。时尚设计，适合日常穿搭和运动休闲。',
    price: 1299, originalPrice: 1599,
    image: 'https://picsum.photos/seed/airmax270/600/600', images: ['https://picsum.photos/seed/airmax270/600/600'],
    category: 'sports', categoryName: '运动户外', brand: 'nike', brandName: 'Nike',
    rating: 4.6, reviewCount: 3241, soldCount: 28901, inStock: true, isNew: false, isSale: true,
    sku: 'AM270-WH-BK', specs: [
      { label: '鞋面材质', value: '网面/合成材料' }, { label: '鞋底材质', value: '橡胶' },
      { label: '闭合方式', value: '系带' }, { label: '适用场景', value: '运动/休闲' },
    ],
  },
  {
    id: 4, name: 'Sony WH-1000XM5', slug: 'sony-wh-1000xm5',
    description: '业界领先的降噪技术，30小时超长续航，Hi-Res高解析度音频。自适应降噪，随时随地享受纯净音乐。',
    price: 2499, originalPrice: 2999,
    image: 'https://picsum.photos/seed/sonyxm5/600/600', images: ['https://picsum.photos/seed/sonyxm5/600/600'],
    category: 'electronics', categoryName: '电子产品', brand: 'sony', brandName: 'Sony',
    rating: 4.9, reviewCount: 4567, soldCount: 34567, inStock: true, isNew: false, isSale: true,
    sku: 'WH1000XM5-BK', specs: [
      { label: '降噪', value: '自适应降噪' }, { label: '续航', value: '30小时' },
      { label: '驱动单元', value: '30mm' }, { label: '重量', value: '250g' },
    ],
  },
  {
    id: 5, name: 'Adidas Ultraboost Light', slug: 'adidas-ultraboost-light',
    description: '全新 Ultraboost Light 跑鞋，搭载革命性 Light BOOST 中底，比传统 BOOST 更轻更弹。为跑者带来前所未有的舒适体验。',
    price: 1499, originalPrice: 1799,
    image: 'https://picsum.photos/seed/ultraboost/600/600', images: ['https://picsum.photos/seed/ultraboost/600/600'],
    category: 'sports', categoryName: '运动户外', brand: 'adidas', brandName: 'Adidas',
    rating: 4.7, reviewCount: 2123, soldCount: 18765, inStock: true, isNew: true, isSale: false,
    sku: 'UBLIGHT-WH-GR', specs: [
      { label: '鞋面材质', value: 'Primeknit+' }, { label: '中底科技', value: 'Light BOOST' },
      { label: '外底', value: 'Continental™橡胶' }, { label: '重量', value: '约280g' },
    ],
  },
  {
    id: 6, name: 'Xiaomi 14 Pro', slug: 'xiaomi-14-pro',
    description: '徕卡光学 Summilux 镜头，骁龙8 Gen 3处理器，120W超级快充。专业影像旗舰，记录每一个精彩瞬间。',
    price: 4999, originalPrice: 5299,
    image: 'https://picsum.photos/seed/xiaomi14/600/600', images: ['https://picsum.photos/seed/xiaomi14/600/600'],
    category: 'electronics', categoryName: '电子产品', brand: 'xiaomi', brandName: 'Xiaomi',
    rating: 4.6, reviewCount: 3876, soldCount: 25678, inStock: true, isNew: true, isSale: true,
    sku: 'MI14P-256-BK', specs: [
      { label: '处理器', value: 'Snapdragon 8 Gen 3' }, { label: '屏幕', value: '6.73英寸 AMOLED' },
      { label: '充电', value: '120W有线/50W无线' }, { label: '相机', value: '徕卡三摄' },
    ],
  },
  {
    id: 7, name: 'Huawei Mate 60 Pro', slug: 'huawei-mate-60-pro',
    description: '搭载麒麟9000S芯片，卫星通话功能，XMAGE影像系统。国产旗舰的巅峰之作，科技与美学的完美融合。',
    price: 6999, originalPrice: 7999,
    image: 'https://picsum.photos/seed/mate60/600/600', images: ['https://picsum.photos/seed/mate60/600/600'],
    category: 'electronics', categoryName: '电子产品', brand: 'huawei', brandName: 'Huawei',
    rating: 4.8, reviewCount: 5432, soldCount: 18900, inStock: true, isNew: false, isSale: true,
    sku: 'M60P-256-BK', specs: [
      { label: '处理器', value: '麒麟9000S' }, { label: '屏幕', value: '6.82英寸 OLED' },
      { label: '特色功能', value: '卫星通话' }, { label: '相机', value: 'XMAGE 三摄' },
    ],
  },
  {
    id: 8, name: 'LG UltraGear 27GP950', slug: 'lg-ultragear-27gp950',
    description: '27英寸 4K Nano IPS 电竞显示器，160Hz刷新率，1ms响应时间。支持HDMI 2.1，完美适配PS5/Xbox Series X。',
    price: 4999, originalPrice: 5999,
    image: 'https://picsum.photos/seed/lgmonitor/600/600', images: ['https://picsum.photos/seed/lgmonitor/600/600'],
    category: 'electronics', categoryName: '电子产品', brand: 'lg', brandName: 'LG',
    rating: 4.7, reviewCount: 1567, soldCount: 8934, inStock: true, isNew: false, isSale: false,
    sku: '27GP950-BK', specs: [
      { label: '尺寸', value: '27英寸' }, { label: '分辨率', value: '4K UHD (3840x2160)' },
      { label: '刷新率', value: '160Hz' }, { label: '面板类型', value: 'Nano IPS' },
    ],
  },
  {
    id: 9, name: 'Nike Dri-FIT 运动T恤', slug: 'nike-dri-fit-tee',
    description: 'Nike Dri-FIT 技术面料，排汗速干，轻盈透气。经典版型设计，适合日常运动及休闲穿搭。',
    price: 299, originalPrice: 399,
    image: 'https://picsum.photos/seed/nikete/600/600', images: ['https://picsum.photos/seed/nikete/600/600'],
    category: 'clothing', categoryName: '服装鞋帽', brand: 'nike', brandName: 'Nike',
    rating: 4.5, reviewCount: 6789, soldCount: 45678, inStock: true, isNew: false, isSale: true,
    sku: 'DRIFIT-TE-WH', specs: [
      { label: '面料', value: 'Dri-FIT 100%聚酯纤维' }, { label: '版型', value: '标准' },
      { label: '适用场景', value: '运动/休闲' }, { label: '季节', value: '四季通用' },
    ],
  },
  {
    id: 10, name: 'Samsung 990 Pro 2TB', slug: 'samsung-990-pro-2tb',
    description: '三星 V-NAND 技术，PCIe 4.0 NVMe SSD，顺序读取速度高达7450MB/s。为游戏玩家和创作者提供极致存储性能。',
    price: 1999, originalPrice: 2299,
    image: 'https://picsum.photos/seed/ssd990/600/600', images: ['https://picsum.photos/seed/ssd990/600/600'],
    category: 'electronics', categoryName: '电子产品', brand: 'samsung', brandName: 'Samsung',
    rating: 4.9, reviewCount: 2345, soldCount: 12345, inStock: true, isNew: false, isSale: false,
    sku: '990PRO-2TB', specs: [
      { label: '容量', value: '2TB' }, { label: '接口', value: 'PCIe 4.0 NVMe' },
      { label: '读取速度', value: '7,450 MB/s' }, { label: '写入速度', value: '6,900 MB/s' },
    ],
  },
  {
    id: 11, name: 'Adidas 3-Stripes 运动裤', slug: 'adidas-3-stripes-pants',
    description: '经典三条纹运动裤，柔软棉质面料，罗纹裤脚设计。经典百搭，适合日常运动和休闲穿搭。',
    price: 459, originalPrice: 599,
    image: 'https://picsum.photos/seed/adidaspants/600/600', images: ['https://picsum.photos/seed/adidaspants/600/600'],
    category: 'clothing', categoryName: '服装鞋帽', brand: 'adidas', brandName: 'Adidas',
    rating: 4.4, reviewCount: 4567, soldCount: 34567, inStock: true, isNew: false, isSale: true,
    sku: '3STRIPES-BK-L', specs: [
      { label: '面料', value: '70%棉 30%聚酯纤维' }, { label: '版型', value: '宽松' },
      { label: '裤脚', value: '罗纹收口' }, { label: '适用场景', value: '运动/休闲' },
    ],
  },
  {
    id: 12, name: 'Sony PlayStation 5 Slim', slug: 'sony-ps5-slim',
    description: '更轻更薄的 PS5 主机，搭载定制 SSD 和 DualSense 无线控制器。支持 4K 120Hz 游戏体验，光线追踪技术。',
    price: 3999, originalPrice: 4299,
    image: 'https://picsum.photos/seed/ps5/600/600', images: ['https://picsum.photos/seed/ps5/600/600'],
    category: 'electronics', categoryName: '电子产品', brand: 'sony', brandName: 'Sony',
    rating: 4.9, reviewCount: 8901, soldCount: 56789, inStock: false, isNew: true, isSale: true,
    sku: 'PS5-SLIM-DIG', specs: [
      { label: '存储', value: '1TB SSD' }, { label: '分辨率', value: '4K/120Hz' },
      { label: '光驱', value: '数字版' }, { label: '包含', value: 'DualSense×1' },
    ],
  },
];

export function getProductById(id: number): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return category ? products.filter((p) => p.category === category) : products;
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.isNew || p.isSale).slice(0, 8);
}

export function getProductsBySearch(query: string): Product[] {
  const q = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.brandName.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q)
  );
}