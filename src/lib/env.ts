/**
 * 环境变量校验 - 在应用启动时检查关键配置
 * 防止因缺少环境变量导致的运行时静默失败
 */

export interface EnvSpec {
  key: string;
  description: string;
  required: boolean;
  default?: string;
}

export const REQUIRED_ENV: EnvSpec[] = [
  { key: 'JWT_SECRET', description: 'JWT 签名密钥（生产环境必需）', required: process.env.NODE_ENV === 'production' },
  { key: 'PGDATABASE_URL', description: 'PostgreSQL 连接字符串', required: false, default: 'localhost:5432' },
  { key: 'COZE_PROJECT_ENV', description: '运行环境标识', required: false, default: 'DEV' },
  { key: 'COZE_PROJECT_DOMAIN_DEFAULT', description: '对外访问域名', required: false, default: 'https://nodecoda.com' },
  { key: 'DEPLOY_RUN_PORT', description: '服务监听端口', required: false, default: '5000' },
  { key: 'RATE_LIMIT_STORE', description: '限流存储类型 (memory/redis)', required: false, default: 'memory' },
];

/**
 * 校验环境变量，启动时调用
 * - required 缺失 → 打印警告（不阻断启动，避免容器启动失败）
 * - 返回所有缺失项列表
 */
export function validateEnv(): { missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const spec of REQUIRED_ENV) {
    const value = process.env[spec.key];
    if (!value) {
      if (spec.required) {
        missing.push(spec.key);
      }
      warnings.push(`⚠️ ${spec.key} 未设置，${spec.description}${spec.default ? `，将使用默认值: ${spec.default}` : ''}`);
    }
  }

  return { missing, warnings };
}

export function getEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

export function getEnvInt(key: string, defaultValue: number): number {
  const val = process.env[key];
  return val ? parseInt(val, 10) : defaultValue;
}