import prisma from '@/lib/prisma';
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import ProjectsManager from "./ProjectsManager";
import AddProjectForm from "./AddProjectForm";

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

  // Handle generic delete POST
  async function deleteProjectServer(formData: FormData) {
    "use server";
    const id = formData.get('id') as string;
    await prisma.project.delete({ where: { id } });
    revalidatePath('/pxl-studio-9x7k2/projects');
    revalidatePath('/');
    redirect('/pxl-studio-9x7k2/projects');
  }

  return (
    <>
      <div className="pageHeader">
        <div>
          <div className="pageTitle">Projects</div>
          <div className="pageSubtitle">Manage all portfolio projects. Filter by Category to enable Drag & Drop reordering.</div>
        </div>
      </div>

      <AddProjectForm categories={categories} servicePages={servicePages} />

      {/* Implicitly render a hidden form endpoint for deletion by ProjectsManager */}
      <form id="deleteForm" action={deleteProjectServer} style={{ display: 'none' }}>
        <input type="hidden" name="id" id="deleteId" />
      </form>

      <ProjectsManager initialProjects={projects} categories={categories} servicePages={servicePages} />
    </>
  );
}
