import fs from 'fs';
import path from 'path';
import { generateTranslations } from './lib/translationEngine';

const LANGUAGES = [
  "ar", "zh", "hi", "es", "fr", "it", "bn", "ru", "pt", "ur", "id", "de", "ja", "tr", "ko"
];

async function main() {
  const localesDir = path.join(process.cwd(), 'locales');
  const enPath = path.join(localesDir, 'en.json');
  const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

  // The sections that need translation
  const sectionsToTranslate = {
    navbar: enData.navbar,
    contactPage: enData.contactPage,
    testimonialsPage: enData.testimonialsPage
  };

  console.log("Generating missing translations for navbar, contactPage and testimonialsPage...");
  const translations = await generateTranslations(sectionsToTranslate);

  for (const lang of LANGUAGES) {
    if (translations[lang]) {
      const langPath = path.join(localesDir, `${lang}.json`);
      let langData: any = {};
      try {
        langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));
      } catch (e) {}

      // Overwrite or add the sections
      langData.navbar = translations[lang].navbar || langData.navbar;
      langData.contactPage = translations[lang].contactPage || langData.contactPage;
      langData.testimonialsPage = translations[lang].testimonialsPage || langData.testimonialsPage;

      fs.writeFileSync(langPath, JSON.stringify(langData, null, 2));
      console.log(`Updated ${lang}.json`);
    } else {
      console.log(`Failed to get translation for ${lang}`);
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
