import { NextRequest, NextResponse } from 'next/server';
import {
  getAttributeGroups,
  createGroup, updateGroup, deleteGroup,
  createAttribute, updateAttribute, deleteAttribute,
  createValue, updateValue, deleteValue,
} from '@/lib/services/attribute.service';

export async function GET(req: NextRequest) {
  try {
    const locale = req.nextUrl.searchParams.get('locale') || 'zh_cn';
    const data = await getAttributeGroups(locale);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body;

    let result;
    switch (type) {
      case 'group':
        result = await createGroup(body.data);
        break;
      case 'attribute':
        result = await createAttribute(body.data);
        break;
      case 'value':
        result = await createValue(body.data);
        break;
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, id } = body;

    switch (type) {
      case 'group':
        await updateGroup(id, body.data);
        break;
      case 'attribute':
        await updateAttribute(id, body.data);
        break;
      case 'value':
        await updateValue(id, body.data);
        break;
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const type = searchParams.get('type');
    const id = parseInt(searchParams.get('id') || '0');

    switch (type) {
      case 'group':
        await deleteGroup(id);
        break;
      case 'attribute':
        await deleteAttribute(id);
        break;
      case 'value':
        await deleteValue(id);
        break;
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}