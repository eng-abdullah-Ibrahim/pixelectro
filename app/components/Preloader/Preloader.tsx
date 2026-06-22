"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useTranslation } from '../TranslationProvider';
import styles from './Preloader.module.css';

/* ─────────────────────────────────────────────────────────────────
   CINEMATIC PRELOADER
   Philosophy: Single-source dramatic reveal. The counter is the art.
   Architecture: Wipe-out via clipPath — vertical curtain rising.
   Timing: 2.8s total — enough to feel intentional, not slow.
   ───────────────────────────────────────────────────────────────── */

export default function Preloader() {
  const wrapRef     = useRef<HTMLDivElement>(null);
  const counterRef  = useRef<HTMLDivElement>(null);
  const taglineRef  = useRef<HTMLDivElement>(null);
  const barRef      = useRef<HTMLDivElement>(null);
  const leftRef     = useRef<HTMLDivElement>(null);
  const rightRef    = useRef<HTMLDivElement>(null);
  const [count, setCount]   = useState(0);
  const [hidden, setHidden] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const TOTAL = 2200;
    const TICK  = 30;
    const STEPS = TOTAL / TICK;
    let current = 0;
    let frame   = 0;

    const ease = (t: number) => t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2; // cubic ease-in-out

    const timer = setInterval(() => {
      current++;
      const t = Math.min(current / STEPS, 1);
      const easedT = ease(t);
      const val = Math.floor(easedT * 100);
      setCount(val);

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${easedT})`;
      }

      if (t >= 1) {
        clearInterval(timer);
        setCount(100);

        // ── Cinematic Exit: split reveal ──────────────────────
        const tl = gsap.timeline({
          onComplete: () => setHidden(true)
        });

        tl
          .to([counterRef.current, taglineRef.current, barRef.current?.parentElement], {
            opacity: 0,
            y: -40,
            duration: 0.5,
            ease: 'power3.in',
            stagger: 0.05,
          })
          .to(leftRef.current, {
            xPercent: -100,
            duration: 1.0,
            ease: 'expo.inOut',
          }, '-=0.1')
          .to(rightRef.current, {
            xPercent: 100,
            duration: 1.0,
            ease: 'expo.inOut',
          }, '<');
      }
    }, TICK);

    return () => clearInterval(timer);
  }, []);

  if (hidden) return null;

  return (
    <div ref={wrapRef} className={styles.wrap} aria-hidden="true">
      {/* Left curtain panel */}
      <div ref={leftRef} className={`${styles.curtain} ${styles.curtainLeft}`} />
      {/* Right curtain panel */}
      <div ref={rightRef} className={`${styles.curtain} ${styles.curtainRight}`} />

      {/* Inner content: always centered vertically, left-anchored text */}
      <div className={styles.inner}>
        {/* Logo image — brand reveal */}
        <div className={styles.logoWrap}>
          <Image
            src="/logo.jpg"
            alt="Pixelectro"
            width={72}
            height={72}
            className={styles.logoImg}
            priority
          />
          <div className={styles.logoLabel}>
            <span className={styles.logoName}>PIXELECTRO</span>
            <span className={styles.logoSub}>{t('brand.forAdvertising') || 'FOR ADVERTISING'}</span>
          </div>
        </div>

        {/* Counter — the focal mass */}
        <div ref={counterRef} className={styles.counter} aria-label={`Loading: ${count}%`}>
          {String(count).padStart(3, '0')}
        </div>

        {/* Tagline */}
        <div ref={taglineRef} className={styles.tagline}>
          {t('brand.calibrating') || 'Calibrating the electric experience'}
        </div>

        {/* Progress bar */}
        <div className={styles.barTrack}>
          <div ref={barRef} className={styles.bar} />
        </div>
      </div>

      {/* Corner markers — cinematic framing device */}
      <div className={`${styles.corner} ${styles.tl}`} />
      <div className={`${styles.corner} ${styles.tr}`} />
      <div className={`${styles.corner} ${styles.bl}`} />
      <div className={`${styles.corner} ${styles.br}`} />
    </div>
  );
}
