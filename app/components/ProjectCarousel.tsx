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

const ProgressiveCarouselImage = ({ url, alt, shouldLoadSrc }: { url: string, alt: string, shouldLoadSrc: boolean }) => {
  const isCloudinary = url.includes('cloudinary.com/') && url.includes('/upload/');
  
  // Tiny placeholder (fast load)
  const placeholderUrl = isCloudinary ? url.replace('/upload/', '/upload/f_auto,q_auto,w_100,e_blur:200/') : url;
  
  // High quality for carousel (600px is enough)
  const hqUrl = isCloudinary ? url.replace('/upload/', '/upload/f_auto,q_auto,w_600/') : url;

  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const isLoaded = loadedUrl === hqUrl;

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
      {shouldLoadSrc && (
        <>
          <img src={placeholderUrl} alt={alt} style={{
            maxWidth: '100%', maxHeight: '56vh', width: 'auto', height: 'auto', objectFit: 'contain', 
            position: 'absolute', pointerEvents: 'none',
            transition: 'opacity 0.6s ease', opacity: isLoaded ? 0 : 1
          }} />
          <img src={hqUrl} alt={alt} onLoad={() => setLoadedUrl(hqUrl)} loading="lazy" style={{
            maxWidth: '100%', maxHeight: '56vh', width: 'auto', height: 'auto', objectFit: 'contain', 
            position: 'relative', pointerEvents: 'none',
            transition: 'opacity 0.6s ease', opacity: isLoaded ? 1 : 0, zIndex: 2
          }} />
        </>
      )}
    </div>
  );
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
          perspective: '1200px' // Add perspective for 3D effect
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
          
          // 3D Coverflow Calculations - Cinematic & Glassy
          let translateX = offset * 35; // Bring them much closer to the center
          let translateZ = isActive ? 0 : Math.abs(offset) * -150; // Push back progressively
          let rotateY = isActive ? 0 : (offset < 0 ? 40 : -40); // Sharper angle
          let scale = isActive ? 1 : 0.85;
          let opacity = isActive ? 1 : (isVisibleSlide ? 0.8 : 0);
          let zIndex = isActive ? 10 : (isVisibleSlide ? 5 : 1);
          let filter = isActive ? 'blur(0px) brightness(1)' : (isVisibleSlide ? 'blur(2px) brightness(0.4)' : 'blur(12px)');
          
          const transform = `translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
          
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
                transition: 'all 0.7s cubic-bezier(0.25, 1, 0.5, 1)',
                transform, opacity, zIndex, filter,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: isActive ? 'auto' : 'none',
                transformStyle: 'preserve-3d'
              }}
            >
              <div style={{
                width: '70%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                
                {/* Ambient Glow behind active slide */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    top: '10%',
                    left: '10%',
                    width: '80%',
                    height: '80%',
                    background: 'rgba(255,255,255,0.05)',
                    boxShadow: '0 0 100px 40px rgba(255,255,255,0.05)',
                    borderRadius: '50%',
                    filter: 'blur(40px)',
                    zIndex: -1
                  }} />
                )}

                <div style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  boxShadow: isActive ? '0 30px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)' : '0 10px 30px rgba(0,0,0,0.5)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.7s ease',
                  display: 'flex',
                  background: 'rgba(20, 20, 20, 0.4)', // Glassy backdrop
                  backdropFilter: 'blur(20px)'
                }}>
                {m.type === 'IMAGE' ? (
                  <ProgressiveCarouselImage url={m.url} alt={title} shouldLoadSrc={shouldLoadSrc} />
                ) : (
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
