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

export default function PortfolioGrid({ title, description, categories, sceneIdentifier, serviceSlug, allTranslations }: { title: string, description: string | null, categories: Category[], sceneIdentifier: string, serviceSlug: string, allTranslations?: any }) {
  const { locale, t } = useTranslation();
  const activeCategories = categories.filter(c => c.projects.length > 0);
  
  // Resolve the dynamic 3D scene from the registry, default to BrandingScene if missing
  const SceneComponent = sceneRegistry[sceneIdentifier] || sceneRegistry['BrandingScene'];

  // Derive localized page title and description from allTranslations
  const localizedTitle = (locale !== 'en' && allTranslations?.[locale]?.title) ? allTranslations[locale].title : title;
  const localizedDescription = (locale !== 'en' && allTranslations?.[locale]?.description) ? allTranslations[locale].description : description;

  useEffect(() => {
    activeCategories.forEach(cat => {
      // Track category view — once per browser per category
      trackCategoryView(cat.id, cat.name);

      // Track project views in this category — once per browser per project
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
                <div key={cat.id} className={styles.categoryBlock}>
                  <h2 className={styles.categoryTitle}>{catName}</h2>
                  <div className={styles.projectsContainer}>
                    {cat.projects.map(project => {
                      // Client-side project title/description translation
                      const projTitle = (locale !== 'en' && project.translations?.[locale]?.title)
                        ? project.translations[locale].title
                        : project.title;
                      const projDesc = (locale !== 'en' && project.translations?.[locale]?.description)
                        ? project.translations[locale].description
                        : project.description;
                      return (
                        <div key={project.id} id={`project-${project.id}`} className={styles.projectBlock}>
                          <div className={styles.projectHeader}>
                            <div>
                              <h3 className={styles.projectTitle}>{projTitle}</h3>
                              {projDesc && (
                                <div 
                                  className={`${styles.projectDesc} prose-custom`} 
                                  dangerouslySetInnerHTML={{ __html: projDesc }} 
                                />
                              )}
                            </div>
                          </div>
                          <div style={{ marginTop: '1.5rem' }}>
                            <ProjectCarousel 
                              media={project.media} 
                              title={projTitle} 
                            />
                          </div>
                          <ProjectStats 
                            projectId={project.id}
                            serviceSlug={serviceSlug}
                            initialLikes={project.likesCount ?? 0}
                            initialFakeLikes={project.fakeLikes ?? 0}
                            initialViews={project.viewsCount ?? 0}
                            initialFakeViews={project.fakeViews ?? 0}
                            initialShares={project.sharesCount ?? 0}
                            initialFakeShares={project.fakeShares ?? 0}
                          />
                        </div>
                      );
                    })}
                  </div>
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
    </>
  );
}
