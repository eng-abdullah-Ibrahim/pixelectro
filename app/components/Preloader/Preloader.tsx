"use client";

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import styles from './Preloader.module.css';

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Simulated hybrid loading interval (2.5s to reach 100%)
    const duration = 2500;
    const interval = 50; // update every 50ms
    const steps = duration / interval;
    const increment = 100 / steps;
    let currentProgress = 0;

    const timer = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(timer);
        
        // Trigger completion animation
        const tl = gsap.timeline({
          onComplete: () => setHidden(true)
        });
        
        tl.to(textRef.current, {
          opacity: 0,
          y: -50,
          duration: 0.5,
          ease: 'power3.in',
          delay: 0.2
        })
        .to(preloaderRef.current, {
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
          duration: 1.2,
          ease: 'expo.inOut',
        });
      }
      setProgress(Math.floor(currentProgress));
    }, interval);

    return () => clearInterval(timer);
  }, []);

  if (hidden) return null;

  return (
    <div ref={preloaderRef} className={styles.preloader}>
      <div className={styles.gridOverlay}></div>
      <div ref={textRef} className={styles.content}>
        <div className={styles.glitchText} data-text="PIXELECTRO">PIXELECTRO</div>
        <div className={styles.loadingBarContainer}>
          <div className={styles.loadingBar} style={{ width: `${progress}%` }}></div>
        </div>
        <div className={styles.percentage}>{progress}%</div>
        <div className={styles.statusText}>Initializing Cinematic Experience...</div>
      </div>
    </div>
  );
}
