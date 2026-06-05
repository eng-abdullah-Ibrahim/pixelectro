import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createTestimonial } from "../../pxl-studio-9x7k2/testimonials/testimonialActions";

export async function POST(req: Request) {
  try {
    const { authorName, content } = await req.json();

    if (!authorName || !content) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Get IP for server-side rate limit
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] || 
                headersList.get("x-real-ip") || 
                "unknown";

    const comment = await createTestimonial({ authorName, content, ipAddress: ip });
    return NextResponse.json({ success: true, id: comment.id });
  } catch (e: any) {
    if (e.message === "RATE_LIMITED") {
      return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
    }
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const prisma = (await import("../../../lib/prisma")).default;
  const comment = await prisma.testimonialComment.findUnique({ where: { id } });
  
  if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ authorName: comment.authorName, content: comment.content });
}

export async function PUT(req: Request) {
  try {
    const { id, content } = await req.json();
    if (!id || !content) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const prisma = (await import("../../../lib/prisma")).default;
    
    // Enforce re-review on edit
    await prisma.testimonialComment.update({
      where: { id },
      data: { content, isHidden: true }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}
