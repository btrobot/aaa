import { NextResponse } from 'next/server';
import { ThemeService } from '@/lib/services/theme.service';
import { withMiddleware, cacheResponse } from '@/lib/api-middleware';

export const GET = withMiddleware(async () => {
  const presets = ThemeService.listPresets();
  return cacheResponse(NextResponse.json({ presets }), { maxAge: 3600 });
}, { rateLimit: { maxRequests: 60, windowMs: 60_000 } });
