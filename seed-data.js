require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { translateContentBulk } = require('./lib/translationEngine');

async function seed() {
  console.log('Seeding Database...');

  // 1. Add Prominent Clients
  console.log('Adding Prominent Clients...');
  await prisma.prominentClient.deleteMany();
  await prisma.prominentClient.createMany({
    data: [
      { name: 'Apple', logoUrl: 'https://res.cloudinary.com/dsgtmnmta/image/upload/v1738240000/apple_logo.png', link: 'https://apple.com', order: 1 },
      { name: 'Nike', logoUrl: 'https://res.cloudinary.com/dsgtmnmta/image/upload/v1738240001/nike_logo.png', link: 'https://nike.com', order: 2 },
      { name: 'Samsung', logoUrl: 'https://res.cloudinary.com/dsgtmnmta/image/upload/v1738240002/samsung_logo.png', link: 'https://samsung.com', order: 3 },
      { name: 'Mercedes', logoUrl: 'https://res.cloudinary.com/dsgtmnmta/image/upload/v1738240003/mercedes_logo.png', link: 'https://mercedes.com', order: 4 },
      { name: 'RedBull', logoUrl: 'https://res.cloudinary.com/dsgtmnmta/image/upload/v1738240004/redbull_logo.png', link: 'https://redbull.com', order: 5 },
    ]
  });

  // 2. Translate Service Pages
  console.log('Translating Service Pages...');
  const services = await prisma.servicePage.findMany();
  for (const svc of services) {
    console.log(`Translating: ${svc.title}`);
    const fieldsToTranslate = {
      title: svc.title,
      description: svc.description || '',
      excerpt: svc.excerpt || ''
    };
    try {
      const translatedData = await translateContentBulk(fieldsToTranslate, 'Service Page');
      await prisma.servicePage.update({
        where: { id: svc.id },
        data: { translations: translatedData }
      });
      console.log(`✓ Translated ${svc.title}`);
    } catch (e) {
      console.error(`Failed to translate ${svc.title}:`, e);
    }
  }

  console.log('Done!');
  await prisma.$disconnect();
}

seed();
