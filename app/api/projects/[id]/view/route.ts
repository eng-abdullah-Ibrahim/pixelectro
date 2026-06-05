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
      data: { viewsCount: { increment: 1 } },
    });

    await prisma.analyticsEvent.create({
      data: {
        eventType: 'PROJECT_VIEW',
        targetId: projectId,
        targetName: project.title,
      },
    });

    return NextResponse.json({
      success: true,
      viewsCount: updated.viewsCount,
      totalViews: updated.viewsCount + updated.fakeViews,
    });
  } catch (error: any) {
    console.error('Error tracking project view:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
