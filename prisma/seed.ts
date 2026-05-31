import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const services = [
  { title: 'Branding & Identity', slug: 'branding', scene: 'BrandingScene', icon: '◈' },
  { title: 'Video Editing', slug: 'video-editing', scene: 'ProcessScene', icon: '▤' },
];

async function main() {
  await prisma.projectMedia.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.servicePage.deleteMany({});

  for (const srv of services) {
    const servicePage = await prisma.servicePage.create({
      data: {
        title: srv.title,
        slug: srv.slug,
        scene: srv.scene,
        icon: srv.icon,
        isActive: true,
      }
    });

    const category = await prisma.category.create({
      data: {
        name: 'Featured Work',
        slug: `featured-work-${srv.slug}`,
        servicePageId: servicePage.id,
        isActive: true,
      }
    });

    // Create 2 projects for each category with proper Unsplash URLs
    const p1 = await prisma.project.create({
      data: {
        title: `${srv.title} Project Alpha`,
        description: 'A premium showcase.',
        categoryId: category.id,
        isActive: true,
      }
    });

    await prisma.projectMedia.create({
      data: {
        projectId: p1.id,
        url: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2000&auto=format&fit=crop',
        type: 'IMAGE',
      }
    });

    const p2 = await prisma.project.create({
      data: {
        title: `${srv.title} Project Beta`,
        description: 'Next level digital experience.',
        categoryId: category.id,
        isActive: true,
      }
    });

    await prisma.projectMedia.create({
      data: {
        projectId: p2.id,
        url: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop',
        type: 'IMAGE',
      }
    });
  }
  
  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
