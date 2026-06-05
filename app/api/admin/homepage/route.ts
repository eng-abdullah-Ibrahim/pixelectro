import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const setting = await prisma.globalSetting.findUnique({
      where: { key: 'HOMEPAGE_CONTENT' }
    });

    if (!setting) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ success: true, data: JSON.parse(setting.value) });
  } catch (error: any) {
    console.error('Error fetching homepage content:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();

    const setting = await prisma.globalSetting.upsert({
      where: { key: 'HOMEPAGE_CONTENT' },
      update: { value: JSON.stringify(data) },
      create: { key: 'HOMEPAGE_CONTENT', value: JSON.stringify(data) }
    });

    return NextResponse.json({ success: true, setting });
  } catch (error: any) {
    console.error('Error saving homepage content:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
