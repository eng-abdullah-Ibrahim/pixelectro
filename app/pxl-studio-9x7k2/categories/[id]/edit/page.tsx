import prisma from '@/lib/prisma';
import { notFound } from "next/navigation";
import Link from "next/link";
import EditCategoryForm from "./EditCategoryForm";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const categoryId = resolvedParams.id;
  
  const category = await prisma.category.findUnique({
    where: { id: categoryId }
  });

  if (!category) notFound();

  const servicePages = await prisma.servicePage.findMany({
    orderBy: { order: 'asc' },
    select: { id: true, title: true }
  });

  return (
    <>
      <div className="pageHeader">
        <div>
          <div className="pageTitle">Edit Category</div>
          <div className="pageSubtitle">Update the name or change the assigned service page.</div>
        </div>
        <Link href="/pxl-studio-9x7k2/categories" className="btnGhost">← Back to Categories</Link>
      </div>

      <div className="card">
        <div className="cardHeader">
          <div className="cardTitle">Category Details</div>
        </div>
        <div className="cardBody">
          <EditCategoryForm category={category} servicePages={servicePages} />
        </div>
      </div>
    </>
  );
}
