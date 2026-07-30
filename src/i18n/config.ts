export type Locale = 'zh' | 'en';

export const defaultLocale: Locale = 'zh';

export const locales: Locale[] = ['zh', 'en'];

export const localeNames: Record<Locale, string> = {
  zh: '中文',
  en: 'English',
};

export type TranslationKey = string;

let messages: Record<string, Record<string, string>> = {};

export async function loadMessages(locale: Locale) {
  if (messages[locale]) return messages[locale];
  const data = await import(`../messages/${locale}.json`);
  messages[locale] = data.default || data;
  return messages[locale];
}

export function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let result: unknown = obj;
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof result === 'string' ? result : path;
}

export function getStaticMessages(locale: Locale): Record<string, string> {
  const zhMessages = {
    'site.title': '星乐游乐设备',
    'site.subtitle': '全球领先的游乐设施制造商',
    'nav.home': '首页',
    'nav.products': '产品中心',
    'nav.about': '关于我们',
    'nav.news': '新闻中心',
    'nav.contact': '联系我们',
    'nav.cart': '询价车',
    'home.heroTitle': '全球领先的游乐设施制造商',
    'home.heroSubtitle': '专业设计、研发、生产各类游乐设施，为全球客户提供安全、创新、高品质的游乐体验',
    'home.heroCta': '查看产品',
    'home.heroContact': '联系我们',
    'home.hotProducts': '热门产品',
    'home.advantages': '企业优势',
    'home.cases': '合作案例',
    'home.projectsDone': '项目完成',
    'home.yearsExperience': '年行业经验',
    'home.countriesServed': '覆盖国家',
    'home.patents': '技术专利',
    'products.title': '产品中心',
    'products.inquiry': '立即询价',
    'products.addToCart': '加入询价车',
    'about.title': '关于我们',
    'about.intro': '公司介绍',
    'about.factory': '工厂展示',
    'about.certificates': '资质荣誉',
    'news.title': '新闻中心',
    'news.readMore': '阅读更多',
    'contact.title': '联系我们',
    'contact.submit': '发送留言',
    'contact.info': '联系方式',
    'cart.title': '询价车',
    'cart.empty': '询价车为空',
    'cart.inquiryNow': '提交询价',
    'common.loading': '加载中...',
    'common.learnMore': '了解更多',
    'common.viewAll': '查看全部',
    'common.backToHome': '返回首页',
  };
  const enMessages: Record<string, string> = {
    'site.title': 'StarJoy Amusement Rides',
    'site.subtitle': 'Global Leading Amusement Ride Manufacturer',
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.about': 'About Us',
    'nav.news': 'News',
    'nav.contact': 'Contact',
    'nav.cart': 'Inquiry Cart',
    'home.heroTitle': 'Global Leading Amusement Ride Manufacturer',
    'home.heroSubtitle': 'Professional design, R&D, and production of amusement rides. Providing safe, innovative, and high-quality experiences for global customers',
    'home.heroCta': 'View Products',
    'home.heroContact': 'Contact Us',
    'home.hotProducts': 'Hot Products',
    'home.advantages': 'Our Advantages',
    'home.cases': 'Case Studies',
    'home.projectsDone': 'Projects Completed',
    'home.yearsExperience': 'Years Experience',
    'home.countriesServed': 'Countries Served',
    'home.patents': 'Technology Patents',
    'products.title': 'Products',
    'products.inquiry': 'Inquire Now',
    'products.addToCart': 'Add to Inquiry Cart',
    'about.title': 'About Us',
    'about.intro': 'Company Introduction',
    'about.factory': 'Factory Tour',
    'about.certificates': 'Certifications',
    'news.title': 'News Center',
    'news.readMore': 'Read More',
    'contact.title': 'Contact Us',
    'contact.submit': 'Send Message',
    'contact.info': 'Contact Info',
    'cart.title': 'Inquiry Cart',
    'cart.empty': 'Your inquiry cart is empty',
    'cart.inquiryNow': 'Submit Inquiry',
    'common.loading': 'Loading...',
    'common.learnMore': 'Learn More',
    'common.viewAll': 'View All',
    'common.backToHome': 'Back to Home',
  };
  return locale === 'zh' ? zhMessages : enMessages;
}