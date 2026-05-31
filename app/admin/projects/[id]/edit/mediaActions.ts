"use server";

import prisma from "../../../../../lib/prisma";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

export async function updateMediaOrder(projectId: string, orderedIds: string[]) {
  // Update the order sequentially
  for (let i = 0; i < orderedIds.length; i++) {
    await prisma.projectMedia.update({
      where: { id: orderedIds[i] },
      data: { order: i }
    });
  }
  revalidatePath(`/admin/projects/${projectId}/edit`);
  revalidatePath(`/`);
}

export async function deleteMediaItem(mediaId: string, projectId: string) {
  const media = await prisma.projectMedia.findUnique({ where: { id: mediaId } });
  if (media) {
    if (media.url && media.url.startsWith("/uploads/")) {
      const publicDir = path.join(process.cwd(), "public");
      try { await fs.unlink(path.join(publicDir, media.url)); } catch (e) {}
    }
    await prisma.projectMedia.delete({ where: { id: mediaId } });
  }
  revalidatePath(`/admin/projects/${projectId}/edit`);
  revalidatePath(`/`);
}

export async function uploadNewMedia(projectId: string, formData: FormData) {
  const mediaFiles = formData.getAll("mediaFiles") as File[];
  const mediaItems: { url: string; type: string; projectId: string; order: number }[] = [];

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  try { await fs.mkdir(uploadsDir, { recursive: true }); } catch (e) {}

  // Find current max order
  const maxOrderMedia = await prisma.projectMedia.findFirst({
    where: { projectId },
    orderBy: { order: "desc" },
  });
  let currentOrder = maxOrderMedia ? maxOrderMedia.order + 1 : 0;

  for (const file of mediaFiles) {
    if (file && file.size > 0) {
      const ext = path.extname(file.name) || "";
      const filename = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;
      const bytes = await file.arrayBuffer();
      await fs.writeFile(path.join(uploadsDir, filename), Buffer.from(bytes));
      const fileType = file.type.startsWith("video/") ? "VIDEO" : "IMAGE";
      mediaItems.push({ url: `/uploads/${filename}`, type: fileType, projectId, order: currentOrder });
      currentOrder++;
    }
  }

  if (mediaItems.length > 0) {
    await prisma.projectMedia.createMany({ data: mediaItems });
  }
  
  revalidatePath(`/admin/projects/${projectId}/edit`);
  revalidatePath(`/`);

  // Return the newly created items to the client so it can update state immediately without full refresh
  return await prisma.projectMedia.findMany({
    where: { projectId },
    orderBy: { order: 'asc' }
  });
}
