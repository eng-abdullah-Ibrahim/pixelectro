"use client";

import { useEffect, useState } from "react";

type MediaItem = { url: string; type: string; };

export default function Lightbox({ items, initialIndex, onClose }: { items: MediaItem[], initialIndex: number, onClose: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrentIndex((prev) => (prev + 1) % items.length);
      if (e.key === "ArrowLeft") setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [items.length, onClose]);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      if (dx < 0) setCurrentIndex((prev) => (prev + 1) % items.length);
      else setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    }
    setTouchStartX(null);
  };

  const currentMedia = items[currentIndex];
  if (!currentMedia) return null;

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh',
        backgroundColor: 'rgba(0,0,0,0.96)', zIndex: 99999,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        backdropFilter: 'blur(12px)',
        touchAction: 'pan-y',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close */}
      <button onClick={onClose} style={{
        position: 'absolute', top: 16, right: 16,
        background: 'rgba(255,255,255,0.12)', border: 'none',
        color: 'white', fontSize: '1.5rem', cursor: 'pointer', zIndex: 100000,
        width: 44, height: 44, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>✕</button>

      {/* Prev */}
      {items.length > 1 && (
        <button onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev - 1 + items.length) % items.length); }} style={{
          position: 'absolute', left: 8,
          background: 'rgba(255,255,255,0.12)', border: 'none',
          color: 'white', fontSize: '1.8rem',
          width: 'clamp(40px,8vw,56px)', height: 'clamp(40px,8vw,56px)',
          cursor: 'pointer', borderRadius: '50%', zIndex: 100000, transition: '0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>‹</button>
      )}

      {/* Media */}
      <div style={{
        maxWidth: '92vw', maxHeight: '88dvh',
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }} onClick={(e) => e.stopPropagation()}>
        {currentMedia.type === 'IMAGE' ? (
          <img src={currentMedia.url} alt="Enlarged" style={{
            maxWidth: '100%', maxHeight: '88dvh',
            objectFit: 'contain', userSelect: 'none',
            borderRadius: 12,
          }} />
        ) : (
          <video src={currentMedia.url} controls controlsList="nodownload" autoPlay style={{
            maxWidth: '100%', maxHeight: '88dvh', outline: 'none', borderRadius: 12,
          }} />
        )}
      </div>

      {/* Next */}
      {items.length > 1 && (
        <button onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev + 1) % items.length); }} style={{
          position: 'absolute', right: 8,
          background: 'rgba(255,255,255,0.12)', border: 'none',
          color: 'white', fontSize: '1.8rem',
          width: 'clamp(40px,8vw,56px)', height: 'clamp(40px,8vw,56px)',
          cursor: 'pointer', borderRadius: '50%', zIndex: 100000, transition: '0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>›</button>
      )}

      {/* Counter */}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        color: 'white', fontSize: '0.85rem',
        background: 'rgba(0,0,0,0.55)', padding: '5px 16px', borderRadius: '20px',
        backdropFilter: 'blur(8px)',
      }}>
        {currentIndex + 1} / {items.length}
      </div>
    </div>
  );
}
