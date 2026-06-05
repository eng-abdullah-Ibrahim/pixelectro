import prisma from '@/lib/prisma';
import { redirect, notFound } from "next/navigation";
import { editCategory } from "../../categoryActions";
import Link from "next/link";

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

  async function handleEdit(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const servicePageId = formData.get("servicePageId") as string;
    await editCategory(categoryId, { name, servicePageId });
    redirect("/pxl-studio-9x7k2/categories");
  }

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
          <form action={handleEdit}>
            <div className="formGrid">
              <div className="field">
                <label className="label">Category Name *</label>
                <input name="name" className="input" defaultValue={category.name} required />
              </div>

              <div className="field formGridFull">
                <label className="label">Assign to Service Page *</label>
                <select name="servicePageId" className="select" required defaultValue={category.servicePageId}>
                  {servicePages.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="formActions" style={{ display: "flex", gap: "1rem" }}>
              <button type="submit" className="btnPrimary">Save Changes</button>
              <button type="reset" className="btnGhost">Discard Changes</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
