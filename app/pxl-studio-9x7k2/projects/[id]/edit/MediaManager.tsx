"use client";

import { useState, useRef } from "react";
import { uploadNewMedia, deleteMediaItem, updateMediaOrder } from "./mediaActions";

type MediaItem = {
  id: string;
  url: string;
  type: string;
  order: number;
  coverImage?: string | null;
  likesCount?: number;
  fakeLikes?: number;
  viewsCount?: number;
  fakeViews?: number;
  sharesCount?: number;
  fakeShares?: number;
};

export default function MediaManager({ projectId, initialMedia, contentType = "MEDIA" }: { projectId: string, initialMedia: MediaItem[], contentType?: string }) {
  const [mediaList, setMediaList] = useState<MediaItem[]>(initialMedia.sort((a, b) => a.order - b.order));
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const isPdfMode = contentType === "PDF_BOOK";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    
    const files = Array.from(e.target.files);
    const total = files.length;
    let latestMediaList = mediaList;

    try {
      // 1. Get Upload Signature from Backend
      const signRes = await fetch('/api/admin/cloudinary-sign?folder=pixelectro/projects');
      if (!signRes.ok) throw new Error("Failed to get upload signature");
      const { timestamp, signature, cloudName, apiKey } = await signRes.json();

      // 2. Upload files sequentially directly to Cloudinary
      for (let i = 0; i < total; i++) {
        let file = files[i];
        
        // --- AUTO COMPRESSION FOR LARGE PDFS ---
        if (file.type === "application/pdf" && file.size > 10 * 1024 * 1024) {
          setUploadProgress(`Compressing ${file.name} locally... (This may take a minute)`);
          try {
            const { compressPdf } = await import('../../../../components/PdfCompressor');
            file = await compressPdf(file);
            console.log("Compressed PDF size:", file.size);
          } catch (err) {
            console.error("Compression failed:", err);
            throw new Error(`Failed to compress ${file.name}. Please compress it manually.`);
          }
        }

        setUploadProgress(`Uploading ${i + 1} of ${total}: ${file.name}...`);
        
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", "pixelectro/projects");
        
        // If uploading PDF for flipbook, we must upload as 'image' resource type so Cloudinary rasterizes it
        const uploadUrl = isPdfMode 
          ? `https://api.cloudinary.com/v1_1/${cloudName}/image/upload` 
          : `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

        const uploadRes = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          console.error("Cloudinary Upload Error:", errData);
          const errMsg = errData.error?.message || 'Unknown error';
          if (errMsg.includes('File size too large')) {
            throw new Error(`The file "${file.name}" exceeds your Cloudinary plan's 10MB limit. Please compress the PDF (e.g. using ilovepdf.com) to under 10MB before uploading.`);
          }
          throw new Error(`Cloudinary Error: ${errMsg}`);
        }

        const cloudinaryData = await uploadRes.json();
        let url = cloudinaryData.secure_url;
        let type = cloudinaryData.resource_type === 'video' ? 'VIDEO' : 'IMAGE';

        if (isPdfMode && file.type === "application/pdf") {
          type = 'PDF';
          // Cloudinary returns the number of pages for PDFs uploaded as images
          if (cloudinaryData.pages) {
            url += `#pages=${cloudinaryData.pages}`;
          }
        }

        // 3. Save URL to Database via Server Action
        const { saveDirectUploadToDb } = await import('./mediaActions');
        latestMediaList = await saveDirectUploadToDb(projectId, url, type);
        setMediaList(latestMediaList);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred during upload. Please try again.");
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
        <label className="label">
          {isPdfMode ? "Upload PDF Book" : "Live Media Upload (Images / Videos)"}
        </label>
        <input 
          type="file" 
          className="input" 
          accept={isPdfMode ? "application/pdf" : "image/*,video/*"} 
          multiple 
          onChange={handleFileChange}
          disabled={isUploading}
          style={{ padding: "8px", opacity: isUploading ? 0.5 : 1 }} 
        />
        <div style={{ fontSize: "0.8rem", color: "var(--adm-muted)", marginTop: "4px" }}>
          {isUploading ? (uploadProgress || "Uploading...") : (isPdfMode ? "Upload a PDF. It will be automatically converted to a 3D book." : "Files uploaded here will be saved and displayed instantly.")}
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

                {m.type === 'PDF' ? (
                  <div style={{ width: '100%', height: '150px', background: '#eee', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '2rem' }}>📚</span>
                    <span style={{ fontSize: '0.8rem', marginTop: '8px', color: '#555', fontWeight: 'bold' }}>PDF Book</span>
                    <span style={{ fontSize: '0.7rem', color: '#777' }}>
                      {m.url.includes('#pages=') ? `${m.url.split('#pages=')[1]} Pages` : ''}
                    </span>
                  </div>
                ) : m.type === 'IMAGE' ? (
                  <img src={m.url} alt={`Media ${index + 1}`} style={{ width: '100%', height: '150px', objectFit: 'cover', pointerEvents: 'none' }} />
                ) : (
                  <video src={m.url} style={{ width: '100%', height: '150px', objectFit: 'cover', pointerEvents: 'none' }} muted />
                )}
                
                <div style={{ padding: '0.5rem', background: '#fff' }}>
                  {(isPdfMode && m.type === "PDF") && (
                    <div className="flex flex-col gap-2 mt-2 w-full">
                      {m.coverImage && (
                        <div className="text-xs text-green-400">✅ Custom cover set</div>
                      )}
                      <label className="text-xs px-2 py-1 bg-neutral-800 text-neutral-300 rounded hover:bg-neutral-700 cursor-pointer text-center">
                        {m.coverImage ? "Change Cover Image" : "Upload Custom Cover"}
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            setUploadProgress("Uploading cover image...");
                            setIsUploading(true);
                            
                            try {
                              // Get Signature
                              const signRes = await fetch('/api/admin/cloudinary-sign?folder=pixelectro/projects');
                              if (!signRes.ok) throw new Error("Failed to get signature");
                              const { timestamp, signature, cloudName, apiKey } = await signRes.json();
                              
                              // Upload to Cloudinary
                              const formData = new FormData();
                              formData.append("file", file);
                              formData.append("api_key", apiKey);
                              formData.append("timestamp", timestamp);
                              formData.append("signature", signature);
                              formData.append("folder", "pixelectro/projects");
                              
                              const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
                                method: "POST",
                                body: formData,
                              });
                              
                              if (!res.ok) throw new Error("Cloudinary upload failed");
                              const data = await res.json();
                              
                              // Update database
                              const { updateMediaCover } = await import("./mediaActions");
                              await updateMediaCover(m.id, projectId, data.secure_url);
                              setMediaList(prev => prev.map(item => item.id === m.id ? {...item, coverImage: data.secure_url} : item));
                              alert("Cover updated successfully!");
                            } catch (err) {
                              console.error("Cover upload error:", err);
                              alert("Failed to upload cover.");
                            } finally {
                              setIsUploading(false);
                            }
                          }}
                        />
                      </label>
                      <div className="flex gap-2 mt-2">
                        <div className="flex flex-col flex-1">
                          <label className="text-xs text-neutral-400 mb-1">Fake Likes</label>
                          <input 
                            type="number" 
                            defaultValue={m.fakeLikes || 0}
                            className="bg-neutral-800 text-white p-1 rounded text-xs border border-neutral-700"
                            onBlur={async (e) => {
                              const val = parseInt(e.target.value) || 0;
                              const { updateMediaStats } = await import("./mediaActions");
                              await updateMediaStats(m.id, projectId, { fakeLikes: val, fakeViews: m.fakeViews || 0, fakeShares: m.fakeShares || 0 });
                              setMediaList(prev => prev.map(item => item.id === m.id ? {...item, fakeLikes: val} : item));
                            }}
                          />
                        </div>
                        <div className="flex flex-col flex-1">
                          <label className="text-xs text-neutral-400 mb-1">Fake Views</label>
                          <input 
                            type="number" 
                            defaultValue={m.fakeViews || 0}
                            className="bg-neutral-800 text-white p-1 rounded text-xs border border-neutral-700"
                            onBlur={async (e) => {
                              const val = parseInt(e.target.value) || 0;
                              const { updateMediaStats } = await import("./mediaActions");
                              await updateMediaStats(m.id, projectId, { fakeLikes: m.fakeLikes || 0, fakeViews: val, fakeShares: m.fakeShares || 0 });
                              setMediaList(prev => prev.map(item => item.id === m.id ? {...item, fakeViews: val} : item));
                            }}
                          />
                        </div>
                        <div className="flex flex-col flex-1">
                          <label className="text-xs text-neutral-400 mb-1">Fake Shares</label>
                          <input 
                            type="number" 
                            defaultValue={m.fakeShares || 0}
                            className="bg-neutral-800 text-white p-1 rounded text-xs border border-neutral-700"
                            onBlur={async (e) => {
                              const val = parseInt(e.target.value) || 0;
                              const { updateMediaStats } = await import("./mediaActions");
                              await updateMediaStats(m.id, projectId, { fakeLikes: m.fakeLikes || 0, fakeViews: m.fakeViews || 0, fakeShares: val });
                              setMediaList(prev => prev.map(item => item.id === m.id ? {...item, fakeShares: val} : item));
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <button  
                    type="button" 
                    onClick={() => handleDelete(m.id)}
                    className="btnDanger" 
                    style={{ width: '100%', padding: '4px', fontSize: '0.8rem', marginTop: '0.5rem' }}
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
