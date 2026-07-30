/**
 * 种子数据脚本
 * 为 NodeCoda 电商平台填充初始数据
 *
 * 运行方式: npx tsx scripts/seed.ts
 */
import { db, closeDb } from '../src/lib/db/db';
import {
  brands,
  categories,
  categoryDescriptions,
  products,
  productDescriptions,
  productCategories,
  productImages,
  customers,
  adminUsers,
  languages,
  currencies,
  countries,
  zones,
  settings,
  pages,
  pageDescriptions,
  shippingMethods,
  shippingMethodDescriptions,
  attributeGroups,
  attributeGroupDescriptions,
  attributes,
  attributeDescriptions,
  attributeValues,
  attributeValueDescriptions,
} from '../src/lib/db/schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 开始填充种子数据...\n');

  // 检查是否已有数据，避免重复插入
  const existingLanguages = await db.select({ id: languages.id }).from(languages).limit(1);
  if (existingLanguages.length > 0) {
    console.log('✅ 数据库已有数据，跳过种子填充');
    await closeDb();
    return;
  }

  // ============================================================
  // 1. 系统基础数据
  // ============================================================
  console.log('📦 创建系统基础数据...');

  // 语言
  await db.insert(languages).values([
    { name: '中文', code: 'zh_cn', image: '', sortOrder: 1, status: true },
    { name: 'English', code: 'en', image: '', sortOrder: 2, status: true },
  ]);

  // 货币
  await db.insert(currencies).values([
    { code: 'CNY', name: '人民币', symbol: '¥', rate: '1.0000', sortOrder: 1, status: true },
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: '7.2500', sortOrder: 2, status: true },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: '7.8500', sortOrder: 3, status: true },
  ]);

  // 国家/地区
  const [china] = await db.insert(countries).values({
    name: '中国',
    code: 'CN',
    status: true,
  }).returning();

  const [usa] = await db.insert(countries).values({
    name: 'United States',
    code: 'US',
    status: true,
  }).returning();

  // 省份/州
  await db.insert(zones).values([
    { countryId: china.id, name: '北京', code: 'BJ' },
    { countryId: china.id, name: '上海', code: 'SH' },
    { countryId: china.id, name: '广东', code: 'GD' },
    { countryId: usa.id, name: 'California', code: 'CA' },
    { countryId: usa.id, name: 'Texas', code: 'TX' },
  ]);

  // 系统设置
  await db.insert(settings).values([
    { key: 'store_name', value: 'NodeCoda 游乐设备' },
    { key: 'store_name_en', value: 'NodeCoda Amusement' },
    { key: 'store_email', value: 'info@nodecoda.com' },
    { key: 'store_phone', value: '+86-400-888-8888' },
    { key: 'store_address', value: '中国广东省广州市番禺区南村镇兴业大道88号' },
    { key: 'store_address_en', value: 'No.88 Xingye Avenue, Nancun Town, Panyu District, Guangzhou, Guangdong, China' },
    { key: 'currency', value: 'CNY' },
    { key: 'tax_rate', value: '0.13' },
    { key: 'order_auto_confirm', value: '1' },
    { key: 'order_auto_complete_days', value: '7' },
  ]);

  // ============================================================
  // 2. 品牌
  // ============================================================
  console.log('🏷️ 创建品牌...');

  const brandData = [
    { name: 'NodeCoda Classic', nameEn: 'NodeCoda Classic', description: '经典游乐设备系列，经久耐用', sortOrder: 1 },
    { name: 'NodeCoda Premium', nameEn: 'NodeCoda Premium', description: '高端定制游乐设备，匠心品质', sortOrder: 2 },
    { name: 'NodeCoda Kids', nameEn: 'NodeCoda Kids', description: '儿童专属游乐设备，安全第一', sortOrder: 3 },
    { name: 'NodeCoda Tech', nameEn: 'NodeCoda Tech', description: '科技互动游乐设备，引领未来', sortOrder: 4 },
  ];

  const createdBrands = [];
  for (const b of brandData) {
    const [brand] = await db.insert(brands).values({
      name: b.name,
      description: b.description,
      sortOrder: b.sortOrder,
      status: true,
    }).returning();
    createdBrands.push(brand);
  }

  // ============================================================
  // 3. 分类
  // ============================================================
  console.log('📂 创建分类...');

  // 一级分类
  const [catCarousel] = await db.insert(categories).values({ parentId: null, sortOrder: 1, status: true }).returning();
  const [catRoller] = await db.insert(categories).values({ parentId: null, sortOrder: 2, status: true }).returning();
  const [catBumper] = await db.insert(categories).values({ parentId: null, sortOrder: 3, status: true }).returning();
  const [catFerris] = await db.insert(categories).values({ parentId: null, sortOrder: 4, status: true }).returning();
  const [catWater] = await db.insert(categories).values({ parentId: null, sortOrder: 5, status: true }).returning();
  const [catKids] = await db.insert(categories).values({ parentId: null, sortOrder: 6, status: true }).returning();

  // 分类多语言描述
  await db.insert(categoryDescriptions).values([
    { categoryId: catCarousel.id, locale: 'zh_cn', name: '旋转木马', description: '经典浪漫的旋转木马系列' },
    { categoryId: catCarousel.id, locale: 'en', name: 'Carousels', description: 'Classic romantic carousel series' },
    { categoryId: catRoller.id, locale: 'zh_cn', name: '过山车', description: '刺激惊险的过山车系列' },
    { categoryId: catRoller.id, locale: 'en', name: 'Roller Coasters', description: 'Thrilling roller coaster series' },
    { categoryId: catBumper.id, locale: 'zh_cn', name: '碰碰车', description: '欢乐碰撞的碰碰车系列' },
    { categoryId: catBumper.id, locale: 'en', name: 'Bumper Cars', description: 'Fun bumper car series' },
    { categoryId: catFerris.id, locale: 'zh_cn', name: '摩天轮', description: '雄伟壮观的摩天轮系列' },
    { categoryId: catFerris.id, locale: 'en', name: 'Ferris Wheels', description: 'Magnificent ferris wheel series' },
    { categoryId: catWater.id, locale: 'zh_cn', name: '水上乐园', description: '清凉刺激的水上娱乐设备' },
    { categoryId: catWater.id, locale: 'en', name: 'Water Rides', description: 'Refreshing water amusement equipment' },
    { categoryId: catKids.id, locale: 'zh_cn', name: '儿童乐园', description: '安全有趣的儿童游乐设备' },
    { categoryId: catKids.id, locale: 'en', name: 'Kids Rides', description: 'Safe and fun children\'s rides' },
  ]);

  // ============================================================
  // 4. 产品
  // ============================================================
  console.log('🎠 创建产品...');

  const productData = [
    {
      sku: 'CAR-CL-001',
      brandId: createdBrands[0].id,
      price: '158000.00',
      costPrice: '98000.00',
      weight: 3500,
      quantity: 10,
      sortOrder: 1,
      categoryIds: [catCarousel.id],
      descriptions: {
        zh_cn: { name: '经典双 layer 旋转木马', description: '**经典双 layer 旋转木马**，采用优质钢材和环保工艺。\n\n- 双 layer 设计，可同时容纳 48 人\n- 手工雕刻的木质马匹，栩栩如生\n- LED 彩灯装饰，夜间绚丽夺目\n- 配备安全压杆和防滑踏板\n- 符合欧盟 CE 安全标准\n\n适用于：主题乐园、城市广场、商业综合体', metaTitle: '双 layer 旋转木马 - 经典游乐设备', metaDescription: '高品质双 layer 旋转木马，48座设计，LED彩灯装饰，CE安全认证', metaKeywords: '旋转木马,双 layer,游乐设备,主题乐园' },
        en: { name: 'Classic Double-Decker Carousel', description: '**Classic Double-Decker Carousel** crafted with premium steel and eco-friendly processes.\n\n- Double-decker design, capacity for 48 riders\n- Hand-carved wooden horses, lifelike details\n- LED decorative lighting, stunning at night\n- Safety bars and anti-slip platforms\n- CE safety certified\n\nIdeal for: theme parks, city squares, commercial complexes', metaTitle: 'Double-Decker Carousel - Classic Amusement Ride', metaDescription: 'High-quality double-decker carousel, 48 seats, LED lighting, CE certified', metaKeywords: 'carousel,double-decker,amusement ride,theme park' },
      },
      images: ['https://picsum.photos/seed/carousel1/800/600', 'https://picsum.photos/seed/carousel2/800/600'],
    },
    {
      sku: 'CAR-CL-002',
      brandId: createdBrands[1].id,
      price: '268000.00',
      costPrice: '168000.00',
      weight: 5200,
      quantity: 5,
      sortOrder: 2,
      categoryIds: [catCarousel.id],
      descriptions: {
        zh_cn: { name: '欧式豪华旋转木马', description: '**欧式豪华旋转木马**，融合巴洛克艺术风格与现代制造工艺。\n\n- 三层设计，可容纳 72 人\n- 手工金箔装饰，奢华典雅\n- 定制音乐系统，环绕立体声\n- 自动升降马匹，独特体验\n- 可定制主题色彩\n\n适用于：高端主题乐园、度假区、豪华商场' },
        en: { name: 'European Luxury Carousel', description: '**European Luxury Carousel** blending Baroque artistry with modern manufacturing.\n\n- Three-tier design, capacity for 72 riders\n- Hand-applied gold leaf decoration\n- Custom music system with surround sound\n- Auto-rising horses for unique experience\n- Customizable theme colors\n\nIdeal for: premium theme parks, resorts, luxury malls' },
      },
      images: ['https://picsum.photos/seed/carousel3/800/600', 'https://picsum.photos/seed/carousel4/800/600'],
    },
    {
      sku: 'ROL-PR-001',
      brandId: createdBrands[1].id,
      price: '1280000.00',
      costPrice: '780000.00',
      weight: 25000,
      quantity: 2,
      sortOrder: 3,
      categoryIds: [catRoller.id],
      descriptions: {
        zh_cn: { name: '悬挂式过山车', description: '**悬挂式过山车**，体验失重与速度的极致快感。\n\n- 轨道长度 800 米，最高点 35 米\n- 最高时速 80 km/h\n- 4 人座悬挂车厢 × 8 组\n- 双提升系统，安全可靠\n- 智能控制系统，实时监控\n\n适用于：大型主题乐园、游乐园' },
        en: { name: 'Suspended Roller Coaster', description: '**Suspended Roller Coaster** delivering the ultimate thrill of weightlessness and speed.\n\n- Track length: 800m, max height: 35m\n- Max speed: 80 km/h\n- 4-seat suspended cars × 8 trains\n- Dual lift system for safety\n- Smart control system with real-time monitoring\n\nIdeal for: large theme parks, amusement parks' },
      },
      images: ['https://picsum.photos/seed/coaster1/800/600', 'https://picsum.photos/seed/coaster2/800/600'],
    },
    {
      sku: 'ROL-PR-002',
      brandId: createdBrands[3].id,
      price: '980000.00',
      costPrice: '580000.00',
      weight: 18000,
      quantity: 3,
      sortOrder: 4,
      categoryIds: [catRoller.id],
      descriptions: {
        zh_cn: { name: 'VR 沉浸式过山车', description: '**VR 沉浸式过山车**，结合虚拟现实技术，打造前所未有的沉浸体验。\n\n- 轨道长度 500 米\n- 配备 VR 头显，多种场景切换\n- 4D 动感座椅，风效/水效\n- 单人座 × 20 组\n- 可定制 VR 内容\n\n适用于：科技主题乐园、未来体验馆' },
        en: { name: 'VR Immersive Coaster', description: '**VR Immersive Coaster** combining virtual reality with physical thrills for unprecedented immersion.\n\n- Track length: 500m\n- VR headset with multiple scene options\n- 4D motion seats with wind/water effects\n- Single seats × 20 units\n- Customizable VR content\n\nIdeal for: tech-themed parks, future experience centers' },
      },
      images: ['https://picsum.photos/seed/coaster3/800/600', 'https://picsum.photos/seed/coaster4/800/600'],
    },
    {
      sku: 'BMP-CL-001',
      brandId: createdBrands[0].id,
      price: '88000.00',
      costPrice: '52000.00',
      weight: 800,
      quantity: 20,
      sortOrder: 5,
      categoryIds: [catBumper.id],
      descriptions: {
        zh_cn: { name: '经典碰碰车', description: '**经典碰碰车**，欢乐碰撞，安全无忧。\n\n- 优质橡胶防撞圈\n- 电力驱动，静音环保\n- 遥控限速功能\n- 可同时运行 20 台\n- 场地面积：200㎡\n\n适用于：游乐园、室内娱乐中心、嘉年华' },
        en: { name: 'Classic Bumper Cars', description: '**Classic Bumper Cars** for joyful collisions, safe and worry-free.\n\n- Premium rubber bumper rings\n- Electric drive, quiet and eco-friendly\n- Remote speed limiting\n- 20 cars can run simultaneously\n- Area required: 200㎡\n\nIdeal for: amusement parks, indoor entertainment centers, carnivals' },
      },
      images: ['https://picsum.photos/seed/bumper1/800/600', 'https://picsum.photos/seed/bumper2/800/600'],
    },
    {
      sku: 'FER-PR-001',
      brandId: createdBrands[1].id,
      price: '3580000.00',
      costPrice: '2180000.00',
      weight: 45000,
      quantity: 1,
      sortOrder: 6,
      categoryIds: [catFerris.id],
      descriptions: {
        zh_cn: { name: '全景摩天轮', description: '**全景摩天轮**，城市地标级游乐设施。\n\n- 总高度 88 米\n- 36 个全景轿厢，每厢可乘坐 6 人\n- 全玻璃轿厢，360° 观景\n- 夜间 LED 灯光秀\n- 轿厢空调 + 蓝牙音箱\n\n适用于：城市地标、主题乐园、旅游度假区' },
        en: { name: 'Panoramic Ferris Wheel', description: '**Panoramic Ferris Wheel** - a landmark-level amusement attraction.\n\n- Total height: 88m\n- 36 panoramic cabins, 6 passengers each\n- Full-glass cabins, 360° views\n- Night LED light show\n- Air conditioning + Bluetooth speakers\n\nIdeal for: city landmarks, theme parks, tourist resorts' },
      },
      images: ['https://picsum.photos/seed/ferris1/800/600', 'https://picsum.photos/seed/ferris2/800/600'],
    },
    {
      sku: 'WTR-PR-001',
      brandId: createdBrands[3].id,
      price: '680000.00',
      costPrice: '420000.00',
      weight: 12000,
      quantity: 3,
      sortOrder: 7,
      categoryIds: [catWater.id],
      descriptions: {
        zh_cn: { name: '巨型水滑梯', description: '**巨型水滑梯**，水上乐园的明星项目。\n\n- 滑道长度 120 米\n- 高度落差 18 米\n- 双人皮筏设计\n- 玻璃钢材质，光滑安全\n- 自动水循环系统\n\n适用于：水上乐园、水上度假村、温泉水世界' },
        en: { name: 'Giant Water Slide', description: '**Giant Water Slide** - the star attraction of any water park.\n\n- Slide length: 120m\n- Height drop: 18m\n- Double-person raft design\n- Fiberglass construction, smooth and safe\n- Automatic water circulation system\n\nIdeal for: water parks, water resorts, spa water worlds' },
      },
      images: ['https://picsum.photos/seed/water1/800/600', 'https://picsum.photos/seed/water2/800/600'],
    },
    {
      sku: 'KID-CL-001',
      brandId: createdBrands[2].id,
      price: '38000.00',
      costPrice: '22000.00',
      weight: 500,
      quantity: 30,
      sortOrder: 8,
      categoryIds: [catKids.id],
      descriptions: {
        zh_cn: { name: '儿童小火车', description: '**儿童小火车**，安全有趣的亲子游乐项目。\n\n- 轨道长度 50-100 米可定制\n- 火车头仿真造型，声光效果\n- 速度 3-5 km/h，安全低速\n- 每节车厢 2 座，可挂 4 节\n- 地面铺设或高架轨道可选\n\n适用于：儿童乐园、商场、小区、公园' },
        en: { name: 'Kids Train Ride', description: '**Kids Train Ride** - a safe and fun parent-child amusement attraction.\n\n- Track length: 50-100m customizable\n- Realistic locomotive design with sound & light effects\n- Speed: 3-5 km/h, safe and slow\n- 2 seats per carriage, up to 4 carriages\n- Ground or elevated track options\n\nIdeal for: kids parks, shopping malls, communities, parks' },
      },
      images: ['https://picsum.photos/seed/kidtrain1/800/600', 'https://picsum.photos/seed/kidtrain2/800/600'],
    },
    {
      sku: 'KID-CL-002',
      brandId: createdBrands[2].id,
      price: '58000.00',
      costPrice: '35000.00',
      weight: 1200,
      quantity: 15,
      sortOrder: 9,
      categoryIds: [catKids.id],
      descriptions: {
        zh_cn: { name: '儿童跳楼机', description: '**儿童跳楼机**，专为儿童设计的温和失重体验。\n\n- 升降高度 5 米\n- 速度缓慢，适合儿童\n- 安全压杆 + 安全带双重保护\n- 绚丽灯光 + 语音互动\n- 占地仅 20㎡\n\n适用于：儿童乐园、室内游乐场' },
        en: { name: 'Kids Drop Tower', description: '**Kids Drop Tower** - a gentle weightlessness experience designed for children.\n\n- Lift height: 5m\n- Slow speed, suitable for children\n- Double protection: safety bar + harness\n- Colorful lights + voice interaction\n- Compact footprint: only 20㎡\n\nIdeal for: kids parks, indoor playgrounds' },
      },
      images: ['https://picsum.photos/seed/droptower1/800/600', 'https://picsum.photos/seed/droptower2/800/600'],
    },
  ];

  for (const p of productData) {
    const [product] = await db.insert(products).values({
      sku: p.sku,
      brandId: p.brandId,
      price: p.price,
      costPrice: p.costPrice,
      weight: p.weight,
      quantity: p.quantity,
      sortOrder: p.sortOrder,
      status: true,
    }).returning();

    // 产品描述
    for (const [locale, desc] of Object.entries(p.descriptions)) {
      await db.insert(productDescriptions).values({
        productId: product.id,
        locale,
        name: desc.name,
        description: desc.description,
        metaTitle: desc.metaTitle || null,
        metaDescription: desc.metaDescription || null,
        metaKeywords: desc.metaKeywords || null,
      });
    }

    // 产品分类关联
    for (const categoryId of p.categoryIds) {
      await db.insert(productCategories).values({
        productId: product.id,
        categoryId,
      });
    }

    // 产品图片
    for (let i = 0; i < p.images.length; i++) {
      await db.insert(productImages).values({
        productId: product.id,
        image: p.images[i],
        sortOrder: i,
      });
    }
  }

  // ============================================================
  // 5. 管理员账号
  // ============================================================
  console.log('👤 创建管理员账号...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  await db.insert(adminUsers).values({
    name: '管理员',
    email: 'admin@nodecoda.com',
    password: adminPassword,
    status: true,
  });

  // ============================================================
  // 6. 测试客户账号
  // ============================================================
  console.log('👥 创建测试客户账号...');

  const customerPassword = await bcrypt.hash('test123456', 10);
  await db.insert(customers).values({
    email: 'customer@nodecoda.com',
    password: customerPassword,
    name: '测试客户',
    status: true,
    newsletter: true,
  });

  console.log('\n📰 创建文章/新闻...');

  const [article1] = await db.insert(pages).values({
    status: true,
    sortOrder: 1,
  }).returning();

  const [article2] = await db.insert(pages).values({
    status: true,
    sortOrder: 2,
  }).returning();

  const [article3] = await db.insert(pages).values({
    status: true,
    sortOrder: 3,
  }).returning();

  await db.insert(pageDescriptions).values([
    {
      pageId: article1.id,
      locale: 'zh_cn',
      title: 'NodeCoda 全新大型游乐设备系列正式发布',
      content: `## 全新系列发布

经过18个月的潜心研发与严格测试，NodeCoda 正式推出「星际探索」系列大型游乐设备。该系列以太空探索为主题，融合了最先进的机械传动技术与沉浸式多媒体互动体验。

### 核心亮点

**安全第一**：全系列产品通过欧盟 CE 认证、美国 ASTM 认证及中国特种设备安全认证，安全标准达到行业最高水平。

**创新设计**：采用模块化设计理念，可根据场地条件灵活组合，最大程度提升空间利用率与游客体验。

**智能运维**：内置 IoT 传感器系统，实时监控设备运行状态，AI 预测性维护可降低 35% 的意外停机时间。

### 市场前景

据行业分析报告显示，全球主题乐园市场预计在 2025 年达到 800 亿美元规模。NodeCoda 凭借技术创新与品质保证，已与来自 12 个国家的 20 余家主题乐园运营商达成合作意向。

欢迎联系我们获取详细产品资料与报价。`,
      metaTitle: 'NodeCoda 大型游乐设备新系列发布',
      metaDescription: 'NodeCoda 发布「星际探索」系列大型游乐设备，通过国际安全认证，面向全球市场推出。',
    },
    {
      pageId: article1.id,
      locale: 'en',
      title: 'NodeCoda Launches New Premium Amusement Ride Series',
      content: `## New Series Launch

After 18 months of intensive R&D and rigorous testing, NodeCoda officially launches the "Star Explorer" series of large amusement rides. Inspired by space exploration, this series combines cutting-edge mechanical transmission technology with immersive multimedia interactive experiences.

### Key Highlights

**Safety First**: All products have passed EU CE certification, US ASTM certification, and China Special Equipment Safety certification, meeting the highest industry standards.

**Innovative Design**: Modular design allows flexible combination based on site conditions, maximizing space utilization and visitor experience.

**Smart Operations**: Built-in IoT sensor system monitors equipment status in real-time, with AI predictive maintenance reducing unplanned downtime by 35%.

### Market Outlook

According to industry analysis, the global theme park market is expected to reach $80 billion by 2025. Through technological innovation and quality assurance, NodeCoda has established cooperation意向 with over 20 theme park operators across 12 countries.

Contact us for detailed product information and pricing.`,
      metaTitle: 'NodeCoda Launches New Amusement Ride Series',
      metaDescription: 'NodeCoda launches "Star Explorer" series amusement rides with international safety certifications.',
    },
    {
      pageId: article2.id,
      locale: 'zh_cn',
      title: '2024 国际游乐设备展览会圆满落幕，NodeCoda 收获颇丰',
      content: `## 展会回顾

2024 国际游乐设备展览会（IAAPA Expo 2024）于上周在深圳国际会展中心圆满落幕。NodeCoda 以「智造欢乐，连接世界」为主题，携 8 款明星产品精彩亮相。

### 展会亮点

**现场签约**：展会期间，NodeCoda 与来自东南亚、中东、南美等地区的客户现场签约 12 个项目，签约总金额突破 5000 万元人民币。

**新品亮相**：两款新品「云端漫步」摩天轮与「极速光轮」过山车首次公开亮相，获得行业专家与客户的高度评价。

**行业交流**：NodeCoda 技术团队在展会论坛上分享了「AI 在游乐设备安全监控中的应用」主题演讲，引起广泛关注。

### 未来展望

NodeCoda 将继续加大研发投入，以技术创新驱动产品升级，为全球客户提供更安全、更智能、更有趣的游乐体验。`,
      metaTitle: '2024 国际游乐设备展览会 NodeCoda 签约 5000 万',
      metaDescription: 'NodeCoda 在 2024 IAAPA 展会现场签约 12 个项目，签约金额突破 5000 万元。',
    },
    {
      pageId: article2.id,
      locale: 'en',
      title: 'IAAPA Expo 2024 Concludes Successfully for NodeCoda',
      content: `## Exhibition Review

The 2024 IAAPA Expo concluded successfully at the Shenzhen International Convention and Exhibition Center. NodeCoda presented 8 flagship products under the theme "Engineering Joy, Connecting the World."

### Exhibition Highlights

**On-site Signings**: During the exhibition, NodeCoda signed 12 projects with clients from Southeast Asia, the Middle East, and South America, with total contract value exceeding 50 million RMB.

**New Product Launch**: Two new products — "Cloud Walk" Ferris wheel and "Speed Light" roller coaster — made their public debut, receiving high praise from industry experts and clients.

**Industry Exchange**: NodeCoda's technical team delivered a keynote on "AI Applications in Amusement Ride Safety Monitoring" at the exhibition forum, attracting widespread attention.

### Future Outlook

NodeCoda will continue to increase R&D investment, driving product upgrades through technological innovation to provide safer, smarter, and more enjoyable experiences for global customers.`,
      metaTitle: 'IAAPA Expo 2024: NodeCoda Signs 50M+ RMB Contracts',
      metaDescription: 'NodeCoda signs 12 projects at IAAPA Expo 2024 with total contract value exceeding 50 million RMB.',
    },
    {
      pageId: article3.id,
      locale: 'zh_cn',
      title: 'NodeCoda 荣获 2024 年度游乐设备行业创新大奖',
      content: `## 荣誉时刻

近日，在由中国游乐设备行业协会主办的 2024 年度行业评选中，NodeCoda 凭借「星际探索」系列大型游乐设备，从 200 余家参选企业中脱颖而出，荣获「年度创新大奖」。

### 评选标准

本次评选从技术创新、设计美学、安全性能、市场表现四个维度进行综合评估。NodeCoda 在各项指标中均获得评委高度认可。

### 技术突破

**智能安全系统**：自主研发的多层安全监控系统，可实现 7×24 小时不间断运行状态监测，故障预警准确率达 99.7%。

**沉浸式体验**：融合 AR/VR 技术与实体设备，打造虚实结合的沉浸式游乐体验，游客满意度提升 40%。

**绿色节能**：采用新型节能电机与能量回收系统，单台设备能耗降低 25%，年减碳量相当于种植 500 棵树木。

### 感恩致谢

这一荣誉属于 NodeCoda 全体研发团队，也感谢全球客户与合作伙伴的信任与支持。我们将继续努力，为行业带来更多创新产品。`,
      metaTitle: 'NodeCoda 荣获游乐设备行业年度创新大奖',
      metaDescription: 'NodeCoda 凭借「星际探索」系列荣获 2024 年度游乐设备行业创新大奖。',
    },
    {
      pageId: article3.id,
      locale: 'en',
      title: 'NodeCoda Wins 2024 Amusement Ride Industry Innovation Award',
      content: `## Moment of Honor

At the 2024 Annual Industry Awards hosted by the China Amusement Ride Industry Association, NodeCoda stood out from over 200 participating companies to win the "Annual Innovation Award" for its "Star Explorer" series.

### Evaluation Criteria

The evaluation covered four dimensions: technological innovation, design aesthetics, safety performance, and market performance. NodeCoda received high marks from the judging panel across all indicators.

### Technological Breakthroughs

**Smart Safety System**: Self-developed multi-layer safety monitoring system enables 24/7 continuous operation monitoring with 99.7% fault prediction accuracy.

**Immersive Experience**: Integration of AR/VR technology with physical equipment creates immersive experiences, increasing visitor satisfaction by 40%.

**Green Energy**: New energy-efficient motors and energy recovery systems reduce per-unit energy consumption by 25%, with annual carbon reduction equivalent to planting 500 trees.

### Gratitude

This honor belongs to the entire NodeCoda R&D team, and we thank our global customers and partners for their trust and support. We will continue to innovate and bring more groundbreaking products to the industry.`,
      metaTitle: 'NodeCoda Wins Amusement Ride Industry Innovation Award 2024',
      metaDescription: 'NodeCoda wins the 2024 Annual Innovation Award for its "Star Explorer" series.',
    },
  ]);

  console.log('\n🚚 创建配送方式...');

  const [standardShipping] = await db.insert(shippingMethods).values({
    code: 'standard',
    baseFee: '30.00',
    freeShippingThreshold: '500.00',
    estimatedDays: '5-7',
    sortOrder: 1,
    status: true,
  }).returning();

  const [expressShipping] = await db.insert(shippingMethods).values({
    code: 'express',
    baseFee: '80.00',
    freeShippingThreshold: '1000.00',
    estimatedDays: '2-3',
    sortOrder: 2,
    status: true,
  }).returning();

  const [economyShipping] = await db.insert(shippingMethods).values({
    code: 'economy',
    baseFee: '15.00',
    freeShippingThreshold: '300.00',
    estimatedDays: '7-14',
    sortOrder: 3,
    status: true,
  }).returning();

  await db.insert(shippingMethodDescriptions).values([
    { shippingMethodId: standardShipping.id, locale: 'zh_cn', name: '标准配送', description: '5-7 个工作日送达，满 ¥500 免运费' },
    { shippingMethodId: standardShipping.id, locale: 'en', name: 'Standard Shipping', description: '5-7 business days, free shipping over ¥500' },
    { shippingMethodId: expressShipping.id, locale: 'zh_cn', name: '快递配送', description: '2-3 个工作日加急送达，满 ¥1000 免运费' },
    { shippingMethodId: expressShipping.id, locale: 'en', name: 'Express Shipping', description: '2-3 business days express, free shipping over ¥1000' },
    { shippingMethodId: economyShipping.id, locale: 'zh_cn', name: '经济配送', description: '7-14 个工作日送达，满 ¥300 免运费' },
    { shippingMethodId: economyShipping.id, locale: 'en', name: 'Economy Shipping', description: '7-14 business days, free shipping over ¥300' },
  ]);

  console.log('📋 管理员账号: admin@nodecoda.com / admin123');
  console.log('📋 客户账号: customer@nodecoda.com / test123456');
  console.log(`📦 共创建: ${productData.length} 个产品, ${brandData.length} 个品牌, 6 个分类, 3 篇文章, 3 种配送方式`);

  await closeDb();
}

seed().catch((err) => {
  console.error('❌ 种子数据填充失败:', err);
  process.exit(1);
});