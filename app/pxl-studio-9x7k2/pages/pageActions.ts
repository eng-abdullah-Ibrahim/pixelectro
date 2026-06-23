"use server";
import prisma from '@/lib/prisma';
import { revalidatePath } from "next/cache";

import { generateTranslations } from "../../../lib/translationEngine";

export async function createPage(data: { title: string, description: string, excerpt: string, scene: string, icon: string, contentType?: string, homeImage?: string, homeScene?: string }) {
  const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const count = await prisma.servicePage.count();

  const page = await prisma.servicePage.create({
    data: {
      title: data.title,
      slug,
      description: data.description,
      excerpt: data.excerpt,
      scene: data.scene,
      icon: data.icon,
      contentType: data.contentType || "MEDIA",
      homeImage: data.homeImage,
      homeScene: data.homeScene,
      order: count,
      translations: { en: { title: data.title, description: data.description, excerpt: data.excerpt } }
    }
  });
  revalidatePath('/');
  revalidatePath('/pxl-studio-9x7k2/pages');
  return page.id;
}

export async function deletePage(id: string) {
  await prisma.servicePage.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/pxl-studio-9x7k2/pages');
}

export async function updatePagesOrder(ids: string[]) {
  const updates = ids.map((id, index) => 
    prisma.servicePage.update({ where: { id }, data: { order: index } })
  );
  await prisma.$transaction(updates);
  revalidatePath('/');
  revalidatePath('/pxl-studio-9x7k2/pages');
}

export async function editPage(
  id: string, 
  data: { 
    title: string, 
    description: string, 
    scene: string, 
    icon: string,
    contentType?: string,
    excerpt?: string,
    homeImage?: string,
    homeScene?: string
  }
) {
  const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  await prisma.servicePage.update({
    where: { id },
    data: {
      title: data.title,
      slug,
      description: data.description,
      scene: data.scene,
      icon: data.icon,
      contentType: data.contentType || "MEDIA",
      excerpt: data.excerpt,
      homeImage: data.homeImage,
      homeScene: data.homeScene,
    }
  });
  revalidatePath('/');
  revalidatePath('/pxl-studio-9x7k2/pages');
  return id;
}

export async function togglePageActive(id: string, isActive: boolean) {
  await prisma.servicePage.update({
    where: { id },
    data: { isActive }
  });
  revalidatePath('/');
  revalidatePath('/pxl-studio-9x7k2/pages');
}
