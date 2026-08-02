import { NextRequest, NextResponse } from 'next/server';
import { AttributeService } from '@/lib/services/attribute.service';
import { withMiddleware, withAdmin, cacheResponse } from '@/lib/api-middleware';

export const GET = withMiddleware(async (request: NextRequest) => {
  const locale = request.nextUrl.searchParams.get('locale') || 'zh_cn';
  const data = await AttributeService.getAttributeGroups(locale);
  return cacheResponse(NextResponse.json(data), { maxAge: 30 });
}, { rateLimit: { maxRequests: 60, windowMs: 60_000 } });

export const POST = withAdmin(async (request) => {
  const body = await request.json();
  const { type } = body;
  let result;
  switch (type) {
    case 'group': result = await AttributeService.createGroup(body.data); break;
    case 'attribute': result = await AttributeService.createAttribute(body.data); break;
    case 'value': result = await AttributeService.createValue(body.data); break;
    default: return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }
  return NextResponse.json(result, { status: 201 });
});

export const PUT = withAdmin(async (request) => {
  const body = await request.json();
  const { type, id } = body;
  switch (type) {
    case 'group': await AttributeService.updateGroup(id, body.data); break;
    case 'attribute': await AttributeService.updateAttribute(id, body.data); break;
    case 'value': await AttributeService.updateValue(id, body.data); break;
    default: return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }
  return NextResponse.json({ success: true });
});

export const DELETE = withAdmin(async (request) => {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get('type');
  const id = parseInt(searchParams.get('id') || '0');
  switch (type) {
    case 'group': await AttributeService.deleteGroup(id); break;
    case 'attribute': await AttributeService.deleteAttribute(id); break;
    case 'value': await AttributeService.deleteValue(id); break;
    default: return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }
  return NextResponse.json({ success: true });
});
