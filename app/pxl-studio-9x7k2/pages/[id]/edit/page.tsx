import prisma from '@/lib/prisma';
import { redirect, notFound } from "next/navigation";
import { editPage } from "../../pageActions";
import Link from "next/link";

import DescriptionEditor from "../../../components/DescriptionEditor";
import ImageUploader from "../../../components/ImageUploader";

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
      excerpt: formData.get("excerpt") as string,
      homeImage: formData.get("homeImage") as string,
      homeScene: formData.get("homeScene") as string,
    });
    redirect("/pxl-studio-9x7k2/pages");
  }

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

              {/* Page View Settings */}
              <div className="field" style={{ gridColumn: '1 / -1', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                <h3 className="text-lg font-semibold text-white/90">Inner Page Settings</h3>
              </div>
              <div className="field">
                <label className="label">Page 3D Scene *</label>
                <select name="scene" className="select" required defaultValue={page.scene}>
                  {AVAILABLE_SCENES.map(s => (
                    <option key={s} value={s}>{s.replace('Scene', '')}</option>
                  ))}
                </select>
              </div>
              <div className="field formGridFull" style={{ gridColumn: '1 / -1' }}>
                <label className="label">Page Description (Appears on the service page only)</label>
                <DescriptionEditor name="description" initialValue={page.description || ""} serviceId={page.id} />
              </div>

              {/* Homepage View Settings */}
              <div className="field" style={{ gridColumn: '1 / -1', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                <h3 className="text-lg font-semibold text-[#4a86e8]">Homepage Settings</h3>
                <p className="text-sm text-white/50 mb-2">These control how the service appears as a full section on the homepage.</p>
              </div>
              
              <div className="field">
                <label className="label">Homepage Image (Left/Right side)</label>
                <ImageUploader name="homeImage" initialUrl={page.homeImage || ""} />
              </div>

              <div className="field">
                <label className="label">Homepage 3D Scene</label>
                <select name="homeScene" className="select" defaultValue={page.homeScene || ""}>
                  <option value="">-- No Scene --</option>
                  {AVAILABLE_SCENES.map(s => (
                    <option key={s} value={s}>{s.replace('Scene', '')}</option>
                  ))}
                </select>
              </div>

              <div className="field formGridFull" style={{ gridColumn: '1 / -1' }}>
                <label className="label">Homepage Excerpt (Appears on homepage only)</label>
                <DescriptionEditor name="excerpt" initialValue={page.excerpt || ""} serviceId={page.id} />
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
