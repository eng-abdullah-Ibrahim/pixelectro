import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { eventType, targetId, targetName } = await request.json();

    if (!eventType) {
      return NextResponse.json({ error: 'Missing eventType' }, { status: 400 });
    }

    const event = await prisma.analyticsEvent.create({
      data: {
        eventType,
        targetId: targetId || null,
        targetName: targetName || null,
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    console.error('Error logging analytics event:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
