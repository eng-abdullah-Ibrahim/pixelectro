"use client";

import { useRef, useState, useEffect } from 'react';
import ProjectViewerModal from './ProjectViewerModal';
import { useTranslation } from './TranslationProvider';

type MediaItem = {
  id: string;
  url: string;
  type: string;
  projectId: string;
  createdAt: Date;
  order?: number;
  coverImage?: string | null;
};

type Project = {
  id: string;
  title: string;
  description: string | null;
  media: MediaItem[];
  translations?: any;
};

export default function PdfProjectSlider({ project, serviceSlug }: { project: Project, serviceSlug: string }) {
  const { locale } = useTranslation();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [selectedBookIndex, setSelectedBookIndex] = useState<number | null>(null);

  const title = (locale !== 'en' && project.translations?.[locale]?.title)
    ? project.translations[locale].title
    : project.title;

  const pdfMedia = project.media.filter(m => m.type === 'PDF');

  // Helper to get thumbnail
  const getThumbnail = (mediaItem: MediaItem) => {
    if (mediaItem.coverImage) return mediaItem.coverImage;
    const url = mediaItem.url;
    const urlWithoutHash = url.split('#')[0];
    if (!urlWithoutHash.includes('/upload/')) return urlWithoutHash;
    return urlWithoutHash.replace('/upload/', '/upload/c_fill,w_400,h_550,f_jpg,pg_1/');
  };

  const checkScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setShowLeftArrow(scrollLeft > 5);
    setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [pdfMedia.length]);

  const slide = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const scrollAmount = direction === 'left' ? -300 : 300;
    sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(checkScroll, 350);
  };

  if (pdfMedia.length === 0) return null;

  return (
    <div style={{ marginBottom: '60px', position: 'relative' }}>
      <h3 style={{ 
        color: '#fff', 
        fontSize: '1.4rem', 
        marginBottom: '20px', 
        fontWeight: 600,
        paddingBottom: '10px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        {title}
      </h3>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        
        {/* Left Arrow */}
        {showLeftArrow && (
          <button 
            onClick={() => slide('left')}
            style={{
              position: 'absolute', left: '-20px', zIndex: 10,
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(10px)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            ←
          </button>
        )}

        {/* Slider Track */}
        <div 
          ref={sliderRef}
          onScroll={checkScroll}
          style={{
            display: 'flex',
            gap: '20px',
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            padding: '10px 0'
          }}
        >
          {pdfMedia.map((media, index) => (
            <div 
              key={media.id} 
              onClick={() => setSelectedBookIndex(index)}
              style={{
                flex: '0 0 calc(25% - 15px)', // Max 4 items visible
                minWidth: '220px',
                aspectRatio: '4/5.5',
                scrollSnapAlign: 'start',
                cursor: 'pointer',
                borderRadius: '8px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
              }}
            >
              <img 
                src={getThumbnail(media)} 
                alt={`Book Cover ${index + 1}`}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Label and Stats */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, width: '100%',
                padding: '30px 10px 10px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)',
                color: 'white', display: 'flex', flexDirection: 'column', gap: '8px'
              }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, textAlign: 'center' }}>
                  Book {index + 1}
                </div>
                
                {/* Outside Stats */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    <span>{((media as any).likesCount || 0) + ((media as any).fakeLikes || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    <span>{((media as any).viewsCount || 0) + ((media as any).fakeViews || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        {showRightArrow && pdfMedia.length > 4 && (
          <button 
            onClick={() => slide('right')}
            style={{
              position: 'absolute', right: '-20px', zIndex: 10,
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(10px)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            →
          </button>
        )}
      </div>

      {/* Render the Flipbook Viewer Modals if a book is clicked */}
      {selectedBookIndex !== null && (
        <ProjectViewerModal 
          project={project}
          serviceSlug={serviceSlug}
          contentType="PDF_BOOK"
          initialBookIndex={selectedBookIndex}
          onClose={() => setSelectedBookIndex(null)}
        />
      )}
    </div>
  );
}
