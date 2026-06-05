import fs from 'fs/promises';
import path from 'path';
import { generateTranslations } from '../lib/translationEngine';
import { availableLanguages } from '../app/components/LanguageSwitcher';

const LOCALES_DIR = path.join(process.cwd(), 'locales');
const EN_PATH = path.join(LOCALES_DIR, 'en.json');

async function main() {
  try {
    const enContent = await fs.readFile(EN_PATH, 'utf-8');
    const enJson = JSON.parse(enContent);

    console.log(`Translating en.json into 15 languages...`);

    // Using translationEngine.ts which uses Gemini and returns an object
    // { ar: {...}, zh: {...}, etc }
    const translations = await generateTranslations(enJson);

    // Save each language to its own file
    for (const [langCode, translatedJson] of Object.entries(translations)) {
      if (langCode === 'en') continue;
      
      const filePath = path.join(LOCALES_DIR, `${langCode}.json`);
      await fs.writeFile(filePath, JSON.stringify(translatedJson, null, 2), 'utf-8');
      console.log(`✅ Saved ${langCode}.json`);
    }

    console.log(`🎉 All locales generated successfully!`);
  } catch (err) {
    console.error(`❌ Error generating locales:`, err);
  }
}

main();
