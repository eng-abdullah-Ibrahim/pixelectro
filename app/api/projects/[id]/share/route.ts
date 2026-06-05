import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const projectId = resolvedParams.id;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { sharesCount: { increment: 1 } },
    });

    await prisma.analyticsEvent.create({
      data: {
        eventType: 'PROJECT_SHARE',
        targetId: projectId,
        targetName: project.title,
      },
    });

    return NextResponse.json({
      success: true,
      sharesCount: updated.sharesCount,
      totalShares: updated.sharesCount + updated.fakeShares,
    });
  } catch (error: any) {
    console.error('Error tracking project share:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
