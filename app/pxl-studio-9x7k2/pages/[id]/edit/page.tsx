import prisma from '@/lib/prisma';
import { notFound } from "next/navigation";
import Link from "next/link";
import EditPageForm from "./EditPageForm";

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const pageId = resolvedParams.id;
  
  const page = await prisma.servicePage.findUnique({
    where: { id: pageId }
  });

  if (!page) notFound();

  return (
    <>
      <div className="pageHeader">
        <div>
          <div className="pageTitle">Edit Page</div>
          <div className="pageSubtitle">Update the page details, icon, or 3D scene.</div>
        </div>
        <Link href="/pxl-studio-9x7k2/pages" className="btnGhost">← Back to Pages</Link>
      </div>

      <div className="card">
        <div className="cardHeader">
          <div className="cardTitle">Page Details</div>
        </div>
        <div className="cardBody">
          <EditPageForm page={page} />
        </div>
      </div>
    </>
  );
}
