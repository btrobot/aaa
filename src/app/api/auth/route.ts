import { NextResponse } from 'next/server';
import { CustomerService } from '@/lib/services/customer.service';
import { signToken } from '@/lib/auth';
import { withRateLimit } from '@/lib/api-middleware';
import { db } from '@/lib/db/db';
import { adminUsers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const POST = withRateLimit(async (request) => {
  const body = await request.json();
  const { action } = body;

  switch (action) {
    case 'login': {
      const { email, password } = body;
      if (!email || !password) {
        return NextResponse.json({ error: '请提供邮箱和密码' }, { status: 400 });
      }

      // 1. 先查 customers 表
      try {
        const customer = await CustomerService.login({ email, password });
        const token = await signToken({ id: customer.id, email: customer.email, role: 'customer' });
        return NextResponse.json({ customer, token });
      } catch {
        // customer 表未找到，继续查 admin 表
      }

      // 2. 再查 admin_users 表
      const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
      if (!admin) {
        return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 });
      }
      const isValid = await bcrypt.compare(password, admin.password);
      if (!isValid) {
        return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 });
      }
      const { password: _, ...safeAdmin } = admin;
      const token = await signToken({ id: admin.id, email: admin.email, name: admin.name, role: 'admin' });
      return NextResponse.json({ customer: safeAdmin, token });
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
