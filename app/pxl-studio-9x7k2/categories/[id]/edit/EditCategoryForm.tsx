"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "../../../../components/TaskProvider";
import { editCategory } from "../../categoryActions";

export default function EditCategoryForm({ category, servicePages }: { category: any, servicePages: any[] }) {
  const router = useRouter();
  const { addTask, updateTaskStatus } = useTasks();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const servicePageId = fd.get("servicePageId") as string;

    try {
      // 1. Instant save base details
      await editCategory(category.id, { name, servicePageId });
      
      // 2. Queue background task
      const taskId = `translate-edit-category-${category.id}-${Date.now()}`;
      addTask(taskId, `Translating updates: ${name}`);
      
      // 3. Unblock UI
      router.push("/pxl-studio-9x7k2/categories");
      
      // 4. Background translate
      fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'category', id: category.id, name, description: '' })
      }).then(res => {
        if (!res.ok) throw new Error();
        updateTaskStatus(taskId, 'success');
        router.refresh();
      }).catch(err => {
        updateTaskStatus(taskId, 'error', 'AI Translation failed.');
      });

    } catch (e) {
      alert("Failed to update category.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
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
        <button type="submit" className="btnPrimary" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
        <button type="button" onClick={() => router.push('/pxl-studio-9x7k2/categories')} className="btnGhost" disabled={loading}>
          Discard Changes
        </button>
      </div>
    </form>
  );
}
