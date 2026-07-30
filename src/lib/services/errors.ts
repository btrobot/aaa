/**
 * 服务层领域错误基类
 * 所有业务规则违反均抛出此异常，便于 API 层统一捕获并映射为 HTTP 状态码
 */
export class ServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

/** 资源不存在 */
export class NotFoundError extends ServiceError {
  constructor(entity: string, id?: number | string) {
    const suffix = id !== undefined ? ` (id=${id})` : '';
    super('NOT_FOUND', `${entity}不存在${suffix}`, 404);
    this.name = 'NotFoundError';
  }
}

/** 业务规则违反（库存不足、数量超限等） */
export class BusinessRuleError extends ServiceError {
  constructor(message: string) {
    super('BUSINESS_RULE_VIOLATION', message, 422);
    this.name = 'BusinessRuleError';
  }
}
