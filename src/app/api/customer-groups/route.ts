import { NextRequest, NextResponse } from 'next/server';
import { customerGroupService } from '@/lib/services/customer-group.service';

export async function GET() {
  try {
    const result = await customerGroupService.list();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch customer groups:', error);
    return NextResponse.json({ error: 'Failed to fetch customer groups' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const group = await customerGroupService.create({
      name: body.name,
      description: body.description,
      discount: body.discount,
    });
    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error('Failed to create customer group:', error);
    return NextResponse.json({ error: 'Failed to create customer group' }, { status: 500 });
  }
}