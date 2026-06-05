"use server";
import prisma from '@/lib/prisma';
import { revalidatePath } from "next/cache";

export async function createTestimonial(data: {
  authorName: string;
  content: string;
  ipAddress?: string;
}) {
  // Basic spam: check if same IP submitted in last 24h
  if (data.ipAddress) {
    const recent = await prisma.testimonialComment.findFirst({
      where: {
        ipAddress: data.ipAddress,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });
    if (recent) throw new Error("RATE_LIMITED");
  }

  const comment = await prisma.testimonialComment.create({
    data: {
      authorName: data.authorName,
      content: data.content,
      ipAddress: data.ipAddress,
      isHidden: true, // Requires manual approval by default
    },
  });
  revalidatePath("/testimonials");
  return comment;
}

export async function approveComment(id: string) {
  await prisma.testimonialComment.update({
    where: { id },
    data: { isHidden: false },
  });
  revalidatePath("/testimonials");
  revalidatePath("/admin/testimonials");
}

export async function hideComment(id: string) {
  await prisma.testimonialComment.update({
    where: { id },
    data: { isHidden: true },
  });
  revalidatePath("/testimonials");
  revalidatePath("/admin/testimonials");
}

export async function deleteComment(id: string) {
  await prisma.testimonialComment.delete({ where: { id } });
  revalidatePath("/testimonials");
  revalidatePath("/admin/testimonials");
}
