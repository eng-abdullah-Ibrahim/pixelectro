"use client";
import { useState } from "react";
import { approveComment, hideComment, deleteComment } from "./testimonialActions";
import { Eye, EyeOff, Trash2, CheckCircle, XCircle } from "lucide-react";

type Comment = {
  id: string;
  authorName: string;
  content: string;
  ipAddress: string | null;
  isHidden: boolean;
  createdAt: Date;
};

export default function TestimonialsManager({ initialComments }: { initialComments: Comment[] }) {
  const [comments, setComments] = useState(initialComments);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const filtered = comments.filter(c => {
    if (filter === "pending") return c.isHidden;
    if (filter === "approved") return !c.isHidden;
    return true;
  });

  const pendingCount = comments.filter(c => c.isHidden).length;
  const approvedCount = comments.filter(c => !c.isHidden).length;

  async function handleApprove(id: string) {
    await approveComment(id);
    setComments(prev => prev.map(c => c.id === id ? { ...c, isHidden: false } : c));
  }

  async function handleHide(id: string) {
    await hideComment(id);
    setComments(prev => prev.map(c => c.id === id ? { ...c, isHidden: true } : c));
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial permanently?")) return;
    await deleteComment(id);
    setComments(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        <div className="card" style={{ textAlign: "center", padding: "1.5rem" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{comments.length}</div>
          <div style={{ color: "var(--adm-muted)", fontSize: "14px" }}>Total</div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: "1.5rem" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--adm-warning)" }}>{pendingCount}</div>
          <div style={{ color: "var(--adm-muted)", fontSize: "14px" }}>Pending Approval</div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: "1.5rem" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--adm-green)" }}>{approvedCount}</div>
          <div style={{ color: "var(--adm-muted)", fontSize: "14px" }}>Approved</div>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="card">
        <div className="cardHeader">
          <div className="cardTitle">All Testimonials</div>
          <div style={{ display: "flex", gap: "8px" }}>
            {(["all", "pending", "approved"] as const).map(f => (
              <button
                key={f}
                className={filter === f ? "btnPrimary" : "btnGhost"}
                style={{ padding: "6px 14px", textTransform: "capitalize" }}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="cardBody">
          {filtered.length === 0 ? (
            <p style={{ color: "var(--adm-muted)", textAlign: "center", padding: "2rem 0" }}>No testimonials found.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filtered.map(c => (
                <div
                  key={c.id}
                  style={{
                    padding: "16px",
                    background: "var(--adm-surface)",
                    borderRadius: "10px",
                    border: `1px solid ${c.isHidden ? "var(--adm-warning-border, #7a4f00)" : "var(--adm-border)"}`,
                    display: "flex",
                    gap: "16px",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <div style={{ fontWeight: 700 }}>{c.authorName}</div>
                      {c.isHidden ? (
                        <span className="badge badgeWarning">Pending</span>
                      ) : (
                        <span className="badge badgeGreen">Approved</span>
                      )}
                      <span style={{ fontSize: "12px", color: "var(--adm-muted)", marginLeft: "auto" }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ color: "var(--adm-text)", lineHeight: 1.6, margin: 0 }}>{c.content}</p>
                    {c.ipAddress && (
                      <div style={{ fontSize: "11px", color: "var(--adm-muted)", marginTop: "6px" }}>
                        IP: {c.ipAddress}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    {c.isHidden ? (
                      <button
                        className="btnPrimary"
                        style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: "4px" }}
                        onClick={() => handleApprove(c.id)}
                        title="Approve"
                      >
                        <CheckCircle size={14} /> Approve
                      </button>
                    ) : (
                      <button
                        className="btnGhost"
                        style={{ padding: "6px 12px", display: "flex", alignItems: "center", gap: "4px" }}
                        onClick={() => handleHide(c.id)}
                        title="Hide"
                      >
                        <EyeOff size={14} /> Hide
                      </button>
                    )}
                    <button
                      className="btnDanger"
                      style={{ padding: "6px 10px" }}
                      onClick={() => handleDelete(c.id)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
