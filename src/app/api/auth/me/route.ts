import { NextRequest, NextResponse } from 'next/server';
import { CustomerService } from '@/lib/services/customer.service';
import { authenticate, requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    requireAuth(user);

    const customer = await CustomerService.findById(user!.id);
    if (!customer) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }
    return NextResponse.json(customer);
  } catch (error) {
    if (error instanceof Error && 'status' in error) {
      return NextResponse.json({ error: error.message }, { status: (error as any).status });
    }
    return NextResponse.json({ error: '认证失败' }, { status: 500 });
  }
}