import { cookies } from 'next/headers';

export async function getLanguage() {
  const cookieStore = await cookies();
  return cookieStore.get('NEXT_LOCALE')?.value || 'en';
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
