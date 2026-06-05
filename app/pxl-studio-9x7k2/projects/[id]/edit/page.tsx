import prisma from '@/lib/prisma';
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { notFound, redirect } from "next/navigation";
import MediaManager from "./MediaManager";
import DescriptionEditor from "../../../components/DescriptionEditor";

import { generateTranslations } from "../../../../../lib/translationEngine";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { media: { orderBy: { order: "asc" } } },
  });

  if (!project) return notFound();

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  async function updateProject(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId") as string;
    const fakeLikes = parseInt(formData.get("fakeLikes") as string || "0", 10);
    const fakeViews = parseInt(formData.get("fakeViews") as string || "0", 10);
    const fakeShares = parseInt(formData.get("fakeShares") as string || "0", 10);
    
    const translations = await generateTranslations({
      title,
      description
    });

    await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        categoryId,
        fakeLikes,
        fakeViews,
        fakeShares,
        translations
      },
    });

    revalidatePath("/pxl-studio-9x7k2/projects");
    revalidatePath(`/pxl-studio-9x7k2/projects/${id}/edit`);
    revalidatePath(`/`);
    redirect("/pxl-studio-9x7k2/projects");
  }

  return (
    <>
      <div className="pageHeader">
        <div>
          <div className="pageTitle">Edit Project</div>
          <div className="pageSubtitle">Update details and manage media for {project.title}</div>
        </div>
        <Link href="/pxl-studio-9x7k2/projects" className="btnGhost">← Back</Link>
      </div>

      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="cardBody">
          <form action={updateProject}>
            <div className="formGrid">
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label className="label">Project Title *</label>
                <input type="text" name="title" defaultValue={project.title} required className="input" />
              </div>
              
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label className="label">Description</label>
                <DescriptionEditor initialValue={project.description || ""} projectId={project.id} />
              </div>

              <div className="field">
                <label className="label">Category *</label>
                <select name="categoryId" defaultValue={project.categoryId} className="select" required>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label">Mock Likes</label>
                <input name="fakeLikes" type="number" min="0" defaultValue={project.fakeLikes || 0} className="input" required />
              </div>

              <div className="field">
                <label className="label">Mock Views</label>
                <input name="fakeViews" type="number" min="0" defaultValue={project.fakeViews || 0} className="input" required />
              </div>

              <div className="field">
                <label className="label">Mock Shares</label>
                <input name="fakeShares" type="number" min="0" defaultValue={project.fakeShares || 0} className="input" required />
              </div>


            </div>

            <div className="formActions" style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
              <button type="submit" className="btnPrimary">Save Project Details</button>
              <button type="reset" className="btnGhost">Discard Changes</button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="cardBody">
          <MediaManager projectId={project.id} initialMedia={project.media} />
        </div>
      </div>
    </>
  );
}
