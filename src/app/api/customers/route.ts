import { NextResponse } from 'next/server';
import { CustomerService } from '@/lib/services/customer.service';
import { withAuth, withAdmin, withMiddleware } from '@/lib/api-middleware';

/**
 * GET /api/customers
 * - ?id=xxx: 查看自己的信息（需登录，且 id 必须匹配）
 * - ?admin=true: 管理员查看全部客户
 */
export const GET = withMiddleware(async (request, { user }) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') ? Number(searchParams.get('id')) : undefined;

  // 管理员查看所有客户
  if (searchParams.get('admin') === 'true') {
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }
    const all = await CustomerService.findAll();
    return NextResponse.json(all);
  }

  // 查看单个客户 — 必须登录且只能查看自己（管理员除外）
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }
  if (id && user.role !== 'admin' && id !== user.id) {
    return NextResponse.json({ error: '权限不足' }, { status: 403 });
  }
  const customerId = id || user.id;
  // findById 在客户不存在时抛出 NotFoundError，由中间件统一处理为 404
  const customer = await CustomerService.findById(customerId);
  return NextResponse.json(customer);
}, { auth: true });

/**
 * POST /api/customers — 仅管理员可创建客户
 */
export const POST = withAdmin(async (request) => {
  const body = await request.json();
  const customer = await CustomerService.register(body);
  return NextResponse.json(customer, { status: 201 });
});
