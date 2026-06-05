"use client";
import { useState } from "react";
import Link from "next/link";
import { createPage, deletePage, updatePagesOrder, togglePageActive } from "./pageActions";
import DescriptionEditor from "../components/DescriptionEditor";
import ImageUploader from "../components/ImageUploader";

type ServicePage = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  scene: string;
  icon: string;
  order: number;
  isActive: boolean;
};

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

export default function PagesManager({ initialPages }: { initialPages: ServicePage[] }) {
  const [pages, setPages] = useState(initialPages);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    await createPage({
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      excerpt: fd.get("excerpt") as string,
      scene: fd.get("scene") as string,
      icon: fd.get("icon") as string,
      homeImage: fd.get("homeImage") as string,
      homeScene: fd.get("homeScene") as string
    });
    // Let Server Action revalidate and refresh the page, but optimistically we just reload or wait for next.js
    window.location.reload(); 
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure? This will delete the page and all its categories!")) {
      await deletePage(id);
      window.location.reload();
    }
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    if (confirm(`Are you sure you want to ${currentActive ? 'deactivate' : 'activate'} this page?`)) {
      await togglePageActive(id, !currentActive);
      window.location.reload();
    }
  }

  // Drag and Drop Handlers
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;

    const newPages = [...pages];
    const item = newPages.splice(draggedIdx, 1)[0];
    newPages.splice(idx, 0, item);
    newPages.forEach((p, i) => { p.order = i; });
    
    setDraggedIdx(idx);
    setPages(newPages);
  };

  const handleDrop = async () => {
    setDraggedIdx(null);
    const ids = pages.map(p => p.id);
    await updatePagesOrder(ids);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* ── Add Page Form ── */}
      <div className="card">
        <div className="cardHeader">
          <div className="cardTitle">Add New Page</div>
        </div>
        <div className="cardBody">
          <form onSubmit={handleAdd}>
            <div className="formGrid">
              <div className="field">
                <label className="label">Title *</label>
                <input name="title" className="input" placeholder="e.g. Web3 Solutions" required />
              </div>
              <div className="field">
                <label className="label">Icon (Emoji/Symbol) *</label>
                <select name="icon" className="select" required defaultValue="◈">
                  {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">3D Scene *</label>
                <select name="scene" className="select" required>
                  {AVAILABLE_SCENES.map(s => (
                    <option key={s} value={s}>{s.replace('Scene', '')}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="label">Homepage Image (Left/Right side)</label>
                <ImageUploader name="homeImage" initialUrl="" />
              </div>
              <div className="field">
                <label className="label">Homepage 3D Scene</label>
                <select name="homeScene" className="select">
                  <option value="">-- No Scene --</option>
                  {AVAILABLE_SCENES.map(s => (
                    <option key={s} value={s}>{s.replace('Scene', '')}</option>
                  ))}
                </select>
              </div>
              <div className="field formGridFull">
                <label className="label">Excerpt (Homepage)</label>
                <DescriptionEditor initialValue="" name="excerpt" />
              </div>
              <div className="field formGridFull">
                <label className="label">Description (Inner Page)</label>
                <DescriptionEditor initialValue="" name="description" />
              </div>
            </div>
            <div className="formActions">
              <button type="submit" className="btnPrimary" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "+ Add Page"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── List / Reorder Pages ── */}
      <div className="card">
        <div className="cardHeader">
          <div className="cardTitle">Manage & Reorder Pages</div>
        </div>
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>≡</th>
                <th>Title</th>
                <th>Slug (URL)</th>
                <th>Scene</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p, idx) => (
                <tr 
                  key={p.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={handleDrop}
                  onDragEnd={handleDrop}
                  style={{
                    cursor: "grab",
                    opacity: draggedIdx === idx ? 0.5 : 1,
                    backgroundColor: draggedIdx === idx ? "var(--adm-bg)" : "transparent",
                    transition: "all 0.2s"
                  }}
                >
                  <td style={{ color: "var(--adm-muted)", fontSize: "1.2rem" }}>⋮⋮</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
                      <span style={{ fontWeight: 600 }}>{p.title}</span>
                      {!p.isActive && <span className="badge badgeDanger">Inactive</span>}
                    </div>
                  </td>
                  <td><span className="badge badgeGreen">/{p.slug}</span></td>
                  <td><span className="badge badgeBlue">{p.scene}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleToggleActive(p.id, p.isActive)} 
                        className={p.isActive ? "btnGhost" : "btnPrimary"} 
                        style={{ padding: '6px 12px' }}
                      >
                        {p.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <Link href={`/pxl-studio-9x7k2/pages/${p.id}/edit`} className="btnGhost" style={{ padding: '6px 12px' }}>Edit</Link>
                      <button onClick={() => handleDelete(p.id)} className="btnDanger" style={{ padding: '6px 12px' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
