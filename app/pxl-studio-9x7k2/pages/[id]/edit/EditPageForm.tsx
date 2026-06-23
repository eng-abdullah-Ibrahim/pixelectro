"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "../../../../components/TaskProvider";
import DescriptionEditor from "../../../components/DescriptionEditor";
import ImageUploader from "../../../components/ImageUploader";
import { editPage } from "../../pageActions";

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

export default function EditPageForm({ page }: { page: any }) {
  const router = useRouter();
  const { addTask, updateTaskStatus } = useTasks();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const title = fd.get("title") as string;
    const description = fd.get("description") as string;
    const excerpt = fd.get("excerpt") as string;

    try {
      await editPage(page.id, {
        title,
        icon: fd.get("icon") as string,
        contentType: fd.get("contentType") as string,
        scene: fd.get("scene") as string,
        description,
        excerpt,
        homeImage: fd.get("homeImage") as string,
        homeScene: fd.get("homeScene") as string,
      });

      const taskId = `translate-edit-page-${page.id}-${Date.now()}`;
      addTask(taskId, `Translating Page updates: ${title}`);

      router.push("/pxl-studio-9x7k2/pages");

      fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'servicePage', id: page.id, title, description, excerpt })
      }).then(res => {
        if (!res.ok) throw new Error();
        updateTaskStatus(taskId, 'success');
        router.refresh();
      }).catch(err => {
        updateTaskStatus(taskId, 'error', 'AI Translation failed.');
      });

    } catch (e) {
      alert("Failed to update page.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
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
        <div className="field">
          <label className="label">Content Type *</label>
          <select name="contentType" className="select" required defaultValue={page.contentType || "MEDIA"}>
            <option value="MEDIA">🖼️ Images & Videos (Carousel)</option>
            <option value="PDF_BOOK">📚 PDF Book (3D Flipbook)</option>
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
        <button type="submit" className="btnPrimary" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</button>
        <button type="button" onClick={() => router.push('/pxl-studio-9x7k2/pages')} className="btnGhost" disabled={loading}>Discard Changes</button>
      </div>
    </form>
  );
}
