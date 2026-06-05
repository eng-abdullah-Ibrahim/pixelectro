import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateTranslations } from '../../../../lib/translationEngine';

export async function GET() {
  try {
    // 1. Add Prominent Clients
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
    const services = await prisma.servicePage.findMany();
    for (const svc of services) {
      const fieldsToTranslate = {
        title: svc.title,
        description: svc.description || '',
        excerpt: svc.excerpt || ''
      };
      
      const translatedData = await generateTranslations(fieldsToTranslate);
      await prisma.servicePage.update({
        where: { id: svc.id },
        data: { translations: translatedData }
      });
    }

    return NextResponse.json({ success: true, message: "Seed completed successfully." });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
