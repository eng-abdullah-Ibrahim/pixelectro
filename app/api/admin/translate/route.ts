import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { generateTranslations } from "../../../../lib/translationEngine";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, type, title, description, name, quote, body: contentBody } = body;

    let translations;

    if (type === 'project') {
      translations = await generateTranslations({ title, description });
      await prisma.project.update({ where: { id }, data: { translations } });
    } else if (type === 'category') {
      translations = await generateTranslations({ name, description });
      await prisma.category.update({ where: { id }, data: { translations } });
    } else if (type === 'servicePage') {
      translations = await generateTranslations({ title, description });
      await prisma.servicePage.update({ where: { id }, data: { translations } });
    } else {
      return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Translation background task error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
