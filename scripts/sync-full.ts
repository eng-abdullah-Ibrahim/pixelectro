import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();
const CONTENT_DIR = path.join(process.cwd(), 'content');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEYS?.split(',')[0] || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const slugify = (str: string) => str.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w-]+/g, '');

async function generateDescription(topic: string, type: 'page' | 'project') {
  try {
    const prompt = type === 'page' 
      ? `Write a professional, catchy English description (exactly 1 sentence) for a creative agency's service page titled "${topic}". Return only the description text.`
      : `Write a captivating English description (maximum 10 words, just half a sentence) for a creative project titled "${topic}". Focus on the brand broadly. Return only the description text.`;
    
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
  console.log('Running STRICT synchronization. Local folders are the absolute source of truth...');
  
  if (!fs.existsSync(CONTENT_DIR)) return;

  const localPages = fs.readdirSync(CONTENT_DIR, { withFileTypes: true }).filter(dirent => dirent.isDirectory());
  const localPageNames = localPages.map(p => p.name.toLowerCase());

  // 1. Delete Pages in DB that don't exist locally
  const dbPagesAll = await prisma.servicePage.findMany();
  for (const dbP of dbPagesAll) {
    if (!localPageNames.includes(dbP.title.toLowerCase())) {
      console.log(`[SYNC DELETE] Removing Page from DB: ${dbP.title}`);
      await prisma.servicePage.delete({ where: { id: dbP.id } });
    }
  }

  // 2. Add or Update Pages
  for (const page of localPages) {
    const pageTitle = page.name;
    const pageSlug = slugify(pageTitle);
    
    let dbPage = await prisma.servicePage.findFirst({ where: { title: { equals: pageTitle, mode: 'insensitive' } } });
    if (!dbPage) {
      console.log(`[SYNC ADD] Creating Page: ${pageTitle}`);
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
    const localCategories = fs.readdirSync(pagePath, { withFileTypes: true }).filter(dirent => dirent.isDirectory());
    const localCategoryNames = localCategories.map(c => c.name.toLowerCase());

    // Delete Categories in DB that don't exist locally for this page
    const dbCatsAll = await prisma.category.findMany({ where: { servicePageId: dbPage.id } });
    for (const dbC of dbCatsAll) {
      if (!localCategoryNames.includes(dbC.name.toLowerCase())) {
        console.log(`[SYNC DELETE] Removing Category from DB: ${dbC.name}`);
        await prisma.category.delete({ where: { id: dbC.id } });
      }
    }

    // Add or Update Categories
    for (const cat of localCategories) {
      const catName = cat.name;
      const catSlug = slugify(`${dbPage.slug}-${catName}`);
      
      let dbCat = await prisma.category.findFirst({ where: { name: { equals: catName, mode: 'insensitive' }, servicePageId: dbPage.id } });
      if (!dbCat) {
        console.log(`[SYNC ADD] Creating Category: ${catName} in ${pageTitle}`);
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
      const localProjects = projectItems.filter(dirent => dirent.isDirectory());
      const localProjectNames = localProjects.map(p => p.name.toLowerCase());

      // Delete Projects in DB that don't exist locally for this category
      const dbProjsAll = await prisma.project.findMany({ where: { categoryId: dbCat.id } });
      for (const dbPr of dbProjsAll) {
        if (!localProjectNames.includes(dbPr.title.toLowerCase())) {
          console.log(`[SYNC DELETE] Removing Project from DB: ${dbPr.title}`);
          await prisma.project.delete({ where: { id: dbPr.id } });
        }
      }

      // Add or Update Projects
      for (const proj of localProjects) {
        const projTitle = proj.name;
        
        let dbProj = await prisma.project.findFirst({ where: { title: { equals: projTitle, mode: 'insensitive' }, categoryId: dbCat.id }, include: { media: true } });
        if (!dbProj) {
          console.log(`[SYNC ADD] Creating Project: ${projTitle} in ${catName}`);
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

        // Sync Media
        const projPath = path.join(catPath, proj.name);
        const files = fs.readdirSync(projPath, { withFileTypes: true }).filter(f => f.isFile());
        
        // Allowed extensions
        const validFiles = files.filter(f => {
            const ext = path.extname(f.name).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm'].includes(ext);
        });

        const crypto = require('crypto');
        const localFileHashes = validFiles.map(f => crypto.createHash('md5').update(f.name).digest('hex'));

        // Delete DB Media if file is removed locally
        for (const m of dbProj.media) {
            // Check if this media's URL contains any of our local file hashes
            const fileStillExists = localFileHashes.some(hash => m.url.includes(hash));
            if (!fileStillExists && m.url.includes('pixelectro/sync')) {
                console.log(`[SYNC DELETE] Removing Media from DB: ${m.url}`);
                await prisma.projectMedia.delete({ where: { id: m.id } });
            }
        }

        // Upload new media files
        for (const file of validFiles) {
          const ext = path.extname(file.name).toLowerCase();
          const fileHash = crypto.createHash('md5').update(file.name).digest('hex');
          const isUploaded = dbProj.media.some(m => m.url.includes(fileHash));
          
          if (!isUploaded) {
            console.log(`[SYNC ADD] Uploading missing media for ${projTitle}: ${file.name}`);
            try {
              const isVideo = ['.mp4', '.webm'].includes(ext);
              const result = await cloudinary.uploader.upload(path.join(projPath, file.name), {
                folder: 'pixelectro/sync',
                public_id: fileHash,
                overwrite: true,
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
              console.error(`[SYNC ERROR] Failed to upload ${file.name}`, err);
            }
          }
        }
      }
    }
  }

  console.log('Strict Synchronization Complete!');
  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
