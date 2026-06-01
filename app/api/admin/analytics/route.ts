import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const periodsStr = searchParams.get('periods');
    const projectId = searchParams.get('projectId');

    // Legacy support
    const startStr = searchParams.get('start');
    const endStr = searchParams.get('end');
    const compStartStr = searchParams.get('compStart');
    const compEndStr = searchParams.get('compEnd');

    let periods: { start: string; end: string; label: string }[] = [];

    if (periodsStr) {
      try {
        periods = JSON.parse(periodsStr);
      } catch {
        return NextResponse.json({ error: 'Invalid periods format' }, { status: 400 });
      }
    } else if (startStr && endStr) {
      periods.push({ start: startStr, end: endStr, label: 'Main Period' });
      if (compStartStr && compEndStr) {
        periods.push({ start: compStartStr, end: compEndStr, label: 'Previous Period' });
      }
    } else {
      return NextResponse.json({ error: 'Missing date ranges' }, { status: 400 });
    }

    const getInterval = (start: Date, end: Date): 'hour' | 'day' | 'month' => {
      const diffMs = end.getTime() - start.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays <= 2) return 'hour';
      if (diffDays > 365) return 'month';
      return 'day';
    };

    const getPeriodData = async (periodStart: Date, periodEnd: Date, label: string) => {
      const interval = getInterval(periodStart, periodEnd);

      // Fix: set end of day for the end date so today's events are included
      const endOfDay = new Date(periodEnd);
      endOfDay.setHours(23, 59, 59, 999);

      const whereClause: {
        createdAt: { gte: Date; lte: Date };
        targetId?: string;
      } = {
        createdAt: {
          gte: periodStart,
          lte: endOfDay,
        },
      };

      // For project-specific analytics, filter by targetId for interaction events
      // but keep PAGE_VIEW and CATEGORY_VIEW global (or targetId = projectId for PROJECT_VIEW)
      if (projectId) {
        whereClause.targetId = projectId;
      }

      const events = await prisma.analyticsEvent.findMany({
        where: whereClause,
        orderBy: { createdAt: 'asc' },
      });

      const emptyTotals = () => ({
        PAGE_VIEW: 0,
        PROJECT_VIEW: 0,
        CATEGORY_VIEW: 0,
        WHATSAPP_CLICK: 0,
        EMAIL_CLICK: 0,
        PROJECT_LIKE: 0,
        PROJECT_SHARE: 0,
      });

      type TotalsType = ReturnType<typeof emptyTotals>;

      const totals = emptyTotals();
      const groupedData: Record<string, TotalsType> = {};

      // Pre-fill all time buckets so chart has even spacing
      const current = new Date(periodStart);
      while (current <= endOfDay) {
        const key = getGroupKey(current, interval);
        if (!groupedData[key]) {
          groupedData[key] = emptyTotals();
        }
        if (interval === 'hour') {
          current.setHours(current.getHours() + 1);
        } else if (interval === 'month') {
          current.setMonth(current.getMonth() + 1);
        } else {
          current.setDate(current.getDate() + 1);
        }
      }

      // Ensure end bucket exists
      const endKey = getGroupKey(endOfDay, interval);
      if (!groupedData[endKey]) {
        groupedData[endKey] = emptyTotals();
      }

      // Aggregate events
      events.forEach((ev) => {
        const type = ev.eventType as keyof TotalsType;
        if (type in totals) {
          totals[type]++;
          const key = getGroupKey(ev.createdAt, interval);
          if (groupedData[key]) {
            groupedData[key][type]++;
          }
        }
      });

      const timeline = Object.keys(groupedData)
        .sort()
        .map((key) => ({
          label: key,
          ...groupedData[key],
        }));

      return { label, totals, timeline, interval };
    };

    const periodsData = await Promise.all(
      periods.map((p) => {
        const start = new Date(p.start);
        const end = new Date(p.end);
        return getPeriodData(start, end, p.label);
      })
    );

    let projectMeta = null;
    if (projectId) {
      const proj = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
          title: true,
          likesCount: true,
          fakeLikes: true,
          viewsCount: true,
          fakeViews: true,
          sharesCount: true,
          fakeShares: true,
        },
      });
      if (proj) {
        projectMeta = {
          title: proj.title,
          realLikes: proj.likesCount,
          fakeLikes: proj.fakeLikes,
          totalDisplayLikes: proj.likesCount + proj.fakeLikes,
          realViews: proj.viewsCount,
          fakeViews: proj.fakeViews,
          realShares: proj.sharesCount,
          fakeShares: proj.fakeShares,
        };
      }
    }

    return NextResponse.json({
      success: true,
      periodsData,
      project: projectMeta,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error fetching admin analytics:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function getGroupKey(date: Date, interval: 'hour' | 'day' | 'month'): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');

  if (interval === 'hour') return `${m}/${d} ${h}:00`;
  if (interval === 'month') return `${y}-${m}`;
  return `${m}/${d}`;
}
