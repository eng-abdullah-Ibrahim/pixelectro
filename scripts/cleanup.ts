import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clean() {
  const d = new Date('2026-06-21T22:20:00Z');
  
  const projects = await prisma.project.deleteMany({where: {createdAt: {gt: d}}});
  console.log('Deleted projects:', projects.count);

  const categories = await prisma.category.deleteMany({where: {createdAt: {gt: d}}});
  console.log('Deleted categories:', categories.count);

  const pages = await prisma.servicePage.deleteMany({where: {createdAt: {gt: d}}});
  console.log('Deleted pages:', pages.count);

  console.log('Cleaned up duplicates!');
}

clean().finally(() => prisma.$disconnect());
