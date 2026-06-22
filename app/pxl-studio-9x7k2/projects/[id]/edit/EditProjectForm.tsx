"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "../../../../components/TaskProvider";
import DescriptionEditor from "../../../components/DescriptionEditor";
import { updateProjectBase } from "../../projectActions";

export default function EditProjectForm({ project, categories }: { project: any, categories: any[] }) {
  const router = useRouter();
  const { addTask, updateTaskStatus } = useTasks();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    try {
      // 1. Instant save
      await updateProjectBase(project.id, formData);
      
      // 2. Queue background task
      const taskId = `translate-edit-project-${project.id}-${Date.now()}`;
      addTask(taskId, `Translating updates: ${title}`);
      
      // 3. Unblock UI
      router.push("/pxl-studio-9x7k2/projects");
      
      // 4. Background translate
      fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'project', id: project.id, title, description })
      }).then(res => {
        if (!res.ok) throw new Error('Translation failed');
        updateTaskStatus(taskId, 'success');
        router.refresh();
      }).catch(err => {
        updateTaskStatus(taskId, 'error', 'AI Translation failed.');
      });

    } catch (e) {
      alert("Failed to update project.");
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ marginBottom: "2rem" }}>
      <div className="cardBody">
        <form action={handleSubmit}>
          <div className="formGrid">
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label className="label">Project Title *</label>
              <input type="text" name="title" defaultValue={project.title} required className="input" />
            </div>
            
            <div className="field" style={{ gridColumn: "1 / -1" }}>
              <label className="label">Description</label>
              <DescriptionEditor initialValue={project.description || ""} projectId={project.id} name="description" />
            </div>

            <div className="field">
              <label className="label">Category *</label>
              <select name="categoryId" defaultValue={project.categoryId} className="select" required>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="label">Mock Likes</label>
              <input name="fakeLikes" type="number" min="0" defaultValue={project.fakeLikes || 0} className="input" required />
            </div>

            <div className="field">
              <label className="label">Mock Views</label>
              <input name="fakeViews" type="number" min="0" defaultValue={project.fakeViews || 0} className="input" required />
            </div>

            <div className="field">
              <label className="label">Mock Shares</label>
              <input name="fakeShares" type="number" min="0" defaultValue={project.fakeShares || 0} className="input" required />
            </div>
          </div>

          <div className="formActions" style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
            <button type="submit" className="btnPrimary" disabled={loading}>
              {loading ? "Saving..." : "Save Project Details"}
            </button>
            <button type="button" onClick={() => router.push('/pxl-studio-9x7k2/projects')} className="btnGhost" disabled={loading}>
              Discard Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
