"use server";
import prisma from '@/lib/prisma';
import { revalidatePath } from "next/cache";

export async function createClient(data: { name: string; logoUrl: string; link: string }) {
  const count = await prisma.prominentClient.count();
  await prisma.prominentClient.create({
    data: {
      name: data.name,
      logoUrl: data.logoUrl,
      link: data.link,
      order: count,
    },
  });
  revalidatePath("/");
  revalidatePath("/pxl-studio-9x7k2/clients");
}

export async function deleteClient(id: string) {
  await prisma.prominentClient.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/pxl-studio-9x7k2/clients");
}

export async function updateClientsOrder(ids: string[]) {
  const updates = ids.map((id, index) =>
    prisma.prominentClient.update({ where: { id }, data: { order: index } })
  );
  await prisma.$transaction(updates);
  revalidatePath("/");
  revalidatePath("/pxl-studio-9x7k2/clients");
}

export async function editClient(id: string, data: { name: string; logoUrl: string; link: string }) {
  await prisma.prominentClient.update({
    where: { id },
    data,
  });
  revalidatePath("/");
  revalidatePath("/pxl-studio-9x7k2/clients");
}
