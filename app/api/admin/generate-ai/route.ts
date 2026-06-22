import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '@/lib/prisma';

// Helper to download an image from a URL and convert it to Gemini's inlineData format
async function fetchImageAsInlineData(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = response.headers.get('content-type') || 'image/jpeg';
    
    return {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType
      }
    };
  } catch (error) {
    console.error('Error fetching image for AI:', error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { projectId, serviceId, title, category, name } = await req.json();
    
    const keysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
    const keys = keysString.split(',').map(k => k.trim()).filter(k => k.length > 0);

    if (keys.length === 0) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Prepare parts array first, then try keys
    let mediaUrls: string[] = [];
    let fetchTitle = title;
    let fetchCategory = category;

    // Fetch associated media URLs and details
    if (projectId) {
      const project = await prisma.project.findUnique({ 
        where: { id: projectId },
        include: { category: true }
      });
      if (project) {
        fetchTitle = project.title;
        fetchCategory = project.category?.name || '';
      }
      const media = await prisma.projectMedia.findMany({ where: { projectId } });
      mediaUrls = media.map((m: any) => m.url);
    } else if (serviceId) {
      const service = await prisma.servicePage.findUnique({ where: { id: serviceId } });
      if (service) fetchTitle = service.title;
      fetchCategory = 'Service Page';
      
      const media = await prisma.testimonialMedia.findMany({ where: { servicePageId: serviceId } });
      mediaUrls = media.map((m: any) => m.url);
    }

    // Convert Cloudinary Video/PDF URLs to Image Thumbnails to bypass Vercel limits
    const imageUrls = mediaUrls.map((url: any) => {
      if (url.includes('cloudinary.com')) {
        // Replace .mp4, .mov, .pdf with .jpg to get a snapshot
        return url.replace(/\.(mp4|mov|avi|wmv|pdf)$/i, '.jpg');
      }
      return url;
    });

    let finalPrompt = "";
    
    if (projectId) {
      finalPrompt = `You are an expert marketing copywriter for Pixelectro. Read the project name "${fetchTitle || 'Unknown Project'}". 
Analyze the attached visual snapshots, which are examples of the work. Write a highly engaging, professional description of exactly 1 continuous sentence (around 15 to 25 words) about the brand in general.
CRITICAL RULES:
1. Output the description in ENGLISH ONLY.
2. Must be exactly 1 continuous sentence. Not too short, not too long.
3. Base your description heavily on the aesthetic style and vibe of the provided images, but talk about the brand broadly (do NOT describe the specific contents or layout of the images).
4. DO NOT output any conversational text, introductions, or explanations.
5. DO NOT use any markdown formatting, asterisks (*), backticks (\`), or bold text. Just plain text.`;
    } else if (serviceId) {
      if (name === 'excerpt') {
        finalPrompt = `You are an expert marketing copywriter for Pixelectro. Read the page name "${fetchTitle || 'Unknown Page'}". Write a highly engaging and professional description of exactly 3 lines about how we perform this service for our clients with the best results.
CRITICAL RULES:
1. Output the description in ENGLISH ONLY.
2. DO NOT output any conversational text, introductions, or explanations.
3. Start each of the 3 lines with a big bullet point character (•).
4. DO NOT use any markdown formatting, asterisks (*), backticks (\`), or bold text. Just plain text with the • bullet.`;
      } else {
        finalPrompt = `You are an expert marketing copywriter for Pixelectro. Read the page name "${fetchTitle || 'Unknown Page'}". Write a highly engaging and professional description of exactly 1 continuous sentence (a single paragraph) about the magnificence, beauty, and creativity of our company in executing this service.
CRITICAL RULES:
1. Output the description in ENGLISH ONLY.
2. DO NOT output any conversational text, introductions, or explanations.
3. DO NOT use any markdown formatting, asterisks (*), backticks (\`), or bold text. Just plain text.`;
      }
    }

    // For projects, feed the AI the first 2 images so it understands the general vibe without fixating on one image.
    let filteredUrls = imageUrls;
    if (projectId && imageUrls.length >= 2) {
      filteredUrls = [imageUrls[0], imageUrls[1]];
    } else if (projectId && imageUrls.length === 1) {
      filteredUrls = [imageUrls[0]];
    }

    // Limit to max 5 images to prevent payload too large or timeouts
    const limitedUrls = filteredUrls.slice(0, 5);
    
    const parts: any[] = [];
    
    parts.push({
      text: finalPrompt
    });

    // Fetch images and add to parts
    for (const url of limitedUrls) {
      const inlineData = await fetchImageAsInlineData(url);
      if (inlineData) {
        parts.push(inlineData);
      }
    }

    let htmlText = "";
    let success = false;
    let lastError: any = null;

    for (const key of keys) {
      try {
        const ai = new GoogleGenerativeAI(key);
        const model = ai.getGenerativeModel({ model: 'gemini-flash-latest' });
        
        const response = await model.generateContent(parts);
        const generatedText = response.response.text() || '';
        
        // Remove any markdown leftovers if the AI hallucinates them despite instructions
        const cleanText = generatedText.replace(/[*#`]/g, '').trim();

        // Format as HTML for the Rich Text Editor
        htmlText = cleanText
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .map(line => `<p>${line}</p>`)
          .join('');
        
        success = true;
        break; // Stop trying if successful
      } catch (err: any) {
        lastError = err;
        console.error('AI Generation Error with key:', err.message);
        // Continue to next key
      }
    }

    if (!success) {
      throw lastError || new Error('All API keys failed');
    }

    return NextResponse.json({ success: true, text: htmlText });
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate content' }, { status: 500 });
  }
}
