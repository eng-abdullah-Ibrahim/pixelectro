"use server";

import prisma from "../../../../../lib/prisma";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    // If it's a Cloudinary URL, we can extract the public_id and delete it
    if (media.url && media.url.includes("cloudinary.com")) {
      try {
        // Extract public ID from Cloudinary URL (e.g., .../upload/v1234/pixelectro/projects/xyz.jpg)
        const parts = media.url.split('/');
        const fileWithExt = parts[parts.length - 1];
        const folderPath = parts.slice(parts.indexOf('upload') + 2, parts.length - 1).join('/');
        const publicId = `${folderPath ? folderPath + '/' : ''}${fileWithExt.split('.')[0]}`;
        
        await cloudinary.uploader.destroy(publicId, {
          resource_type: media.type === 'VIDEO' ? 'video' : 'image',
        });
      } catch (e) {
        console.error("Failed to delete from Cloudinary:", e);
      }
    }

    await prisma.projectMedia.delete({ where: { id: mediaId } });
  }
  revalidatePath(`/admin/projects/${projectId}/edit`);
  revalidatePath(`/`);
}

export async function uploadNewMedia(projectId: string, formData: FormData) {
  const mediaFiles = formData.getAll("mediaFiles") as File[];
  const mediaItems: { url: string; type: string; projectId: string; order: number }[] = [];

  // Find current max order
  const maxOrderMedia = await prisma.projectMedia.findFirst({
    where: { projectId },
    orderBy: { order: "desc" },
  });
  let currentOrder = maxOrderMedia ? maxOrderMedia.order + 1 : 0;

  for (const file of mediaFiles) {
    if (file && file.size > 0) {
      const isVideo = file.type.startsWith("video/");
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      try {
        // Upload to Cloudinary using a stream (avoids Read-Only file system errors on Vercel)
        const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "pixelectro/projects",
              resource_type: isVideo ? "video" : "image",
              quality: "auto",
              fetch_format: "auto",
            },
            (error, result) => {
              if (error || !result) reject(error ?? new Error("Upload failed"));
              else resolve(result as { secure_url: string });
            }
          );
          stream.end(buffer);
        });

        const fileType = isVideo ? "VIDEO" : "IMAGE";
        
        mediaItems.push({ 
          url: result.secure_url, 
          type: fileType, 
          projectId, 
          order: currentOrder 
        });
        currentOrder++;
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error("Failed to upload media to Cloudinary.");
      }
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
