import { NextRequest, NextResponse } from 'next/server';
import { CustomerService } from '@/lib/services/customer.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'login': {
        const { email, password } = body;
        if (!email || !password) {
          return NextResponse.json({ error: '请提供邮箱和密码' }, { status: 400 });
        }
        const customer = await CustomerService.login({ email, password });
        return NextResponse.json(customer);
      }
      case 'register': {
        const { email, password, name } = body;
        if (!email || !password || !name) {
          return NextResponse.json({ error: '请提供邮箱、密码和名称' }, { status: 400 });
        }
        const customer = await CustomerService.register({
          email,
          password,
          name,
          newsletter: body.newsletter ?? false,
          phone: body.phone || undefined,
        });
        return NextResponse.json(customer, { status: 201 });
      }
      default:
        return NextResponse.json({ error: '未知操作' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '认证失败' },
      { status: 500 }
    );
  }
}