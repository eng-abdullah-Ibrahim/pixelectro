"use client";
import { useState } from "react";
import Link from "next/link";
import { updateProjectsOrder, deleteProject, toggleProjectActive } from "./projectActions";

type Project = {
  id: string;
  title: string;
  description: string | null;
  categoryId: string;
  order: number;
  category: { name: string; servicePageId: string; servicePage: { title: string } };
  media: { url: string; type: string }[];
  isActive: boolean;
  likesCount: number;
  fakeLikes: number;
  viewsCount: number;
  fakeViews: number;
  sharesCount: number;
  fakeShares: number;
};

type Category = {
  id: string;
  name: string;
  servicePageId: string;
};

type ServicePage = {
  id: string;
  title: string;
};

export default function ProjectsManager({
  initialProjects,
  categories,
  servicePages
}: {
  initialProjects: Project[],
  categories: Category[],
  servicePages: ServicePage[]
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [filterPageId, setFilterPageId] = useState<string>("");
  const [filterCategoryId, setFilterCategoryId] = useState<string>("");
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Filter logic
  let filteredProjects = projects;
  if (filterPageId) {
    filteredProjects = filteredProjects.filter(p => p.category.servicePageId === filterPageId);
  }
  if (filterCategoryId) {
    filteredProjects = filteredProjects.filter(p => p.categoryId === filterCategoryId);
    // Sort only when filtered by category, otherwise show all in descending ID or mixed order
    filteredProjects.sort((a,b) => a.order - b.order);
  } else {
    // default view, just sort by ID descending (newest first)
    filteredProjects.sort((a, b) => b.id.localeCompare(a.id));
  }

  const availableCategoriesForFilter = filterPageId 
    ? categories.filter(c => c.servicePageId === filterPageId)
    : categories;

  // Add Project Form State (just needs categories of the selected page if any)
  const [addPageId, setAddPageId] = useState<string>("");
  const addCategories = addPageId 
    ? categories.filter(c => c.servicePageId === addPageId)
    : categories;

  // Drag and Drop
  const handleDragStart = (idx: number) => {
    if (!filterCategoryId) {
      alert("Please filter by a specific Category before reordering projects!");
      return;
    }
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx || !filterCategoryId) return;

    const newProjs = [...filteredProjects];
    const item = newProjs.splice(draggedIdx, 1)[0];
    newProjs.splice(idx, 0, item);
    newProjs.forEach((p, i) => { p.order = i; });
    
    setDraggedIdx(idx);
    
    const merged = projects.map(p => newProjs.find(n => n.id === p.id) || p);
    setProjects(merged);
  };

  const handleDrop = async () => {
    if (draggedIdx === null || !filterCategoryId) return;
    setDraggedIdx(null);
    const ids = filteredProjects.map(p => p.id);
    await updateProjectsOrder(ids);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      await deleteProject(id);
      window.location.reload();
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    if (confirm(`Are you sure you want to ${currentActive ? 'deactivate' : 'activate'} this project?`)) {
      await toggleProjectActive(id, !currentActive);
      window.location.reload();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      {/* ── Add Project Form (Uses Server Action from page.tsx implicitly) ── */}
      <div className="card">
        <div className="cardHeader">
          <div className="cardTitle">Add New Project</div>
        </div>
        <div className="cardBody">
          {/* Note: The form action is passed from the parent as a server action string implicitly or we just post to an API. 
              Actually, since we refactored createDraftProject as a server action, we can't easily pass it to a client component without props.
              Instead, let's just make the form standard POST or pass the action. 
              Wait, we can't pass Server Actions directly in standard React if not careful. Let's just use standard form action. */}
          <form action="/pxl-studio-9x7k2/projects" method="POST">
            {/* We'll intercept this in page.tsx by checking formData on render? No, Server Actions are easier. 
                I'll put the Add Project form back in page.tsx and just render ProjectsManager for the table. 
                Wait, it's better to put it here and use a generic POST. */}
             {/* To fix this, I will move the Add form back to page.tsx and only pass the table to ProjectsManager. */}
             <p style={{ color: 'var(--adm-muted)' }}>Use the "Manage Projects" table below to filter and reorder existing projects.</p>
          </form>
        </div>
      </div>

      {/* ── Manage Projects ── */}
      <div className="card">
        <div className="cardHeader">
          <div className="cardTitle">Manage Projects</div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--adm-muted)' }}>Filter:</span>
            
            <select 
              className="select" 
              style={{ width: '160px', padding: '4px 8px' }}
              value={filterPageId}
              onChange={e => { setFilterPageId(e.target.value); setFilterCategoryId(""); }}
            >
              <option value="">All Pages</option>
              {servicePages.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>

            <select 
              className="select" 
              style={{ width: '160px', padding: '4px 8px' }}
              value={filterCategoryId}
              onChange={e => setFilterCategoryId(e.target.value)}
            >
              <option value="">All Categories</option>
              {availableCategoriesForFilter.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <span className="badge badgeBlue">{filteredProjects.length} entries</span>
          </div>
        </div>

        <div className="tableWrap">
          {filteredProjects.length === 0 ? (
            <div className="emptyState">
              <div className="emptyStateIcon">◈</div>
              <div className="emptyStateText">No projects match the current filter.</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>≡</th>
                  <th style={{ width: 72 }}>Media</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th style={{ width: 220 }}>Interactions</th>
                  <th style={{ width: 100 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p, idx) => (
                  <tr 
                    key={p.id}
                    draggable={!!filterCategoryId}
                    onDragStart={(e) => {
                      if (!filterCategoryId) e.preventDefault();
                      handleDragStart(idx);
                    }}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={handleDrop}
                    onDragEnd={handleDrop}
                    style={{
                      cursor: filterCategoryId ? "grab" : "default",
                      opacity: draggedIdx === idx ? 0.5 : 1,
                      backgroundColor: draggedIdx === idx ? "var(--adm-bg)" : "transparent",
                      transition: "all 0.2s"
                    }}
                  >
                    <td style={{ color: "var(--adm-muted)", fontSize: "1.2rem" }}>⋮⋮</td>
                    <td>
                      {p.media && p.media.length > 0 ? (
                        p.media[0].type === 'IMAGE' ? (
                          <img src={p.media[0].url} alt={p.title} className="thumbCell" />
                        ) : (
                          <video src={p.media[0].url} className="thumbCell" muted />
                        )
                      ) : (
                        <div className="thumbPlaceholder">◈</div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>
                        {p.title}
                        {!p.isActive && <span className="badge badgeDanger" style={{ marginLeft: "8px", verticalAlign: "middle" }}>Inactive</span>}
                      </div>
                      {p.description && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--adm-muted)', maxWidth: 320, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge badgeGreen">{p.category.servicePage.title}</span><br />
                      <span className="badge badgeBlue" style={{ marginTop: 4 }}>{p.category.name}</span>
                    </td>
                    <td>
                      {p.media?.some(m => m.url?.toLowerCase().endsWith('.pdf') || m.type === 'PDF') ? (
                        <div style={{ fontSize: "0.8rem", color: "var(--adm-muted)" }}>
                          N/A (PDF Project)<br/>
                          See Detailed Stats
                        </div>
                      ) : (
                        <div style={{ fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div>
                            <span style={{ color: "var(--adm-green)" }}>♥ {p.likesCount}</span> + 
                            <span style={{ color: "var(--adm-muted)" }}>{p.fakeLikes}</span> = 
                            <span style={{ fontWeight: "bold" }}>{p.likesCount + p.fakeLikes}</span> Likes
                          </div>
                          <div>
                            <span style={{ color: "var(--adm-green)" }}>👁 {p.viewsCount}</span> + 
                            <span style={{ color: "var(--adm-muted)" }}>{p.fakeViews}</span> = 
                            <span style={{ fontWeight: "bold" }}>{p.viewsCount + p.fakeViews}</span> Views
                          </div>
                          <div>
                            <span style={{ color: "var(--adm-green)" }}>🔗 {p.sharesCount}</span> + 
                            <span style={{ color: "var(--adm-muted)" }}>{p.fakeShares}</span> = 
                            <span style={{ fontWeight: "bold" }}>{p.sharesCount + p.fakeShares}</span> Shares
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleToggleActive(p.id, p.isActive)} 
                          className={p.isActive ? "btnGhost" : "btnPrimary"} 
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          {p.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <Link href={`/pxl-studio-9x7k2/projects/${p.id}/edit`} className="btnGhost" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Edit</Link>
                        {/* We use standard HTML forms for deletion in Server Component wrapper usually, but here we can just use a form that POSTs to the server action endpoint or an API. 
                            Since we are in a client component, we'll just link to a delete route or use a form. */}
                        <button onClick={() => handleDelete(p.id)} className="btnDanger" title="Delete Project" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>✕</button>
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
