import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    include: { media: true }
  });

  let deletedCount = 0;

  for (const project of projects) {
    const seenUrls = new Set<string>();
    const duplicates: string[] = [];

    for (const m of project.media) {
      if (seenUrls.has(m.url)) {
        duplicates.push(m.id);
      } else {
        seenUrls.add(m.url);
      }
    }

    if (duplicates.length > 0) {
      await prisma.projectMedia.deleteMany({
        where: { id: { in: duplicates } }
      });
      console.log(`Deleted ${duplicates.length} duplicate media for project: ${project.title}`);
      deletedCount += duplicates.length;
    }
  }

  console.log(`Total duplicates deleted: ${deletedCount}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
