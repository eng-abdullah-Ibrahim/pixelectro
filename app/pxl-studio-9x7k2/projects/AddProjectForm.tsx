"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "../../components/TaskProvider";
import DescriptionEditor from "../components/DescriptionEditor";
import { createDraftProjectBase } from "./projectActions";

export default function AddProjectForm({ categories, servicePages }: { categories: any[], servicePages: any[] }) {
  const router = useRouter();
  const { addTask, updateTaskStatus } = useTasks();
  const [loading, setLoading] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    try {
      if (coverFile) {
        const signRes = await fetch('/api/admin/cloudinary-sign?folder=pixelectro/projects');
        if (signRes.ok) {
           const { timestamp, signature, cloudName, apiKey } = await signRes.json();
           const uploadData = new FormData();
           uploadData.append("file", coverFile);
           uploadData.append("api_key", apiKey);
           uploadData.append("timestamp", timestamp.toString());
           uploadData.append("signature", signature);
           uploadData.append("folder", "pixelectro/projects");
           const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
             method: 'POST', body: uploadData
           });
           if (uploadRes.ok) {
             const data = await uploadRes.json();
             formData.append("coverImage", data.secure_url);
           }
        }
      }

      // 1. Instant save base project (no translations)
      const projectId = await createDraftProjectBase(formData);
      
      // 2. Add background translation task
      const taskId = `translate-project-${projectId}`;
      addTask(taskId, `Translating project: ${title}`);
      
      // 3. Immediately redirect user to unblock them
      router.push(`/pxl-studio-9x7k2/projects/${projectId}/edit`);
      
      // 4. Trigger the translation fetch asynchronously (don't wait for it here)
      fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'project', id: projectId, title, description })
      }).then(res => {
        if (!res.ok) throw new Error('Translation failed');
        updateTaskStatus(taskId, 'success');
        // Optionally refresh data when done
        router.refresh();
      }).catch(err => {
        updateTaskStatus(taskId, 'error', 'AI Translation failed. You may need to retry.');
      });

    } catch (e) {
      alert("Failed to create project.");
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ marginBottom: '28px' }}>
      <div className="cardHeader">
        <div className="cardTitle">Add New Project</div>
      </div>
      <div className="cardBody">
        <form action={handleSubmit}>
          <div className="formGrid">
            <div className="field">
              <label className="label">Project Title *</label>
              <input name="title" className="input" placeholder="e.g. Brand Identity for ACME" required />
            </div>

            <div className="field">
              <label className="label">Category *</label>
              <select name="categoryId" className="select" required>
                <option value="">— Select Category —</option>
                {servicePages.map(page => (
                  <optgroup key={page.id} label={page.title}>
                    {categories.filter(c => c.servicePageId === page.id).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="label">Cover Image (Optional)</label>
              <input type="file" accept="image/*" className="input" onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setCoverFile(e.target.files[0]);
                } else {
                  setCoverFile(null);
                }
              }} />
              <small style={{ color: '#888', marginTop: '4px', display: 'block' }}>If not provided, the first media item will be used as cover.</small>
            </div>

            <div className="field">
              <label className="label">Mock Likes</label>
              <input name="fakeLikes" type="number" min="0" defaultValue="0" className="input" />
            </div>

            <div className="field">
              <label className="label">Mock Views</label>
              <input name="fakeViews" type="number" min="0" defaultValue="0" className="input" />
            </div>

            <div className="field">
              <label className="label">Mock Shares</label>
              <input name="fakeShares" type="number" min="0" defaultValue="0" className="input" />
            </div>

            <div className="field formGridFull">
              <label className="label">Description (Optional)</label>
              <DescriptionEditor initialValue="" name="description" />
            </div>
          </div>
          <div className="formActions">
            <button type="submit" className="btnPrimary" disabled={loading}>
              {loading ? "Saving..." : "Save & Continue to Media Uploader →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
