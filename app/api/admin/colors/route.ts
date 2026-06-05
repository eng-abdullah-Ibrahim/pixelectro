import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const setting = await prisma.globalSetting.findUnique({
      where: { key: 'WYSIWYG_CUSTOM_COLORS' }
    });

    if (setting) {
      return NextResponse.json({ colors: JSON.parse(setting.value) });
    } else {
      return NextResponse.json({ colors: [] });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch colors' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { colors } = await req.json();

    const setting = await prisma.globalSetting.upsert({
      where: { key: 'WYSIWYG_CUSTOM_COLORS' },
      update: { value: JSON.stringify(colors) },
      create: { key: 'WYSIWYG_CUSTOM_COLORS', value: JSON.stringify(colors) }
    });

    return NextResponse.json({ success: true, colors: JSON.parse(setting.value) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save colors' }, { status: 500 });
  }
}
