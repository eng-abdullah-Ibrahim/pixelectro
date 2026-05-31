import prisma from "../../../../../lib/prisma";
import { redirect, notFound } from "next/navigation";
import { editPage } from "../../pageActions";
import Link from "next/link";

const AVAILABLE_SCENES = [
  "BrandingScene",
  "FilmScene",
  "VFXScene",
  "SoftwareScene",
  "PerformanceScene",
  "AIScene",
  "IcosahedronScene",
  "BoxScene",
  "RingScene",
  "CapsuleScene",
  "TorusKnotScene",
  "TetrahedronScene"
];

const ICONS = ["◈", "▶", "◎", "⬡", "◆", "◉", "✧", "▤", "△", "□", "○", "☆"];

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const pageId = resolvedParams.id;
  
  const page = await prisma.servicePage.findUnique({
    where: { id: pageId }
  });

  if (!page) notFound();

  async function handleEdit(formData: FormData) {
    "use server";
    await editPage(pageId, { 
      title: formData.get("title") as string,
      icon: formData.get("icon") as string,
      scene: formData.get("scene") as string,
      description: formData.get("description") as string,
    });
    redirect("/admin/pages");
  }

  return (
    <>
      <div className="pageHeader">
        <div>
          <div className="pageTitle">Edit Page</div>
          <div className="pageSubtitle">Update the page details, icon, or 3D scene.</div>
        </div>
        <Link href="/admin/pages" className="btnGhost">← Back to Pages</Link>
      </div>

      <div className="card">
        <div className="cardHeader">
          <div className="cardTitle">Page Details</div>
        </div>
        <div className="cardBody">
          <form action={handleEdit}>
            <div className="formGrid">
              <div className="field">
                <label className="label">Title *</label>
                <input name="title" className="input" defaultValue={page.title} required />
              </div>
              <div className="field">
                <label className="label">Icon (Emoji/Symbol) *</label>
                <select name="icon" className="select" required defaultValue={page.icon}>
                  {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">3D Scene *</label>
                <select name="scene" className="select" required defaultValue={page.scene}>
                  {AVAILABLE_SCENES.map(s => (
                    <option key={s} value={s}>{s.replace('Scene', '')}</option>
                  ))}
                </select>
              </div>
              <div className="field formGridFull">
                <label className="label">Description (Optional)</label>
                <textarea name="description" className="textarea" defaultValue={page.description || ""} />
              </div>
            </div>
            <div className="formActions">
              <button type="submit" className="btnPrimary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
