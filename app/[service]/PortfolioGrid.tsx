"use client";

import { useState } from 'react';
import styles from '../components/PortfolioGrid/PortfolioGrid.module.css';
import { sceneRegistry } from '../components/ThreeCanvas/DisciplineScenes';
import ProjectCarousel from '../components/ProjectCarousel';

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
};

type Category = {
  id: string;
  name: string;
  slug: string;
  projects: Project[];
  order: number;
};

export default function PortfolioGrid({ title, description, categories, sceneIdentifier }: { title: string, description: string | null, categories: Category[], sceneIdentifier: string }) {
  const activeCategories = categories.filter(c => c.projects.length > 0);
  
  // Resolve the dynamic 3D scene from the registry, default to BrandingScene if missing
  const SceneComponent = sceneRegistry[sceneIdentifier] || sceneRegistry['BrandingScene'];

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
                    <div key={project.id} className={styles.projectBlock}>
                      <div className={styles.projectHeader}>
                        <h3 className={styles.projectTitle}>{project.title}</h3>
                        {project.description && <p className={styles.projectDesc}>{project.description}</p>}
                      </div>
                      <div style={{ marginTop: '1.5rem' }}>
                        <ProjectCarousel 
                          media={project.media} 
                          title={project.title} 
                        />
                      </div>
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
