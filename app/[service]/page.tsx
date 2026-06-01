import prisma from '../../lib/prisma';
import PortfolioGrid from './PortfolioGrid';
import { notFound } from 'next/navigation';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
  const resolvedParams = await params;
  const serviceSlug = resolvedParams.service;

  // Fetch the ServicePage dynamically
  const servicePage = await prisma.servicePage.findUnique({
    where: { slug: serviceSlug, isActive: true }
  });

  if (!servicePage) {
    notFound();
  }

  // Fetch categories and projects for this specific service
  const categories = await prisma.category.findMany({
    where: { servicePageId: servicePage.id, isActive: true },
    orderBy: { order: 'asc' },
    include: {
      projects: {
        where: { isActive: true },

        include: {
          media: {
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      }
    }
  });

  return (
    <main>
      <PortfolioGrid 
        title={servicePage.title} 
        description={servicePage.description}
        categories={categories} 
        sceneIdentifier={servicePage.scene} 
        serviceSlug={serviceSlug}
      />
    </main>
  );
}
