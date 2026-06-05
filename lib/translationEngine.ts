import { GoogleGenerativeAI } from '@google/generative-ai';

const LANGUAGES = [
  "ar", // Arabic
  "zh", // Mandarin Chinese
  "hi", // Hindi
  "es", // Spanish
  "fr", // French
  "it", // Italian
  "bn", // Bengali
  "ru", // Russian
  "pt", // Portuguese
  "ur", // Urdu
  "id", // Indonesian
  "de", // German
  "ja", // Japanese
  "tr", // Turkish
  "ko"  // Korean
];

// Generic type to allow any deeply nested JSON object
type TranslationInput = any;

export async function generateTranslations(content: TranslationInput) {
  // Safety Plan: Create a robust fallback object containing all 15 languages mapped to the original English content.
  // This ensures the database is never populated with empty strings, and the UI never crashes or disappears.
  const fallbackTranslations: Record<string, any> = {};
  LANGUAGES.forEach(lang => {
    fallbackTranslations[lang] = content;
  });

  // 1. Read keys from GEMINI_API_KEYS (comma separated) or fallback to single GEMINI_API_KEY
  const keysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
  const keys = keysString.split(',').map(k => k.trim()).filter(k => k.length > 0);

  if (keys.length === 0) {
    console.error("No Gemini API keys found for translation. Using English fallback.");
    return fallbackTranslations;
  }

  // Rate Limiting Protection: Wait 2 seconds between translation requests to avoid 429 Too Many Requests
  await new Promise(resolve => setTimeout(resolve, 2000));

  const prompt = `You are a professional native-level translator and marketing expert.
I will provide you with a JSON object containing English text for a website.
Your task is to translate ALL string values within the provided JSON object recursively into the following 15 languages, ensuring high-quality, professional marketing tone, and returning the exact same HTML formatting/tags if present.

Target Languages:
Arabic (ar), Mandarin Chinese (zh), Hindi (hi), Spanish (es), French (fr), Italian (it), Bengali (bn), Russian (ru), Portuguese (pt), Urdu (ur), Indonesian (id), German (de), Japanese (ja), Turkish (tr), Korean (ko).

Input English JSON:
${JSON.stringify(content, null, 2)}

Output Format Requirements:
Respond ONLY with a valid, parseable JSON object matching this exact structure:
{
  "ar": { ...exactly matching the structure of the Input English JSON, but translated... },
  "zh": { ...exactly matching the structure of the Input English JSON, but translated... },
  // ... and so on for all 15 languages.
}
Do NOT wrap the output in markdown code blocks like \`\`\`json. Return just the raw JSON object.`;

  // Try keys sequentially until one succeeds
  for (let i = 0; i < keys.length; i++) {
    const currentKey = keys[i];
    try {
      const ai = new GoogleGenerativeAI(currentKey);
      const model = ai.getGenerativeModel({ model: "gemini-flash-latest" });
      
      const result = await model.generateContent(prompt);
      let text = result.response.text();
      
      // Clean up any potential markdown formatting
      text = text.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
      
      // Validate that the output contains the required languages
      const parsed = JSON.parse(text);
      if (!parsed.ar || !parsed.zh) {
        throw new Error("Translation JSON missing expected language keys");
      }
      
      // If successful, return the parsed translations
      return parsed;
    } catch (error: any) {
      console.warn(`Translation failed with key ending in ...${currentKey.slice(-4)}:`, error?.message || error);
      
      // If this was the last key, break and use fallback
      if (i === keys.length - 1) {
        console.error("All Gemini API keys failed or hit rate limits.");
      } else {
        console.log(`Switching to next API key (${i + 2}/${keys.length})...`);
        // Add a tiny delay before switching keys to be safe
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  console.warn("Using English fallback translations to prevent site crashes.");
  return fallbackTranslations;
}
