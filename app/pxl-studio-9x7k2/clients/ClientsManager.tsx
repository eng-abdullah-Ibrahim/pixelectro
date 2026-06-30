"use client";
import { useState, useRef } from "react";
import { createClient, deleteClient, updateClientsOrder, editClient } from "./clientActions";
import { UploadCloud, X, GripVertical, Pencil, Trash2 } from "lucide-react";

type Client = {
  id: string;
  name: string | null;
  logoUrl: string | null;
  link: string | null;
  order: number;
};

export default function ClientsManager({ initialClients }: { initialClients: Client[] }) {
  const [clients, setClients] = useState(initialClients);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({ name: "", logoUrl: "", link: "" });
  const [editForm, setEditForm] = useState({ name: "", logoUrl: "", link: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  async function uploadLogoToCloudinary(file: File): Promise<string | null> {
    setIsUploading(true);
    try {
      const signRes = await fetch("/api/admin/cloudinary-sign?folder=pixelectro/clients");
      if (!signRes.ok) throw new Error("Failed to get upload signature");
      const { timestamp, signature, cloudName, apiKey } = await signRes.json();

      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("api_key", apiKey);
      uploadData.append("timestamp", timestamp.toString());
      uploadData.append("signature", signature);
      uploadData.append("folder", "pixelectro/clients");

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: uploadData }
      );
      if (!uploadRes.ok) throw new Error("Upload failed");
      const data = await uploadRes.json();
      return data.secure_url;
    } catch (err) {
      alert("فشل رفع الصورة. يرجى المحاولة مرة أخرى.");
      return null;
    } finally {
      setIsUploading(false);
    }
  }

  async function handleLogoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const url = await uploadLogoToCloudinary(e.target.files[0]);
    if (url) setForm((f) => ({ ...f, logoUrl: url }));
  }

  async function handleEditLogoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;
    const url = await uploadLogoToCloudinary(e.target.files[0]);
    if (url) setEditForm((f) => ({ ...f, logoUrl: url }));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.logoUrl) return;
    setIsSubmitting(true);
    await createClient(form);
    setForm({ name: "", logoUrl: "", link: "" });
    window.location.reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this client?")) return;
    await deleteClient(id);
    setClients(clients.filter((c) => c.id !== id));
  }

  async function handleEditSave(id: string) {
    await editClient(id, editForm);
    setEditingId(null);
    window.location.reload();
  }

  function startEdit(c: Client) {
    setEditingId(c.id);
    setEditForm({ name: c.name || "", logoUrl: c.logoUrl || "", link: c.link || "" });
  }

  // Drag & Drop
  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const arr = [...clients];
    const [item] = arr.splice(draggedIdx, 1);
    arr.splice(idx, 0, item);
    setDraggedIdx(idx);
    setClients(arr);
  };
  const handleDrop = async () => {
    setDraggedIdx(null);
    await updateClientsOrder(clients.map((c) => c.id));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Add Client */}
      <div className="card">
        <div className="cardHeader">
          <div className="cardTitle">Add New Prominent Client</div>
        </div>
        <div className="cardBody">
          <form onSubmit={handleAdd}>
            <div className="formGrid">
              <div className="field">
                <label className="label">Client Name *</label>
                <input
                  className="input"
                  placeholder="e.g. Samsung"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label className="label">Website URL</label>
                <input
                  className="input"
                  placeholder="https://client.com"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                />
              </div>
              <div className="field formGridFull">
                <label className="label">Logo *</label>
                {form.logoUrl ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img
                      src={form.logoUrl}
                      alt="logo"
                      style={{ height: 60, objectFit: "contain", background: "#fff", padding: "6px", borderRadius: "8px" }}
                    />
                    <button
                      type="button"
                      className="btnDanger"
                      style={{ padding: "6px 10px" }}
                      onClick={() => setForm({ ...form, logoUrl: "" })}
                    >
                      <X size={14} /> Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleLogoFileChange}
                    />
                    <button
                      type="button"
                      className="btnGhost"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      style={{ display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      <UploadCloud size={16} />
                      {isUploading ? "Uploading..." : "Upload Logo"}
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="formActions">
              <button type="submit" className="btnPrimary" disabled={isSubmitting || !form.logoUrl || isUploading}>
                {isSubmitting ? "Adding..." : "+ Add Client"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Clients List */}
      <div className="card">
        <div className="cardHeader">
          <div className="cardTitle">Manage Clients</div>
          <span className="badge badgeBlue">{clients.length} Clients</span>
        </div>
        <div className="cardBody">
          {clients.length === 0 ? (
            <p style={{ color: "var(--adm-muted)", textAlign: "center", padding: "2rem 0" }}>
              No clients yet. Add your first prominent client above.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {clients.map((c, idx) => (
                <div
                  key={c.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={handleDrop}
                  onDragEnd={handleDrop}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "12px 16px",
                    background: "var(--adm-surface)",
                    borderRadius: "10px",
                    border: "1px solid var(--adm-border)",
                    cursor: "grab",
                    opacity: draggedIdx === idx ? 0.5 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  <GripVertical size={18} style={{ color: "var(--adm-muted)", flexShrink: 0 }} />

                  {c.logoUrl && (
                    <img
                      src={c.logoUrl}
                      alt={c.name || ""}
                      style={{ height: 44, width: 80, objectFit: "contain", background: "#fff", padding: "4px", borderRadius: "6px", flexShrink: 0 }}
                    />
                  )}

                  {editingId === c.id ? (
                    <div style={{ flex: 1, display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                      <input
                        className="input"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Name"
                        style={{ flex: "1 1 120px" }}
                      />
                      <input
                        className="input"
                        value={editForm.link}
                        onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                        placeholder="URL"
                        style={{ flex: "2 1 200px" }}
                      />
                      {/* Edit logo */}
                      {editForm.logoUrl && (
                        <img
                          src={editForm.logoUrl}
                          alt="logo"
                          style={{ height: 36, objectFit: "contain", background: "#fff", padding: "4px", borderRadius: "6px" }}
                        />
                      )}
                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleEditLogoFileChange}
                      />
                      <button
                        type="button"
                        className="btnGhost"
                        style={{ padding: "6px 10px" }}
                        onClick={() => editFileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        <UploadCloud size={14} /> {isUploading ? "..." : "Change Logo"}
                      </button>
                      <button className="btnPrimary" style={{ padding: "6px 14px" }} onClick={() => handleEditSave(c.id)}>
                        Save
                      </button>
                      <button className="btnGhost" style={{ padding: "6px 14px" }} onClick={() => setEditingId(null)}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        {c.link && <div style={{ fontSize: "12px", color: "var(--adm-muted)" }}>{c.link}</div>}
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className="btnGhost" style={{ padding: "6px 10px" }} onClick={() => startEdit(c)}>
                          <Pencil size={14} />
                        </button>
                        <button className="btnDanger" style={{ padding: "6px 10px" }} onClick={() => handleDelete(c.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
