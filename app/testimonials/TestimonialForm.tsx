"use client";
import { useState, useEffect } from "react";
import { MessageSquare, User, Send, CheckCircle, Edit2 } from "lucide-react";
import { useTranslation } from "../components/TranslationProvider";

export default function TestimonialForm() {
  const { t: translate } = useTranslation();
  const t = (key: string) => translate(`testimonialsPage.${key}`);
  const [form, setForm] = useState({ authorName: "", content: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "rate_limited" | "edit_mode">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    const savedId = localStorage.getItem("my_testimonial_id");
    if (savedId) {
      setMyId(savedId);
      // Fetch their existing comment
      fetch(`/api/testimonials?id=${savedId}`)
        .then(res => res.json())
        .then(data => {
          if (data.authorName && data.content) {
            setForm({ authorName: data.authorName, content: data.content });
            setStatus("success");
          }
        })
        .catch(() => {
          // If not found or error, just ignore and let them submit a new one
          localStorage.removeItem("my_testimonial_id");
        });
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const isEditing = status === "edit_mode" && myId;
      const url = "/api/testimonials";
      const method = isEditing ? "PUT" : "POST";
      const body = isEditing ? { id: myId, content: form.content } : form;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.error === "RATE_LIMITED") {
        setStatus("rate_limited");
      } else if (data.success) {
        if (data.id) {
          localStorage.setItem("my_testimonial_id", data.id);
          setMyId(data.id);
        }
        setStatus("success");
      } else {
        setErrorMsg(data.error || "Failed to submit.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Connection error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="testimonial-success text-center">
        <CheckCircle size={48} className="text-green-400 mb-4 mx-auto" />
        <h3 className="text-xl font-bold mb-2">{t('successTitle')}</h3>
        <p className="text-white/70 mb-6">{t('successDesc')}</p>
        <div className="p-4 bg-white/5 rounded-lg text-left mb-6">
          <div className="font-bold text-white mb-2">{form.authorName}</div>
          <div className="text-white/80">{form.content}</div>
        </div>
        <button 
          onClick={() => setStatus("edit_mode")}
          className="flex items-center justify-center gap-2 mx-auto bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
        >
          <Edit2 size={16} /> {t('editButton')}
        </button>
      </div>
    );
  }

  if (status === "rate_limited") {
    return (
      <div className="testimonial-success text-center">
        <MessageSquare size={48} className="text-yellow-400 mb-4 mx-auto" />
        <h3 className="text-xl font-bold mb-2">{t('rateLimitedTitle')}</h3>
        <p className="text-white/70">{t('rateLimitedDesc')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="testimonial-form">
      {status === "edit_mode" && (
        <div className="mb-4 p-3 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 text-sm">
          {t('editModeNotice')}
        </div>
      )}
      <div className="testimonial-form-field">
        <label>
          <User size={16} />
          {t('nameLabel')}
        </label>
        <input
          type="text"
          placeholder="John Doe"
          value={form.authorName}
          onChange={e => setForm({ ...form, authorName: e.target.value })}
          required
          disabled={status === "edit_mode"} // Only edit content
          minLength={2}
          maxLength={100}
        />
      </div>
      <div className="testimonial-form-field">
        <label>
          <MessageSquare size={16} />
          {t('reviewLabel')}
        </label>
        <textarea
          placeholder="..."
          value={form.content}
          onChange={e => setForm({ ...form, content: e.target.value })}
          required
          minLength={10}
          maxLength={1000}
          rows={5}
        />
        <div className="char-count">{form.content.length}/1000</div>
      </div>
      {status === "error" && (
        <div className="testimonial-error mb-4 text-red-400 bg-red-400/10 p-3 rounded">{errorMsg}</div>
      )}
      <div className="flex gap-4">
        <button type="submit" className="testimonial-submit flex-1" disabled={status === "loading"}>
          <Send size={16} />
          {status === "loading" ? t('submitting') : status === "edit_mode" ? t('saveChanges') : t('submitButton')}
        </button>
        {status === "edit_mode" && (
          <button 
            type="button" 
            onClick={() => setStatus("success")}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-bold transition-colors"
          >
            {t('cancel')}
          </button>
        )}
      </div>
    </form>
  );
}
