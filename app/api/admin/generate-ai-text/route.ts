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

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = ai.getGenerativeModel({ model: 'gemini-flash-latest' });

    const response = await model.generateContent([{ text: prompt }]);
    const generatedText = response.response.text() || '';
    
    // Clean markdown bold or code blocks
    const cleanText = generatedText.replace(/[*#`]/g, '').trim();

    return NextResponse.json({ success: true, text: cleanText });
  } catch (error: any) {
    console.error('AI Text Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate content' }, { status: 500 });
  }
}
