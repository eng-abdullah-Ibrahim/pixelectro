"use server";
import prisma from '@/lib/prisma';
import { revalidatePath } from "next/cache";

export async function updateProjectsOrder(ids: string[]) {
  const updates = ids.map((id, index) => 
    prisma.project.update({ where: { id }, data: { order: index } })
  );
  await prisma.$transaction(updates);
  revalidatePath('/');
  revalidatePath('/pxl-studio-9x7k2/projects');
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/pxl-studio-9x7k2/projects');
}

export async function toggleProjectActive(id: string, isActive: boolean) {
  await prisma.project.update({
    where: { id },
    data: { isActive }
  });
  revalidatePath('/');
  revalidatePath('/pxl-studio-9x7k2/projects');
}

export async function createDraftProjectBase(formData: FormData) {
  const title       = formData.get('title') as string;
  const description = formData.get('description') as string;
  const categoryId  = formData.get('categoryId') as string;
  const fakeLikes   = parseInt(formData.get('fakeLikes') as string || "0", 10);
  const fakeViews   = parseInt(formData.get('fakeViews') as string || "0", 10);
  const fakeShares  = parseInt(formData.get('fakeShares') as string || "0", 10);
  
  const count = await prisma.project.count({ where: { categoryId } });

  const project = await prisma.project.create({ 
    data: { 
      title, 
      description, 
      categoryId, 
      order: count, 
      fakeLikes, 
      fakeViews, 
      fakeShares, 
      // empty translations initially, background task will fill it
      translations: { en: { title, description } } 
    } 
  });

  return project.id;
}

export async function updateProjectBase(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string;
  const fakeLikes = parseInt(formData.get("fakeLikes") as string || "0", 10);
  const fakeViews = parseInt(formData.get("fakeViews") as string || "0", 10);
  const fakeShares = parseInt(formData.get("fakeShares") as string || "0", 10);
  
  await prisma.project.update({
    where: { id },
    data: { title, description, categoryId, fakeLikes, fakeViews, fakeShares },
  });

  return true;
}
