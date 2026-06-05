import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { generateTranslations } from '@/lib/translationEngine';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { content } = body; // This should be the 'en' object from the frontend

    if (!content) {
      return NextResponse.json({ error: 'Missing content to translate' }, { status: 400 });
    }

    // generateTranslations returns an object like { ar: {...}, fr: {...}, ... }
    const translations = await generateTranslations(content);

    return NextResponse.json({ success: true, translations });
  } catch (error: any) {
    console.error('Error generating homepage translations:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
