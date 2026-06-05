"use server";
import prisma from '@/lib/prisma';
import { revalidatePath } from "next/cache";

import { generateTranslations } from "../../../lib/translationEngine";

export async function createCategory(data: { name: string, servicePageId: string }) {
  const slug = data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const count = await prisma.category.count({ where: { servicePageId: data.servicePageId } });
  
  const translations = await generateTranslations({ title: data.name });

  await prisma.category.create({
    data: {
      name: data.name,
      slug,
      servicePageId: data.servicePageId,
      order: count,
      translations
    }
  });
  
  revalidatePath('/');
  revalidatePath('/admin/categories');
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/admin/categories');
}

export async function updateCategoriesOrder(ids: string[]) {
  const updates = ids.map((id, index) => 
    prisma.category.update({ where: { id }, data: { order: index } })
  );
  await prisma.$transaction(updates);
  revalidatePath('/');
  revalidatePath('/admin/categories');
}

export async function editCategory(id: string, data: { name: string, servicePageId: string }) {
  const slug = data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  
  const translations = await generateTranslations({ title: data.name });

  await prisma.category.update({
    where: { id },
    data: { name: data.name, slug, servicePageId: data.servicePageId, translations }
  });
  revalidatePath('/');
  revalidatePath('/admin/categories');
}

export async function toggleCategoryActive(id: string, isActive: boolean) {
  await prisma.category.update({
    where: { id },
    data: { isActive }
  });
  revalidatePath('/');
  revalidatePath('/admin/categories');
}
