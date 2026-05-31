const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_PAGES = [
  { slug: 'branding',             title: 'Brand & Identity',        description: 'Living visual systems engineered for market dominance.',    scene: 'BrandingScene',    icon: '◈', order: 0 },
  { slug: 'video-editing',        title: 'Film & Cinematic Video',  description: 'High-concept narratives crafted for emotional impact.',     scene: 'FilmScene',        icon: '▶', order: 1 },
  { slug: '3d-vfx',               title: '3D & Visual Effects',     description: 'Procedural realities where geometry meets imagination.',    scene: 'VFXScene',         icon: '◎', order: 2 },
  { slug: 'software-development', title: 'Software Engineering',    description: 'Parametric architectures built for global scale.',          scene: 'SoftwareScene',    icon: '⬡', order: 3 },
  { slug: 'performance-marketing',title: 'Performance Marketing',   description: 'Data-driven campaigns that convert at scale.',             scene: 'PerformanceScene', icon: '◆', order: 4 },
  { slug: 'ai-solutions',         title: 'AI Solutions',            description: 'Autonomous systems and intelligent creative pipelines.',    scene: 'AIScene',          icon: '◉', order: 5 },
  { slug: '2d-animation',         title: '2D Animation',            description: 'Bringing characters and stories to life.',                  scene: 'IcosahedronScene', icon: '✧', order: 6 },
  { slug: 'content-management',   title: 'Content Management',      description: 'Streamlining your digital assets.',                         scene: 'BoxScene',         icon: '▤', order: 7 }
];

async function main() {
  console.log("Starting migration...");
  
  for (const pageData of DEFAULT_PAGES) {
    let servicePage = await prisma.servicePage.findUnique({ where: { slug: pageData.slug } });
    if (!servicePage) {
      servicePage = await prisma.servicePage.create({ data: pageData });
      console.log(`Created ServicePage: ${pageData.slug}`);
    } else {
      servicePage = await prisma.servicePage.update({
        where: { slug: pageData.slug },
        data: pageData
      });
      console.log(`Updated ServicePage: ${pageData.slug}`);
    }

    // Update existing categories that point to this page string
    await prisma.category.updateMany({
      where: { page: pageData.slug },
      data: { servicePageId: servicePage.id }
    });
    console.log(`Linked categories for ${pageData.slug}`);
  }

  console.log("Migration complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
