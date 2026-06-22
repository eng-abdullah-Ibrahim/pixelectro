import { cookies, headers } from 'next/headers';

export async function getLanguage() {
  const cookieStore = await cookies();
  const cookieLoc = cookieStore.get('NEXT_LOCALE')?.value;
  if (cookieLoc) return cookieLoc;
  
  // Auto-detect from browser language if no cookie is present
  try {
    const headersList = await headers();
    const acceptLang = headersList.get('accept-language');
    if (acceptLang) {
      const preferred = acceptLang.split(',')[0].split('-')[0].toLowerCase();
      const available = ['en', 'ar', 'zh', 'hi', 'es', 'fr', 'it', 'ru', 'pt', 'de', 'ja', 'tr', 'ko', 'id', 'ur', 'bn'];
      if (available.includes(preferred)) {
        return preferred;
      }
    }
  } catch (e) {
    // ignore
  }
  return 'en';
}

export function translateField(item: any, field: string, lang: string) {
  if (lang === 'en' || !item.translations) return item[field];
  
  try {
    const translations = typeof item.translations === 'string' 
      ? JSON.parse(item.translations) 
      : item.translations;
      
    if (translations && translations[lang] && translations[lang][field]) {
      return translations[lang][field];
    }
    return item[field]; // fallback to english
  } catch (e) {
    return item[field];
  }
}
