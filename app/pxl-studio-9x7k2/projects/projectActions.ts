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
