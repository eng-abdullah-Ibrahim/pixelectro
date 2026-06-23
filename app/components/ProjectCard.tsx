"use client";

import { useTranslation } from './TranslationProvider';
import styles from './PortfolioGrid/PortfolioGrid.module.css';

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
  translations?: any;
};

export default function ProjectCard({ project, onClick }: { project: Project, onClick: () => void }) {
  const { locale } = useTranslation();

  const title = (locale !== 'en' && project.translations?.[locale]?.title)
    ? project.translations[locale].title
    : project.title;
    
  const desc = (locale !== 'en' && project.translations?.[locale]?.description)
    ? project.translations[locale].description
    : project.description;

  const sortedMedia = [...project.media].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const coverMedia = sortedMedia.length > 0 ? sortedMedia[0] : null;
  
  let coverUrl = '';
  if (coverMedia) {
    if (coverMedia.type === 'IMAGE') {
      coverUrl = coverMedia.url.includes('cloudinary.com/') && coverMedia.url.includes('/upload/') 
        ? coverMedia.url.replace('/upload/', '/upload/c_fill,w_600,h_800,f_auto,q_auto/') 
        : coverMedia.url;
    } else {
      coverUrl = coverMedia.url; // for video
    }
  }

  return (
    <div 
      className={styles.projectCard} 
      onClick={onClick}
      style={{
        cursor: 'pointer',
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        background: 'rgba(25, 25, 25, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s ease',
        display: 'flex',
        flexDirection: 'column',
        aspectRatio: '4/5',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
      }}
    >
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {coverMedia && coverMedia.type === 'IMAGE' ? (
          <img 
            src={coverUrl} 
            alt={title} 
            loading="lazy" 
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease' }} 
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
        ) : coverMedia && coverMedia.type === 'VIDEO' ? (
          <video 
            src={coverMedia.url} 
            muted 
            loop 
            playsInline 
            autoPlay 
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease' }} 
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#333' }} />
        )}
        
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          padding: '40px 20px 20px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          pointerEvents: 'none'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#fff', fontWeight: 600, letterSpacing: '-0.02em' }}>
            {title}
          </h3>
          {desc && (
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {desc.replace(/(<([^>]+)>)/gi, "")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
