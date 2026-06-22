import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.projectMedia.deleteMany({
    where: {
      url: { contains: "pixelectro/sync" }
    }
  });

  console.log(`Deleted ${result.count} sync media items from database.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
