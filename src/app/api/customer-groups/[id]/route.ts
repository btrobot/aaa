import { NextRequest, NextResponse } from 'next/server';
import { customerGroupService } from '@/lib/services/customer-group.service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const group = await customerGroupService.update(Number(id), {
      name: body.name,
      description: body.description,
      discount: body.discount,
    });
    if (!group) {
      return NextResponse.json({ error: 'Customer group not found' }, { status: 404 });
    }
    return NextResponse.json(group);
  } catch (error) {
    console.error('Failed to update customer group:', error);
    return NextResponse.json({ error: 'Failed to update customer group' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await customerGroupService.delete(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete customer group';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}