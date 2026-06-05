import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const projectId = resolvedParams.id;

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    // 1. Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // 2. Increment real likes count in DB
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        likesCount: {
          increment: 1,
        },
      },
    });

    // 3. Log a 'PROJECT_LIKE' event for analytics tracking over time
    await prisma.analyticsEvent.create({
      data: {
        eventType: 'PROJECT_LIKE',
        targetId: projectId,
        targetName: project.title,
      },
    });

    return NextResponse.json({
      success: true,
      likesCount: updatedProject.likesCount,
      totalLikes: updatedProject.likesCount + updatedProject.fakeLikes,
    });
  } catch (error: any) {
    console.error('Error liking project:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
