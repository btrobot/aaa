import { NextResponse } from 'next/server';
import { ThemeService } from '@/lib/services/theme.service';
import { withAdmin } from '@/lib/api-middleware';

export const PUT = withAdmin(async (request) => {
  const body = await request.json();
  const theme = await ThemeService.customizeTheme(body);
  return NextResponse.json({ theme });
}, { rateLimit: { maxRequests: 30, windowMs: 60_000 } });
