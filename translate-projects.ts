import { PrismaClient } from '@prisma/client';
import { generateTranslations } from './lib/translationEngine';

const prisma = new PrismaClient();

async function main() {
  console.log("Translating projects...");
  const projects = await prisma.project.findMany();
  for (const proj of projects) {
    if (!proj.translations || Object.keys(proj.translations).length < 10) {
      console.log(`Translating project: ${proj.title}`);
      const t = await generateTranslations({
        title: proj.title,
        description: proj.description || ""
      });
      await prisma.project.update({
        where: { id: proj.id },
        data: { translations: t }
      });
      console.log(`Project ${proj.title} translated successfully.`);
    } else {
      console.log(`Project ${proj.title} already translated.`);
    }
  }

  console.log("Translating global settings...");
  // HOMEPAGE_CONTENT
  const homeSetting = await prisma.globalSetting.findUnique({ where: { key: 'HOMEPAGE_CONTENT' } });
  if (homeSetting) {
    let parsed = JSON.parse(homeSetting.value);
    // If it only has en, we need to translate it
    if (!parsed.content || !parsed.content.ar) {
      console.log("Translating HOMEPAGE_CONTENT...");
      const originalEn = parsed.content ? parsed.content.en : parsed;
      const t = await generateTranslations(originalEn);
      
      const newParsed = {
        scenes: parsed.scenes || {},
        content: t
      };
      
      await prisma.globalSetting.update({
        where: { key: 'HOMEPAGE_CONTENT' },
        data: { value: JSON.stringify(newParsed) }
      });
      console.log("HOMEPAGE_CONTENT translated successfully.");
    } else {
      console.log("HOMEPAGE_CONTENT already translated.");
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
