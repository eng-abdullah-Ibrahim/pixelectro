const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const deleted = await prisma.project.deleteMany({
      where: {
        name: {
          equals: 'Luliz',
          mode: 'insensitive'
        }
      }
    });
    console.log(`Deleted ${deleted.count} projects named "Luliz".`);
  } catch (error) {
    console.error('Error deleting Luliz:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
