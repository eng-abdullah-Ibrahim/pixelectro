"use client";

import { useEffect, useState } from 'react';
import ProjectCarousel from './ProjectCarousel';
import ProjectStats from './ProjectStats';
import { useTranslation } from './TranslationProvider';

type MediaItem = {
  id: string;
  url: string;
  type: string;
  projectId: string;
  createdAt: Date;
  order?: number;
};

type Project = {
  id: string;
  title: string;
  description: string | null;
  media: MediaItem[];
  order: number;
  likesCount?: number;
  fakeLikes?: number;
  viewsCount?: number;
  fakeViews?: number;
  sharesCount?: number;
  fakeShares?: number;
  translations?: any;
};

import PdfFlipbookViewer from './PdfFlipbookViewer';

export default function ProjectViewerModal({ 
  project, 
  serviceSlug, 
  contentType,
  initialBookIndex = 0,
  onClose 
}: { 
  project: Project, 
  serviceSlug: string, 
  contentType?: string,
  initialBookIndex?: number,
  onClose: () => void 
}) {
  const { locale } = useTranslation();
  const [mounted, setMounted] = useState(false);

  // If this is a PDF Book, render the specialized full-screen Flipbook Viewer
  if (contentType === "PDF_BOOK") {
    // Only pass PDF media items
    const pdfMedia = project.media.filter(m => m.type === 'PDF');
    return <PdfFlipbookViewer media={pdfMedia} initialBookIndex={initialBookIndex} onClose={onClose} />;
  }

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const projTitle = (locale !== 'en' && project.translations?.[locale]?.title)
    ? project.translations[locale].title
    : project.title;
    
  const projDesc = (locale !== 'en' && project.translations?.[locale]?.description)
    ? project.translations[locale].description
    : project.description;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 999999,
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(5, 5, 5, 0.85)',
      backdropFilter: 'blur(25px)',
      opacity: mounted ? 1 : 0,
      transition: 'opacity 0.4s ease',
      overflowY: 'auto'
    }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 40px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'linear-gradient(to bottom, rgba(5,5,5,0.9) 0%, rgba(5,5,5,0) 100%)'
      }}>
        <h2 style={{ color: '#fff', margin: 0, fontSize: '1.5rem', fontWeight: 500, letterSpacing: '-0.02em' }}>
          {projTitle}
        </h2>
        
        <button 
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, padding: '0 40px 60px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        
        {/* Carousel */}
        <div style={{ marginTop: '20px', marginBottom: '60px' }}>
          <ProjectCarousel media={project.media} title={projTitle} />
        </div>

        {/* Details & Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px', maxWidth: '800px', margin: '0 auto' }}>
          
          {projDesc && (
            <div 
              className="prose-custom" 
              style={{ 
                color: 'rgba(255,255,255,0.85)', 
                fontSize: '1.1rem', 
                lineHeight: 1.8,
                textAlign: 'center',
                maxWidth: '800px',
                margin: '40px auto 0'
              }}
              dangerouslySetInnerHTML={{ __html: projDesc }} 
            />
          )}
        </div>
      </div>

      {/* Stats Bar (Sticky Bottom) */}
      <div style={{ 
        padding: '24px 40px', 
        borderTop: '1px solid rgba(255,255,255,0.05)', 
        background: 'rgba(5,5,5,0.98)',
        position: 'sticky',
        bottom: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
          <ProjectStats 
            projectId={project.id}
            targetType="PROJECT"
            serviceSlug={serviceSlug}
            initialLikes={project.likesCount || 0}
            initialFakeLikes={project.fakeLikes || 0}
            initialViews={project.viewsCount || 0}
            initialFakeViews={project.fakeViews || 0}
            initialShares={project.sharesCount || 0}
            initialFakeShares={project.fakeShares || 0}
          />
        </div>
      </div>
    </div>
  );
}
