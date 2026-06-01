"use client";

import { useState, useEffect } from 'react';
import styles from '../components/PortfolioGrid/PortfolioGrid.module.css';
import { sceneRegistry } from '../components/ThreeCanvas/DisciplineScenes';
import ProjectCarousel from '../components/ProjectCarousel';
import ProjectStats from '../components/ProjectStats';

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
};

type Category = {
  id: string;
  name: string;
  slug: string;
  projects: Project[];
  order: number;
};

export default function PortfolioGrid({ title, description, categories, sceneIdentifier, serviceSlug }: { title: string, description: string | null, categories: Category[], sceneIdentifier: string, serviceSlug: string }) {
  const activeCategories = categories.filter(c => c.projects.length > 0);
  
  // Resolve the dynamic 3D scene from the registry, default to BrandingScene if missing
  const SceneComponent = sceneRegistry[sceneIdentifier] || sceneRegistry['BrandingScene'];

  useEffect(() => {
    activeCategories.forEach(cat => {
      // Track category view
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'CATEGORY_VIEW',
          targetId: cat.id,
          targetName: cat.name,
        }),
      }).catch(err => console.error('Failed to track category view:', err));

      // Track project views in this category
      cat.projects.forEach(proj => {
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'PROJECT_VIEW',
            targetId: proj.id,
            targetName: proj.title,
          }),
        }).catch(err => console.error('Failed to track project view:', err));
      });
    });
  }, [categories]);

  return (
    <>
      <section className={styles.portfolioSection}>
        <div className={styles.header}>
          <SceneComponent />
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.description}>{description}</p>}
        </div>

        <div className={styles.categoriesContainer}>
          {activeCategories.length > 0 ? (
            activeCategories.map(cat => (
              <div key={cat.id} className={styles.categoryBlock}>
                <h2 className={styles.categoryTitle}>{cat.name}</h2>
                <div className={styles.projectsContainer}>
                  {cat.projects.map(project => (
                    <div key={project.id} id={`project-${project.id}`} className={styles.projectBlock}>
                      <div className={styles.projectHeader}>
                        <div>
                          <h3 className={styles.projectTitle}>{project.title}</h3>
                          {project.description && <p className={styles.projectDesc}>{project.description}</p>}
                        </div>
                      </div>
                      <div style={{ marginTop: '1.5rem' }}>
                        <ProjectCarousel 
                          media={project.media} 
                          title={project.title} 
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
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--ink-dim)', fontSize: '1.2rem' }}>
              No projects have been added yet.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
