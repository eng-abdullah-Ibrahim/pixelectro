import prisma from "../../../lib/prisma";
import PagesManager from "./PagesManager";

export default async function PagesPage() {
  const pages = await prisma.servicePage.findMany({
    orderBy: { order: 'asc' },
    include: { categories: true }
  });

  return (
    <>
      <div className="pageHeader">
        <div>
          <div className="pageTitle">Service Pages</div>
          <div className="pageSubtitle">Manage all pages. Drag and drop to reorder. Note: Slugs are generated automatically.</div>
        </div>
        <span className="badge badgeBlue">{pages.length} Pages</span>
      </div>
      <PagesManager initialPages={pages} />
    </>
  );
}
