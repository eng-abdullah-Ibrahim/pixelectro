import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { prompt } = await req.json();
    
    if (!prompt) return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });

    const keysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
    const keys = keysString.split(',').map(k => k.trim()).filter(k => k.length > 0);

    if (keys.length === 0) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    let cleanText = "";
    let success = false;
    let lastError: any = null;

    for (const key of keys) {
      try {
        const ai = new GoogleGenerativeAI(key);
        const model = ai.getGenerativeModel({ model: 'gemini-flash-latest' });
        const response = await model.generateContent([{ text: prompt }]);
        const generatedText = response.response.text() || '';
        cleanText = generatedText.replace(/[*#`]/g, '').trim();
        success = true;
        break; // Stop trying if successful
      } catch (err: any) {
        lastError = err;
        console.error('AI Text Generation Error with key:', err.message);
        // Continue to the next key
      }
    }

    if (!success) {
      throw lastError || new Error('All API keys failed');
    }

    return NextResponse.json({ success: true, text: cleanText });
  } catch (error: any) {
    console.error('AI Text Generation Error Final:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate content' }, { status: 500 });
  }
}
