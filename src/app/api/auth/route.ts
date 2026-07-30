import { NextResponse } from 'next/server';
import { CustomerService } from '@/lib/services/customer.service';
import { signToken } from '@/lib/auth';
import { withRateLimit } from '@/lib/api-middleware';

export const POST = withRateLimit(async (request: Request) => {
  const body = await request.json();
  const { action } = body;

  switch (action) {
    case 'login': {
      const { email, password } = body;
      if (!email || !password) {
        return NextResponse.json({ error: '请提供邮箱和密码' }, { status: 400 });
      }
      const customer = await CustomerService.login({ email, password });
      const token = await signToken({ id: customer.id, email: customer.email, role: 'customer' });
      return NextResponse.json({ customer, token });
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
      const token = await signToken({ id: customer.id, email: customer.email, role: 'customer' });
      return NextResponse.json({ customer, token }, { status: 201 });
    }
    default:
      return NextResponse.json({ error: '未知操作' }, { status: 400 });
  }
}, { maxRequests: 20, windowMs: 60000 });