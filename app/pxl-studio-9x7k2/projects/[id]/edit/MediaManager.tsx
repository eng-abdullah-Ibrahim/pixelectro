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
  const [uploadProgress, setUploadProgress] = useState("");
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    
    const files = Array.from(e.target.files);
    const total = files.length;
    let latestMediaList = mediaList;

    try {
      // 1. Get Upload Signature from Backend
      const signRes = await fetch('/api/admin/cloudinary-sign');
      if (!signRes.ok) throw new Error("Failed to get upload signature");
      const { timestamp, signature, cloudName, apiKey } = await signRes.json();

      // 2. Upload files sequentially directly to Cloudinary
      for (let i = 0; i < total; i++) {
        const file = files[i];
        setUploadProgress(`Uploading ${i + 1} of ${total}: ${file.name}...`);
        
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", "pixelectro/projects");
        
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadRes.ok) {
          throw new Error(`Failed to upload ${file.name} to Cloudinary`);
        }

        const cloudinaryData = await uploadRes.json();
        const url = cloudinaryData.secure_url;
        const type = cloudinaryData.resource_type === 'video' ? 'VIDEO' : 'IMAGE';

        // 3. Save URL to Database via Server Action
        const { saveDirectUploadToDb } = await import('./mediaActions');
        latestMediaList = await saveDirectUploadToDb(projectId, url, type);
        setMediaList(latestMediaList);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during upload. Please try again.");
    } finally {
      setUploadProgress("");
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
          {isUploading ? (uploadProgress || "Uploading...") : "Files uploaded here will be saved and displayed instantly."}
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
                {/* Order/Cover Badge */}
                <div style={{
                  position: 'absolute', top: 8, left: 8, 
                  background: index === 0 ? 'var(--blue-core)' : 'rgba(0,0,0,0.6)', 
                  color: 'white',
                  padding: index === 0 ? '4px 12px' : '0',
                  width: index === 0 ? 'auto' : '24px', 
                  height: '24px', 
                  borderRadius: index === 0 ? '12px' : '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 'bold', zIndex: 10,
                  backdropFilter: 'blur(4px)',
                  border: index === 0 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                  boxShadow: index === 0 ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                }}>
                  {index === 0 ? '🌟 Cover' : index + 1}
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
