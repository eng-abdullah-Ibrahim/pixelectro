const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const CONTENT_DIR = path.join(process.cwd(), 'content');

// Helper to sanitize folder names
const sanitize = (name) => name.replace(/[<>:"/\\|?*]+/g, '').trim();

async function run() {
  console.log('Fetching database state...');
  
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
    console.log(`Created ${CONTENT_DIR}`);
  }

  const pages = await prisma.servicePage.findMany({
    include: {
      categories: {
        include: {
          projects: {
            include: {
              media: true
            }
          }
        }
      }
    }
  });

  console.log(`Found ${pages.length} pages.`);

  for (const page of pages) {
    const pageDir = path.join(CONTENT_DIR, sanitize(page.title || page.slug));
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
      console.log(`Created Page Folder: ${pageDir}`);
    }

    for (const cat of page.categories) {
      const catDir = path.join(pageDir, sanitize(cat.name || cat.slug));
      if (!fs.existsSync(catDir)) {
        fs.mkdirSync(catDir, { recursive: true });
        console.log(`Created Category Folder: ${catDir}`);
      }

      for (const proj of cat.projects) {
        const projDir = path.join(catDir, sanitize(proj.title));
        if (!fs.existsSync(projDir)) {
          fs.mkdirSync(projDir, { recursive: true });
          console.log(`Created Project Folder: ${projDir}`);
        }
        
        // Download media files into the project folder
        for (const media of proj.media) {
          const fileName = media.url.split('/').pop().split('?')[0]; // Extract filename from URL
          const filePath = path.join(projDir, fileName);
          if (!fs.existsSync(filePath)) {
            console.log(`Downloading media for ${proj.title}: ${fileName}...`);
            try {
              const res = await fetch(media.url);
              if (res.ok) {
                const buffer = await res.arrayBuffer();
                fs.writeFileSync(filePath, Buffer.from(buffer));
              }
            } catch (err) {
              console.error(`Failed to download ${media.url}`);
            }
          }
        }
      }
    }
  }

  console.log('Pull complete.');
  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
