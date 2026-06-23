"use client";

import { useState, useEffect, useRef } from 'react';
import Lightbox from './Lightbox';

type MediaItem = {
  id: string;
  url: string;
  type: string;
  projectId: string;
  createdAt: Date;
  order?: number;
};

export default function ProjectCarousel({ media, title }: { media: MediaItem[], title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const sortedMedia = [...media].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const items = sortedMedia;

  // Track visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 } // triggers when 10% of carousel is visible
    );
    if (carouselRef.current) observer.observe(carouselRef.current);
    return () => observer.disconnect();
  }, []);

  // Timer auto-play logic that runs ONLY when visible
  useEffect(() => {
    if (items.length <= 1 || !isVisible) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [items.length, currentIndex, isVisible]);

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) setCurrentIndex((prev) => (prev + 1) % items.length);
      else setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    }
    setTouchStartX(null);
  };

  const [loadedSlides, setLoadedSlides] = useState<boolean[]>([]);

  useEffect(() => {
    if (!isVisible) return; // Wait until carousel is in viewport
    setLoadedSlides(prev => {
      const newLoaded = [...prev];
      if (newLoaded.length !== items.length) {
        newLoaded.length = items.length;
        newLoaded.fill(false);
      }
      let changed = false;
      items.forEach((_, idx) => {
        let offset = idx - currentIndex;
        const half = Math.floor(items.length / 2);
        if (items.length > 2) {
          if (offset < -half) offset += items.length;
          if (offset > half) offset -= items.length;
        }
        if (offset >= -1 && offset <= 1) {
          if (!newLoaded[idx]) {
            newLoaded[idx] = true;
            changed = true;
          }
        }
      });
      return changed ? newLoaded : prev;
    });
  }, [currentIndex, items.length, isVisible]);

  if (items.length === 0) return null;

  return (
    <>
      <div 
        ref={carouselRef}
        style={{ 
          position: 'relative', 
          width: '100%', 
          height: '56vh',
          minHeight: '400px',
          background: 'transparent', 
          cursor: 'zoom-in',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '0',
          margin: '2rem 0',
          touchAction: 'pan-y',
          userSelect: 'none',
        }} 
        onClick={() => setLightboxOpen(true)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* Slides */}
        {items.map((m, idx) => {
          let offset = idx - currentIndex;
          const half = Math.floor(items.length / 2);
          
          if (items.length > 2) {
            if (offset < -half) offset += items.length;
            if (offset > half) offset -= items.length;
          }
          
          const isActive = offset === 0;
          const isPrev = offset === -1 || (items.length === 2 && offset === 1 && false);
          const isNext = offset === 1;
          const isVisibleSlide = isActive || isPrev || isNext;
          
          let transform = `translateX(${offset * 65}%) scale(${isActive ? 1 : 0.75})`;
          let opacity = isActive ? 1 : (isVisibleSlide ? 0.4 : 0);
          let zIndex = isActive ? 10 : (isVisibleSlide ? 5 : 1);
          let filter = isActive ? 'blur(0px)' : (isVisibleSlide ? 'blur(6px)' : 'blur(12px)');
          
          const shouldLoadSrc = loadedSlides[idx];

          return (
            <div 
              key={m.id} 
              style={{
                position: 'absolute',
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%',
                transition: 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
                transform, opacity, zIndex, filter,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: isActive ? 'auto' : 'none'
              }}
            >
              <div style={{
                width: '70%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  boxShadow: isActive ? '0 25px 50px rgba(0,0,0,0.25)' : 'none',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.6s ease',
                  display: 'flex'
                }}>
                {m.type === 'IMAGE' ? (() => {
                  const optimizedUrl = m.url.includes('cloudinary.com/') && m.url.includes('/upload/') 
                    ? m.url.replace('/upload/', '/upload/f_auto,q_auto,w_600/') 
                    : m.url;
                  return <img src={shouldLoadSrc ? optimizedUrl : undefined} alt={title} loading="lazy" style={{ maxWidth: '100%', maxHeight: '56vh', width: 'auto', height: 'auto', objectFit: 'contain', pointerEvents: 'none', display: 'block' }} />;
                })() : (
                  <video src={shouldLoadSrc ? m.url : undefined} style={{ maxWidth: '100%', maxHeight: '56vh', width: 'auto', height: 'auto', objectFit: 'contain', pointerEvents: 'none', display: 'block' }} muted loop playsInline autoPlay={isActive} />
                )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Controls */}
        {items.length > 1 && (
          <>
            <button onClick={prevSlide} style={{
              position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(10px)', border: 'none',
              color: 'white', fontSize: '1.4rem',
              width: 'clamp(36px, 6vw, 50px)', height: 'clamp(36px, 6vw, 50px)',
              cursor: 'pointer', borderRadius: '50%', zIndex: 20, transition: '0.3s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button onClick={nextSlide} style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(10px)', border: 'none',
              color: 'white', fontSize: '1.4rem',
              width: 'clamp(36px, 6vw, 50px)', height: 'clamp(36px, 6vw, 50px)',
              cursor: 'pointer', borderRadius: '50%', zIndex: 20, transition: '0.3s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            {/* Dots */}
            <div style={{
              position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: '8px', zIndex: 20, background: 'rgba(0,0,0,0.5)', padding: '6px 14px', borderRadius: '20px', alignItems: 'center', backdropFilter: 'blur(8px)'
            }}>
              {items.map((_, idx) => (
                <div key={idx} style={{
                  width: idx === currentIndex ? '20px' : '6px', height: '6px', borderRadius: '3px',
                  background: idx === currentIndex ? 'white' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.3s ease'
                }} />
              ))}
              <span style={{ color: 'white', fontSize: '0.75rem', marginLeft: '10px', fontFamily: 'monospace' }}>
                {currentIndex + 1} / {items.length}
              </span>
            </div>
          </>
        )}
      </div>

      {lightboxOpen && (
        <Lightbox items={items} initialIndex={currentIndex} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  );
}
