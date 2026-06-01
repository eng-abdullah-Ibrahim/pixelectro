import prisma from "../../../lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import ProjectsManager from "./ProjectsManager";

export default async function ProjectsPage() {
  const servicePages = await prisma.servicePage.findMany({ orderBy: { order: 'asc' } });
  const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } });
  const projects = await prisma.project.findMany({
    include: { 
      category: { include: { servicePage: true } }, 
      media: { orderBy: { order: 'asc' } } 
    },
    orderBy: { id: 'desc' },
  });

  async function createDraftProject(formData: FormData) {
    "use server";
    const title       = formData.get('title') as string;
    const description = formData.get('description') as string;
    const categoryId  = formData.get('categoryId') as string;
    const fakeLikes   = parseInt(formData.get('fakeLikes') as string || "0", 10);
    const fakeViews   = parseInt(formData.get('fakeViews') as string || "0", 10);
    const fakeShares  = parseInt(formData.get('fakeShares') as string || "0", 10);
    
    const count = await prisma.project.count({ where: { categoryId } });
    const project = await prisma.project.create({ 
      data: { title, description, categoryId, order: count, fakeLikes, fakeViews, fakeShares } 
    });
    
    redirect(`/admin/projects/${project.id}/edit`);
  }

  // Handle generic delete POST
  async function deleteProjectServer(formData: FormData) {
    "use server";
    const id = formData.get('id') as string;
    await prisma.project.delete({ where: { id } });
    revalidatePath('/admin/projects');
    revalidatePath('/');
    redirect('/admin/projects');
  }

  return (
    <>
      <div className="pageHeader">
        <div>
          <div className="pageTitle">Projects</div>
          <div className="pageSubtitle">Manage all portfolio projects. Filter by Category to enable Drag & Drop reordering.</div>
        </div>
      </div>

      {/* ── Add Project Form ── */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="cardHeader">
          <div className="cardTitle">Add New Project</div>
        </div>
        <div className="cardBody">
          <form action={createDraftProject}>
            <div className="formGrid">
              <div className="field">
                <label className="label">Project Title *</label>
                <input name="title" className="input" placeholder="e.g. Brand Identity for ACME" required />
              </div>

              <div className="field">
                <label className="label">Category *</label>
                <select name="categoryId" className="select" required>
                  <option value="">— Select Category —</option>
                  {servicePages.map(page => (
                    <optgroup key={page.id} label={page.title}>
                      {categories.filter(c => c.servicePageId === page.id).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label">Mock Likes</label>
                <input name="fakeLikes" type="number" min="0" defaultValue="0" className="input" />
              </div>

              <div className="field">
                <label className="label">Mock Views</label>
                <input name="fakeViews" type="number" min="0" defaultValue="0" className="input" />
              </div>

              <div className="field">
                <label className="label">Mock Shares</label>
                <input name="fakeShares" type="number" min="0" defaultValue="0" className="input" />
              </div>

              <div className="field formGridFull">
                <label className="label">Description (Optional)</label>
                <textarea name="description" className="textarea" placeholder="Brief description of this project…" />
              </div>
            </div>
            <div className="formActions">
              <button type="submit" className="btnPrimary">Save & Continue to Media Uploader →</button>
            </div>
          </form>
        </div>
      </div>

      {/* Implicitly render a hidden form endpoint for deletion by ProjectsManager */}
      <form id="deleteForm" action={deleteProjectServer} style={{ display: 'none' }}>
        <input type="hidden" name="id" id="deleteId" />
      </form>

      <ProjectsManager initialProjects={projects} categories={categories} servicePages={servicePages} />
    </>
  );
}
