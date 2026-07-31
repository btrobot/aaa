import { NextResponse } from 'next/server';
import { ThemeService } from '@/lib/services/theme.service';
import { withMiddleware, withAdmin, cacheResponse } from '@/lib/api-middleware';

export const GET = withMiddleware(async () => {
  const theme = await ThemeService.getCurrentTheme();
  return cacheResponse(NextResponse.json({ theme }), { maxAge: 60 });
}, { rateLimit: { maxRequests: 60, windowMs: 60_000 } });

export const PUT = withAdmin(async (request) => {
  const body = await request.json();
  const theme = await ThemeService.applyPreset(body);
  return NextResponse.json({ theme });
});
