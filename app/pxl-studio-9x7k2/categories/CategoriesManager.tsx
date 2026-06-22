"use client";
import { useState } from "react";
import Link from "next/link";
import { createCategory, deleteCategory, updateCategoriesOrder, toggleCategoryActive } from "./categoryActions";

type Category = {
  id: string;
  name: string;
  slug: string;
  servicePageId: string;
  order: number;
  servicePage: { title: string };
  isActive: boolean;
  _count: { projects: number };
};

type ServicePage = {
  id: string;
  title: string;
};

import { useTasks } from "../../components/TaskProvider";

export default function CategoriesManager({ 
  initialCategories, 
  servicePages 
}: { 
  initialCategories: Category[], 
  servicePages: ServicePage[] 
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const { addTask, updateTaskStatus } = useTasks();

  // Group categories by service page for cleaner drag and drop
  const [filterPageId, setFilterPageId] = useState<string>("");

  const filteredCategories = filterPageId 
    ? categories.filter(c => c.servicePageId === filterPageId).sort((a,b) => a.order - b.order)
    : categories.sort((a,b) => a.order - b.order);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const catId = await createCategory({
      name,
      servicePageId: fd.get("servicePageId") as string
    });
    
    const taskId = `translate-cat-${catId}`;
    addTask(taskId, `Translating Category: ${name}`);
    
    // Close submitting state immediately to unblock UI
    setIsSubmitting(false);
    
    // Background translation
    fetch('/api/admin/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'category', id: catId, name, description: '' })
    }).then(res => {
      if (!res.ok) throw new Error();
      updateTaskStatus(taskId, 'success');
      window.location.reload();
    }).catch(() => {
      updateTaskStatus(taskId, 'error', 'AI Translation failed.');
    });
  }

  async function handleDelete(id: string) {
    if (confirm("Delete this category? Projects inside it will also be deleted!")) {
      await deleteCategory(id);
      window.location.reload();
    }
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    if (confirm(`Are you sure you want to ${currentActive ? 'deactivate' : 'activate'} this category?`)) {
      await toggleCategoryActive(id, !currentActive);
      window.location.reload();
    }
  }

  const handleDragStart = (idx: number) => {
    if (!filterPageId) {
      alert("Please filter by a specific Service Page before reordering categories!");
      return;
    }
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx || !filterPageId) return;

    const newCats = [...filteredCategories];
    const item = newCats.splice(draggedIdx, 1)[0];
    newCats.splice(idx, 0, item);
    newCats.forEach((c, i) => { c.order = i; });
    
    setDraggedIdx(idx);
    
    // Update main state 
    const merged = categories.map(c => newCats.find(n => n.id === c.id) || c);
    setCategories(merged);
  };

  const handleDrop = async () => {
    if (draggedIdx === null || !filterPageId) return;
    setDraggedIdx(null);
    const ids = filteredCategories.map(c => c.id);
    await updateCategoriesOrder(ids);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* ── Add Category Form ── */}
      <div className="card">
        <div className="cardHeader">
          <div className="cardTitle">Add New Category</div>
        </div>
        <div className="cardBody">
          <form onSubmit={handleAdd}>
            <div className="formGrid">
              <div className="field">
                <label className="label">Category Name *</label>
                <input name="name" className="input" placeholder="e.g. Logo Design" required />
              </div>

              <div className="field formGridFull">
                <label className="label">Assign to Service Page *</label>
                <select name="servicePageId" className="select" required defaultValue={filterPageId}>
                  <option value="">— Select Service Page —</option>
                  {servicePages.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="formActions">
              <button type="submit" className="btnPrimary" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "+ Save Category"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Categories Table ── */}
      <div className="card">
        <div className="cardHeader">
          <div className="cardTitle">Manage Categories</div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--adm-muted)' }}>Filter by Page to Reorder:</span>
            <select 
              className="select" 
              style={{ width: '200px', padding: '4px 8px' }}
              value={filterPageId}
              onChange={e => setFilterPageId(e.target.value)}
            >
              <option value="">All Pages (View Only)</option>
              {servicePages.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
            <span className="badge badgeBlue">{filteredCategories.length} entries</span>
          </div>
        </div>
        <div className="tableWrap">
          {filteredCategories.length === 0 ? (
             <div className="emptyState">
               <div className="emptyStateIcon">▤</div>
               <div className="emptyStateText">No categories yet in this selection.</div>
             </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>≡</th>
                  <th>Category Name</th>
                  <th>Service Page</th>
                  <th style={{ textAlign: 'center' }}>Projects</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat, idx) => (
                  <tr 
                    key={cat.id}
                    draggable={!!filterPageId}
                    onDragStart={(e) => {
                      if (!filterPageId) e.preventDefault();
                      handleDragStart(idx);
                    }}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={handleDrop}
                    onDragEnd={handleDrop}
                    style={{
                      cursor: filterPageId ? "grab" : "default",
                      opacity: draggedIdx === idx ? 0.5 : 1,
                      backgroundColor: draggedIdx === idx ? "var(--adm-bg)" : "transparent",
                      transition: "all 0.2s"
                    }}
                  >
                    <td style={{ color: "var(--adm-muted)", fontSize: "1.2rem" }}>⋮⋮</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{cat.name}</span>
                      {!cat.isActive && <span className="badge badgeDanger" style={{ marginLeft: "8px" }}>Inactive</span>}
                    </td>
                    <td>
                      <span className="badge badgeGreen">
                        {cat.servicePage.title}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badgeBlue">{cat._count.projects}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleToggleActive(cat.id, cat.isActive)} 
                          className={cat.isActive ? "btnGhost" : "btnPrimary"} 
                          style={{ padding: '6px 12px' }}
                        >
                          {cat.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <Link href={`/pxl-studio-9x7k2/categories/${cat.id}/edit`} className="btnGhost" style={{ padding: '6px 12px' }}>Edit</Link>
                        <button onClick={() => handleDelete(cat.id)} className="btnDanger" style={{ padding: '6px 12px' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
