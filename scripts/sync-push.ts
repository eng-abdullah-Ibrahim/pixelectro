import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const CONTENT_DIR = path.join(process.cwd(), 'content');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEYS?.split(',')[0] || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const slugify = (str: string) => str.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '');

async function generateDescription(topic: string, type: 'page' | 'project') {
  try {
    const prompt = type === 'page' 
      ? `Write a professional, catchy English description (about 2 sentences) for a creative agency's service page titled "${topic}". Return only the description text.`
      : `Write a captivating English description (about 3 sentences) for a creative project titled "${topic}". Focus on design, impact, and excellence. Return only the description text.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    return `Beautiful ${topic} showcasing our best work.`;
  }
}

async function autoTranslate(contentObj: any) {
  try {
    const prompt = `Translate the following JSON object's string values into these languages: ar, es, fr, de, it, ru, zh, ko, ja, hi, bn, ur. 
Keep the keys the same. Return a strictly valid JSON object where the root keys are the language codes (ar, es, etc.), and the values are the translated objects.
Original English object:
${JSON.stringify(contentObj, null, 2)}
Return ONLY the JSON.`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    if (text.startsWith('\`\`\`json')) {
      text = text.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    }
    const translations = JSON.parse(text);
    translations['en'] = contentObj;
    return translations;
  } catch (err) {
    return { en: contentObj, ar: contentObj }; 
  }
}

async function run() {
  console.log('Scanning local folders to push missing content to Database...');
  
  if (!fs.existsSync(CONTENT_DIR)) return;

  const pages = fs.readdirSync(CONTENT_DIR, { withFileTypes: true }).filter(dirent => dirent.isDirectory());
  
  for (const page of pages) {
    const pageTitle = page.name;
    const pageSlug = slugify(pageTitle);
    
    let dbPage = await prisma.servicePage.findFirst({ where: { title: { equals: pageTitle, mode: 'insensitive' } } });
    if (!dbPage) {
      console.log(`[PUSH] Creating Page: ${pageTitle}`);
      const description = await generateDescription(pageTitle, 'page');
      const translations = await autoTranslate({ title: pageTitle, description });

      dbPage = await prisma.servicePage.create({
        data: {
          title: pageTitle,
          slug: pageSlug,
          description: description,
          excerpt: description.substring(0, 50) + '...',
          scene: 'TorusKnotScene',
          translations
        }
      });
    }

    const pagePath = path.join(CONTENT_DIR, page.name);
    const categories = fs.readdirSync(pagePath, { withFileTypes: true }).filter(dirent => dirent.isDirectory());

    for (const cat of categories) {
      const catName = cat.name;
      const catSlug = slugify(`${dbPage.slug}-${catName}`);
      
      let dbCat = await prisma.category.findFirst({ where: { name: { equals: catName, mode: 'insensitive' }, servicePageId: dbPage.id } });
      if (!dbCat) {
        console.log(`[PUSH] Creating Category: ${catName} in ${pageTitle}`);
        const translations = await autoTranslate({ name: catName });

        dbCat = await prisma.category.create({
          data: {
            name: catName,
            slug: catSlug,
            servicePageId: dbPage.id,
            translations
          }
        });
      }

      const catPath = path.join(pagePath, cat.name);
      const projectItems = fs.readdirSync(catPath, { withFileTypes: true });
      const projects = projectItems.filter(dirent => dirent.isDirectory());

      for (const proj of projects) {
        const projTitle = proj.name;
        
        let dbProj = await prisma.project.findFirst({ where: { title: { equals: projTitle, mode: 'insensitive' }, categoryId: dbCat.id }, include: { media: true } });
        if (!dbProj) {
          console.log(`[PUSH] Creating Project: ${projTitle} in ${catName}`);
          const description = await generateDescription(projTitle, 'project');
          const translations = await autoTranslate({ title: projTitle, description });

          dbProj = await prisma.project.create({
            data: {
              title: projTitle,
              description,
              categoryId: dbCat.id,
              translations
            },
            include: { media: true }
          });
        }

        // Upload new media files
        const projPath = path.join(catPath, proj.name);
        const files = fs.readdirSync(projPath, { withFileTypes: true }).filter(f => f.isFile());
        for (const file of files) {
          const ext = path.extname(file.name).toLowerCase();
          if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm'].includes(ext)) {
            // Check if file is already uploaded by checking if url ends with the filename (approximate)
            const isUploaded = dbProj.media.some(m => m.url.includes(encodeURIComponent(file.name)) || m.url.includes(file.name));
            if (!isUploaded) {
              console.log(`[PUSH] Uploading missing media for ${projTitle}: ${file.name}`);
              try {
                const isVideo = ['.mp4', '.webm'].includes(ext);
                const { v2: cloudinary } = require('cloudinary');
                cloudinary.config({
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                    api_key: process.env.CLOUDINARY_API_KEY,
                    api_secret: process.env.CLOUDINARY_API_SECRET,
                });
                const result = await cloudinary.uploader.upload(path.join(projPath, file.name), {
                  folder: 'pixelectro/sync',
                  resource_type: isVideo ? 'video' : 'image'
                });
                
                await prisma.projectMedia.create({
                  data: {
                    url: result.secure_url,
                    type: isVideo ? 'VIDEO' : 'IMAGE',
                    projectId: dbProj.id
                  }
                });
              } catch (err) {
                console.error(`[PUSH] Failed to upload ${file.name}`, err);
              }
            }
          }
        }
      }
    }
  }

  console.log('Push complete.');
  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
