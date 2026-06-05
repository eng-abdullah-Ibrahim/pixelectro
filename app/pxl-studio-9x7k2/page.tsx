import prisma from '@/lib/prisma';
import AnalyticsDashboard from "./AnalyticsDashboard";

export default async function AdminDashboard() {
  const [categoryCount, projectCount, projects] = await Promise.all([
    prisma.category.count(),
    prisma.project.count(),
    prisma.project.findMany({
      orderBy: { id: "desc" },
      include: {
        category: {
          include: {
            servicePage: true,
          },
        },
      },
    }),
  ]);

  // Format initial projects cleanly to prevent any complex Prisma class serialization errors
  const formattedProjects = projects.map((p) => ({
    id: p.id,
    title: p.title,
    likesCount: p.likesCount,
    fakeLikes: p.fakeLikes,
    viewsCount: p.viewsCount,
    fakeViews: p.fakeViews,
    sharesCount: p.sharesCount,
    fakeShares: p.fakeShares,
    category: {
      name: p.category.name,
      servicePage: {
        title: p.category.servicePage.title,
      },
    },
  }));

  return (
    <AnalyticsDashboard
      initialProjectCount={projectCount}
      initialCategoryCount={categoryCount}
      initialProjects={formattedProjects}
    />
  );
}
