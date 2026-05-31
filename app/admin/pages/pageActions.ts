"use server";
import prisma from "../../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPage(data: { title: string, description: string, scene: string, icon: string }) {
  const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const count = await prisma.servicePage.count();
  await prisma.servicePage.create({
    data: {
      title: data.title,
      slug,
      description: data.description,
      scene: data.scene,
      icon: data.icon,
      order: count
    }
  });
  revalidatePath('/');
  revalidatePath('/admin/pages');
}

export async function deletePage(id: string) {
  await prisma.servicePage.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/admin/pages');
}

export async function updatePagesOrder(ids: string[]) {
  const updates = ids.map((id, index) => 
    prisma.servicePage.update({ where: { id }, data: { order: index } })
  );
  await prisma.$transaction(updates);
  revalidatePath('/');
  revalidatePath('/admin/pages');
}

export async function editPage(id: string, data: { title: string, description: string, scene: string, icon: string }) {
  const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  await prisma.servicePage.update({
    where: { id },
    data: {
      title: data.title,
      slug,
      description: data.description,
      scene: data.scene,
      icon: data.icon,
    }
  });
  revalidatePath('/');
  revalidatePath('/admin/pages');
}

export async function togglePageActive(id: string, isActive: boolean) {
  await prisma.servicePage.update({
    where: { id },
    data: { isActive }
  });
  revalidatePath('/');
  revalidatePath('/admin/pages');
}
