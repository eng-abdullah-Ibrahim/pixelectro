import prisma from '@/lib/prisma';
import Link from "next/link";
import { notFound } from "next/navigation";
import MediaManager from "./MediaManager";
import EditProjectForm from "./EditProjectForm";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { media: { orderBy: { order: "asc" } } },
  });

  if (!project) return notFound();

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <>
      <div className="pageHeader">
        <div>
          <div className="pageTitle">Edit Project</div>
          <div className="pageSubtitle">Update the project details or manage media.</div>
        </div>
        <Link href="/pxl-studio-9x7k2/projects" className="btnGhost">← Back to Projects</Link>
      </div>
      
      <EditProjectForm project={project} categories={categories} />

      <div className="card">
        <div className="cardBody">
          <MediaManager projectId={project.id} initialMedia={project.media} />
        </div>
      </div>
    </>
  );
}
