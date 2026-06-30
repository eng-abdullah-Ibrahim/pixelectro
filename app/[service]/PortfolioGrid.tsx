"use client";

import { useState, useEffect } from 'react';
import styles from '../components/PortfolioGrid/PortfolioGrid.module.css';
import { sceneRegistry } from '../components/ThreeCanvas/DisciplineScenes';
import ProjectCarousel from '../components/ProjectCarousel';
import ProjectStats from '../components/ProjectStats';
import { useTranslation } from '../components/TranslationProvider';

type MediaItem = {
  id: string;
  url: string;
  type: string;
  projectId: string;
  createdAt: Date;
  order: number;
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
  coverImage?: string | null;
  translations?: any;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  projects: Project[];
  order: number;
  translations?: any;
};

import { trackCategoryView, trackProjectView } from '../../lib/tracking';

function getLocalized(obj: any, field: string, locale: string, fallback: string) {
  if (locale === 'en' || !obj?.translations) return fallback;
  const t = obj.translations[locale];
  if (!t) return fallback;
  return t[field] || t['title'] || fallback;
}

import ProjectCard from '../components/ProjectCard';
import ProjectViewerModal from '../components/ProjectViewerModal';
import PdfProjectSlider from '../components/PdfProjectSlider';

export default function PortfolioGrid({ title, description, categories, sceneIdentifier, serviceSlug, contentType, allTranslations }: { title: string, description: string | null, categories: Category[], sceneIdentifier: string, serviceSlug: string, contentType?: string, allTranslations?: any }) {
  const { locale, t } = useTranslation();
  const activeCategories = categories.filter(c => c.projects.length > 0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Resolve the dynamic 3D scene from the registry, default to BrandingScene if missing
  const SceneComponent = sceneRegistry[sceneIdentifier] || sceneRegistry['BrandingScene'];

  // Derive localized page title and description from allTranslations
  const localizedTitle = (locale !== 'en' && allTranslations?.[locale]?.title) ? allTranslations[locale].title : title;
  const localizedDescription = (locale !== 'en' && allTranslations?.[locale]?.description) ? allTranslations[locale].description : description;

  useEffect(() => {
    activeCategories.forEach(cat => {
      trackCategoryView(cat.id, cat.name);
      cat.projects.forEach(proj => {
        trackProjectView(proj.id, proj.title);
      });
    });
  }, [categories]);

  return (
    <>
      <section className={styles.portfolioSection}>
        <div className={styles.header}>
          <SceneComponent />
          <h1 className={styles.title}>{localizedTitle}</h1>
          {localizedDescription && (
            <div 
              className={`${styles.description} prose-custom`} 
              dangerouslySetInnerHTML={{ __html: localizedDescription }} 
            />
          )}
        </div>

        <div className={styles.categoriesContainer}>
          {activeCategories.length > 0 ? (
            activeCategories.map(cat => {
              // Try to translate category by slug or name using custom translation provider
              let catName = cat.name;
              const translatedBySlug = t(`categories.${cat.slug}`);
              const translatedByName = t(`categories.${cat.name.toLowerCase().replace(/\s+/g, '-')}`);
              
              if (translatedBySlug && translatedBySlug !== `categories.${cat.slug}`) {
                catName = translatedBySlug;
              } else if (translatedByName && translatedByName !== `categories.${cat.name.toLowerCase().replace(/\s+/g, '-')}`) {
                catName = translatedByName;
              } else {
                catName = getLocalized(cat, 'title', locale, cat.name);
              }
              
              return (
                <div key={cat.id} className={styles.categoryBlock} style={{ marginBottom: '80px' }}>
                  <h2 className={styles.categoryTitle} style={{ marginBottom: '30px' }}>{catName}</h2>
                  
                  {contentType === 'PDF_BOOK' ? (
                    <div>
                      {cat.projects.map(project => (
                        <PdfProjectSlider 
                          key={project.id} 
                          project={project} 
                          serviceSlug={serviceSlug} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                      gap: '24px'
                    }}>
                      {cat.projects.map(project => (
                        <ProjectCard 
                          key={project.id} 
                          project={project} 
                          contentType={contentType}
                          onClick={() => setSelectedProject(project)} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--ink-dim)', fontSize: '1.2rem' }}>
              {t('common.noProjectsYet') || 'No projects have been added yet.'}
            </p>
          )}
        </div>
      </section>

      {selectedProject && (
        <ProjectViewerModal 
          project={selectedProject} 
          serviceSlug={serviceSlug} 
          contentType={contentType}
          onClose={() => setSelectedProject(null)} 
        />
      )}
    </>
  );
}
