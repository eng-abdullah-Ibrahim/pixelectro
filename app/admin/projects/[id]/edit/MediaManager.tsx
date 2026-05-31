"use client";

import { useState, useRef } from "react";
import { uploadNewMedia, deleteMediaItem, updateMediaOrder } from "./mediaActions";

type MediaItem = {
  id: string;
  url: string;
  type: string;
  order: number;
};

export default function MediaManager({ projectId, initialMedia }: { projectId: string, initialMedia: MediaItem[] }) {
  const [mediaList, setMediaList] = useState<MediaItem[]>(initialMedia.sort((a, b) => a.order - b.order));
  const [isUploading, setIsUploading] = useState(false);
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    
    const formData = new FormData();
    for (let i = 0; i < e.target.files.length; i++) {
      formData.append("mediaFiles", e.target.files[i]);
    }
    
    try {
      const updatedMedia = await uploadNewMedia(projectId, formData);
      setMediaList(updatedMedia);
    } catch (err) {
      console.error(err);
      alert("Failed to upload media.");
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleDelete = async (mediaId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    setMediaList(prev => prev.filter(m => m.id !== mediaId));
    await deleteMediaItem(mediaId, projectId);
  };

  const onDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = "move";
    // Setup ghost image or transparency
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = "0.5";
      }
    }, 0);
  };

  const onDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverItem.current = index;
  };

  const onDragEnd = async (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = "1";
    }
    
    if (dragItem.current === null || dragOverItem.current === null) return;

    // Reorder array
    const newList = [...mediaList];
    const draggedItemContent = newList[dragItem.current];
    newList.splice(dragItem.current, 1);
    newList.splice(dragOverItem.current, 0, draggedItemContent);
    
    dragItem.current = null;
    dragOverItem.current = null;

    // Update local state with new calculated orders to reflect instantly
    const reorderedList = newList.map((item, index) => ({ ...item, order: index }));
    setMediaList(reorderedList);

    // Call server action to update DB
    await updateMediaOrder(projectId, reorderedList.map(item => item.id));
  };

  return (
    <>
      <div className="field">
        <label className="label">Live Media Upload (Images / Videos)</label>
        <input 
          type="file" 
          className="input" 
          accept="image/*,video/*" 
          multiple 
          onChange={handleFileChange}
          disabled={isUploading}
          style={{ padding: "8px", opacity: isUploading ? 0.5 : 1 }} 
        />
        <div style={{ fontSize: "0.8rem", color: "var(--adm-muted)", marginTop: "4px" }}>
          {isUploading ? "Uploading... please wait" : "Files uploaded here will be saved and displayed instantly."}
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h4 style={{ marginBottom: "1rem", fontFamily: "var(--font-sans)", color: "var(--ink)" }}>Manage Existing Media (Drag to reorder)</h4>
        
        {mediaList.length === 0 ? (
          <p style={{ color: 'var(--adm-muted)' }}>No media files attached.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {mediaList.map((m, index) => (
              <div 
                key={m.id} 
                draggable 
                onDragStart={(e) => onDragStart(e, index)}
                onDragEnter={(e) => onDragEnter(e, index)}
                onDragOver={(e) => e.preventDefault()}
                onDragEnd={onDragEnd}
                style={{ 
                  position: 'relative', 
                  border: '1px solid var(--rule-light)', 
                  borderRadius: '8px', 
                  overflow: 'hidden',
                  cursor: 'grab',
                  background: '#fcfcfc',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                {/* Order Badge */}
                <div style={{
                  position: 'absolute', top: 8, left: 8, background: 'var(--blue-core)', color: 'white',
                  width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 'bold', zIndex: 10
                }}>
                  {index + 1}
                </div>

                {m.type === 'IMAGE' ? (
                  <img src={m.url} alt={`Media ${index + 1}`} style={{ width: '100%', height: '150px', objectFit: 'cover', pointerEvents: 'none' }} />
                ) : (
                  <video src={m.url} style={{ width: '100%', height: '150px', objectFit: 'cover', pointerEvents: 'none' }} muted />
                )}
                
                <div style={{ padding: '0.5rem', background: '#fff' }}>
                  <button 
                    type="button" 
                    onClick={() => handleDelete(m.id)}
                    className="btnDanger" 
                    style={{ width: '100%', padding: '4px', fontSize: '0.8rem' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
