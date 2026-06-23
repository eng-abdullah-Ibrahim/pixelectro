import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const mediaId = resolvedParams.id;

    if (!mediaId) {
      return NextResponse.json({ error: 'Missing mediaId' }, { status: 400 });
    }

    const media = await prisma.projectMedia.findUnique({
      where: { id: mediaId },
      include: { project: true }
    });

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const updatedMedia = await prisma.projectMedia.update({
      where: { id: mediaId },
      data: { viewsCount: { increment: 1 } },
    });

    await prisma.analyticsEvent.create({
      data: {
        eventType: 'MEDIA_VIEW',
        targetId: mediaId,
        targetName: media.project.title + ' (PDF)',
      },
    });

    return NextResponse.json({ 
      success: true, 
      totalViews: updatedMedia.viewsCount + updatedMedia.fakeViews 
    });
  } catch (error) {
    console.error('Error tracking media view:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
