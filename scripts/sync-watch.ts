import { PrismaClient } from '@prisma/client';
import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize services
const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEYS?.split(',')[0] || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const CONTENT_DIR = path.join(process.cwd(), 'content');

// Helper to convert folder name to slug
const slugify = (str: string) => str.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '');

// A simple debounce/lock mechanism to prevent double triggers
const processing = new Set();

async function generateDescription(topic: string, type: 'page' | 'project') {
  try {
    const prompt = type === 'page' 
      ? `Write a professional, catchy English description (about 2 sentences) for a creative agency's service page titled "${topic}". Return only the description text.`
      : `Write a captivating English description (about 3 sentences) for a creative project titled "${topic}". Focus on design, impact, and excellence. Return only the description text.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Error generating description:', error);
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
    translations['en'] = contentObj; // Keep original english
    return translations;
  } catch (err) {
    console.error('Translation error:', err);
    return { en: contentObj, ar: contentObj }; // fallback
  }
}

async function handleAddDir(dirPath: string) {
  const relativePath = path.relative(CONTENT_DIR, dirPath);
  if (!relativePath) return; // Ignore root

  const parts = relativePath.split(path.sep);
  const depth = parts.length;
  
  if (processing.has(dirPath)) return;
  processing.add(dirPath);

  try {
    // 1. PAGE LEVEL
    if (depth === 1) {
      const pageTitle = parts[0];
      const pageSlug = slugify(pageTitle);
      const existing = await prisma.servicePage.findUnique({ where: { slug: pageSlug } });
      
      if (!existing) {
        console.log(`[SYNC] Creating Page: ${pageTitle}`);
        const description = await generateDescription(pageTitle, 'page');
        
        const translations = await autoTranslate({ title: pageTitle, description });

        await prisma.servicePage.create({
          data: {
            title: pageTitle,
            slug: pageSlug,
            description: description,
            excerpt: description.substring(0, 50) + '...',
            scene: 'TorusKnotScene',
            translations: translations
          }
        });
      }
    }
    
    // 2. CATEGORY LEVEL
    else if (depth === 2) {
      const pageSlug = slugify(parts[0]);
      const catName = parts[1];
      const catSlug = slugify(`${pageSlug}-${catName}`);
      
      const page = await prisma.servicePage.findUnique({ where: { slug: pageSlug } });
      if (page) {
        const existing = await prisma.category.findUnique({ where: { slug: catSlug } });
        if (!existing) {
          console.log(`[SYNC] Creating Category: ${catName} in ${page.title}`);
          const translations = await autoTranslate({ name: catName });

          await prisma.category.create({
            data: {
              name: catName,
              slug: catSlug,
              servicePageId: page.id,
              translations
            }
          });
        }
      }
    }

    // 3. PROJECT LEVEL
    else if (depth === 3) {
      const pageSlug = slugify(parts[0]);
      const catSlug = slugify(`${pageSlug}-${parts[1]}`);
      const projTitle = parts[2];
      
      const cat = await prisma.category.findUnique({ where: { slug: catSlug } });
      if (cat) {
        // Check if project exists in this category
        const existing = await prisma.project.findFirst({ 
          where: { title: projTitle, categoryId: cat.id } 
        });

        if (!existing) {
          console.log(`[SYNC] Creating Project: ${projTitle} in ${parts[1]}`);
          const description = await generateDescription(projTitle, 'project');
          
          const translations = await autoTranslate({ title: projTitle, description });

          await prisma.project.create({
            data: {
              title: projTitle,
              description,
              categoryId: cat.id,
              translations
            }
          });
        }
      }
    }
  } catch (err) {
    console.error(`[SYNC ERROR] failed to add dir ${relativePath}:`, err);
  } finally {
    processing.delete(dirPath);
  }
}

async function handleUnlinkDir(dirPath: string) {
    const relativePath = path.relative(CONTENT_DIR, dirPath);
    if (!relativePath) return;
  
    const parts = relativePath.split(path.sep);
    const depth = parts.length;
  
    try {
      if (depth === 1) {
        const pageSlug = slugify(parts[0]);
        await prisma.servicePage.delete({ where: { slug: pageSlug } }).catch(() => {});
        console.log(`[SYNC] Deleted Page: ${parts[0]}`);
      } else if (depth === 2) {
        const pageSlug = slugify(parts[0]);
        const catSlug = slugify(`${pageSlug}-${parts[1]}`);
        await prisma.category.delete({ where: { slug: catSlug } }).catch(() => {});
        console.log(`[SYNC] Deleted Category: ${parts[1]}`);
      } else if (depth === 3) {
        const pageSlug = slugify(parts[0]);
        const catSlug = slugify(`${pageSlug}-${parts[1]}`);
        const projTitle = parts[2];
        const cat = await prisma.category.findUnique({ where: { slug: catSlug } });
        if (cat) {
          await prisma.project.deleteMany({ where: { title: projTitle, categoryId: cat.id } }).catch(() => {});
          console.log(`[SYNC] Deleted Project: ${projTitle}`);
        }
      }
    } catch (err) {
      console.error(`[SYNC ERROR] failed to delete dir ${relativePath}`, err);
    }
}

async function handleAddFile(filePath: string) {
    const relativePath = path.relative(CONTENT_DIR, filePath);
    const parts = relativePath.split(path.sep);
    
    // Only upload files inside project folders (depth 4)
    if (parts.length === 4) {
      if (processing.has(filePath)) return;
      processing.add(filePath);
  
      try {
        const pageSlug = slugify(parts[0]);
        const catSlug = slugify(`${pageSlug}-${parts[1]}`);
        const projTitle = parts[2];
        
        const cat = await prisma.category.findUnique({ where: { slug: catSlug } });
        if (!cat) return;
        
        const proj = await prisma.project.findFirst({ where: { title: projTitle, categoryId: cat.id } });
        if (!proj) return;
  
        // Check if file is image or video
        const ext = path.extname(filePath).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm'].includes(ext)) {
          console.log(`[SYNC] Uploading media to Cloudinary: ${parts[3]}`);
          
          const isVideo = ['.mp4', '.webm'].includes(ext);
          
          const result = await cloudinary.uploader.upload(filePath, {
            folder: 'pixelectro/sync',
            resource_type: isVideo ? 'video' : 'image'
          });
          
          await prisma.projectMedia.create({
            data: {
              url: result.secure_url,
              type: isVideo ? 'VIDEO' : 'IMAGE',
              projectId: proj.id
            }
          });
          console.log(`[SYNC] Added media to project ${projTitle}`);
        }
      } catch (err) {
        console.error(`[SYNC ERROR] failed to upload file ${filePath}:`, err);
      } finally {
        processing.delete(filePath);
      }
    }
}

// Ensure dir exists
if (!fs.existsSync(CONTENT_DIR)) {
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
}

console.log(`Watching for changes in ${CONTENT_DIR}...`);

const watcher = chokidar.watch(CONTENT_DIR, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
  ignoreInitial: true // Do not process existing files on startup
});

watcher
  .on('addDir', handleAddDir)
  .on('unlinkDir', handleUnlinkDir)
  .on('add', handleAddFile);

// Keep the process alive
setInterval(() => {}, 1 << 30);
