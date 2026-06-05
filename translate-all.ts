import { PrismaClient } from '@prisma/client';
import { generateTranslations } from './lib/translationEngine';

const prisma = new PrismaClient();



async function main() {
  console.log("Translating categories...");
  const categories = await prisma.category.findMany();
  for (const cat of categories) {
    if (!cat.translations || Object.keys(cat.translations).length < 10) {
      console.log(`Translating category: ${cat.name}`);
      const t = await generateTranslations({ title: cat.name });
      await prisma.category.update({
        where: { id: cat.id },
        data: { translations: t }
      });
    }
  }

  console.log("Translating service pages...");
  const pages = await prisma.servicePage.findMany();
  for (const page of pages) {
    if (!page.translations || Object.keys(page.translations).length < 10) {
      console.log(`Translating page: ${page.title}`);
      const t = await generateTranslations({
        title: page.title,
        description: page.description,
        excerpt: page.excerpt
      });
      await prisma.servicePage.update({
        where: { id: page.id },
        data: { translations: t }
      });
    }
  }

  console.log("Done!");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
