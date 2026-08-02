/**
 * 应用支持的 locale 列表 — 单一数据源
 * middleware 和 i18n config 均从此文件导入，避免不同步
 */
export const SUPPORTED_LOCALES = ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'pt', 'ar', 'th'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'zh';

/**
 * 将前端 locale 格式转换为 API 使用的 locale 格式
 * 前端: 'zh', 'en', 'ja', 'ko' ...
 * API:  'zh_cn', 'en', 'ja', 'ko' ...
 */
export function toApiLocale(locale: string): string {
  return locale === 'zh' ? 'zh_cn' : locale;
}
