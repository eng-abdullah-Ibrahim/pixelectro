import prisma from "../../../lib/prisma";
import CategoriesManager from "./CategoriesManager";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: { 
      servicePage: true,
      _count: { select: { projects: true } } 
    },
  });

  const servicePages = await prisma.servicePage.findMany({
    orderBy: { order: 'asc' },
    select: { id: true, title: true }
  });

  return (
    <>
      <div className="pageHeader">
        <div>
          <div className="pageTitle">Categories</div>
          <div className="pageSubtitle">Organize your projects into categories. Select a service page to reorder its categories.</div>
        </div>
      </div>
      
      <CategoriesManager initialCategories={categories} servicePages={servicePages} />
    </>
  );
}
