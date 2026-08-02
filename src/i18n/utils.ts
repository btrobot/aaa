/**
 * 国际化工具函数
 */

/**
 * 将前端 locale 代码转换为 API 查询使用的 locale 格式
 * 前端: 'zh' → API: 'zh_cn'
 * 前端: 'en' → API: 'en'
 * 其他: 透传
 */
export function toApiLocale(locale: string): string {
  return locale === 'zh' ? 'zh_cn' : locale === 'en' ? 'en' : locale;
}

/**
 * 获取 locale 对应的前端路径前缀
 */
export function toLocaleParam(locale: string): string {
  return locale === 'zh_cn' ? 'zh' : locale === 'en' ? 'en' : locale;
}