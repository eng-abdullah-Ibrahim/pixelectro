"use client";

import { useEffect, useRef } from 'react';
import styles from './CustomCursor.module.css';

export default function CustomCursor() {
  const dotRef     = useRef<HTMLDivElement>(null);
  const ringRef    = useRef<HTMLDivElement>(null);

  // Actual mouse position
  const mouse      = useRef({ x: -200, y: -200 });
  // Lagged ring position (smooth follow)
  const ring       = useRef({ x: -200, y: -200 });
  const isHovered  = useRef(false);
  const rafId      = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      isHovered.current = !!(
        t.tagName === 'A'      ||
        t.tagName === 'BUTTON' ||
        t.closest('a')         ||
        t.closest('button')    ||
        t.closest('canvas')
      );
    };

    window.addEventListener('mousemove',  onMove, { passive: true });
    window.addEventListener('mouseover',  onOver, { passive: true });

    // rAF loop — dot snaps instantly, ring lags behind for luxury feel
    const animate = () => {
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

      ring.current.x = lerp(ring.current.x, mouse.current.x, 0.10);
      ring.current.y = lerp(ring.current.y, mouse.current.y, 0.10);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouse.current.x}px, ${mouse.current.y}px, 0) translate(-50%, -50%)`;
        dotRef.current.style.opacity   = isHovered.current ? '0' : '1';
      }

      if (ringRef.current) {
        const scale = isHovered.current ? 2.2 : 1;
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%) scale(${scale})`;
        ringRef.current.style.background = isHovered.current
          ? 'hsla(195, 90%, 55%, 0.12)'
          : 'transparent';
        ringRef.current.style.borderColor = isHovered.current
          ? 'hsl(195,90%,65%)'
          : 'hsl(210,90%,55%)';
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <>
      {/* Snappy inner dot */}
      <div ref={dotRef} className={styles.dot} />
      {/* Lagging outer ring */}
      <div ref={ringRef} className={styles.ring} />
    </>
  );
}
