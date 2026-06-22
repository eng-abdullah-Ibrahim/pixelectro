"use client";

import { useEffect, useRef } from 'react';
import styles from './CustomCursor.module.css';

/* ─────────────────────────────────────────────────────────────────
   CUSTOM CURSOR — Spring Physics Engine
   Emotional preset: "luxurious" (stiffness=80, damping=14, mass=1.8)
   The cursor trails the pointer with heavy deliberate deceleration.
   This weight creates subconscious association with premium matter.
   ───────────────────────────────────────────────────────────────── */

class SpringValue {
  k: number; c: number; m: number;
  x: number; v: number; target: number;

  constructor({ stiffness = 80, damping = 14, mass = 1.8 } = {}) {
    this.k = stiffness;
    this.c = damping;
    this.m = mass;
    this.x = 0;
    this.v = 0;
    this.target = 0;
  }

  tick(dt = 0.016): boolean {
    const a = -(this.k * (this.x - this.target)) / this.m
              - (this.c * this.v) / this.m;
    this.v += a * dt;
    this.x += this.v * dt;
    return Math.abs(this.x - this.target) < 0.001 && Math.abs(this.v) < 0.001;
  }
}

export default function CustomCursor() {
  const dotRef   = useRef<HTMLDivElement>(null);
  const ringRef  = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const rafRef   = useRef(0);
  const lastT    = useRef(performance.now());

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot   = dotRef.current!;
    const ring  = ringRef.current!;
    const label = labelRef.current!;

    // Separate spring per axis for independent deceleration feel
    const springX = new SpringValue({ stiffness: 80, damping: 14, mass: 1.8 });
    const springY = new SpringValue({ stiffness: 80, damping: 14, mass: 1.8 });

    let mx = 0, my = 0;
    let isHover = false;
    let isMagnetic = false;
    let magneticTarget: { x: number; y: number } | null = null;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      springX.target = mx;
      springY.target = my;
    };
    document.addEventListener('mousemove', onMove);

    // ── Tick: spring integration per frame ──────────────────────
    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - lastT.current) / 1000, 0.03); // cap at 30ms
      lastT.current = now;

      // Magnetic attraction overrides target
      if (isMagnetic && magneticTarget) {
        springX.target = magneticTarget.x;
        springY.target = magneticTarget.y;
      } else {
        springX.target = mx;
        springY.target = my;
      }

      springX.tick(dt);
      springY.tick(dt);

      // Dot follows mouse exactly (instant)
      dot.style.transform  = `translate(${mx - 5}px, ${my - 5}px)`;
      // Ring follows spring (delayed, weighted)
      ring.style.transform = `translate(${springX.x - 22}px, ${springY.x - 22}px)`;

      // Scale ring on hover
      const scale = isHover ? 2.2 : 1;
      ring.style.scale = String(scale);
      dot.style.opacity = isHover ? '0' : '1';

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    // ── Hover state detection ────────────────────────────────────
    const enterHover = () => { isHover = true; };
    const leaveHover = () => { isHover = false; isMagnetic = false; magneticTarget = null; };

    // ── Magnetic button effect ───────────────────────────────────
    const enterMagnetic = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      const r = el.getBoundingClientRect();
      magneticTarget = {
        x: r.left + r.width / 2,
        y: r.top + r.height / 2,
      };
      isMagnetic = true;
      isHover = true;
    };
    const leaveMagnetic = () => {
      isMagnetic = false;
      magneticTarget = null;
      isHover = false;
    };

    const bindListeners = () => {
      document.querySelectorAll<HTMLElement>('a, button, [role="button"], .hoverable').forEach(el => {
        el.addEventListener('mouseenter', enterHover);
        el.addEventListener('mouseleave', leaveHover);
      });
      document.querySelectorAll<HTMLElement>('.magnetic').forEach(el => {
        el.addEventListener('mouseenter', enterMagnetic);
        el.addEventListener('mouseleave', leaveMagnetic);
      });
    };

    bindListeners();

    const observer = new MutationObserver(bindListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className={styles.dot}  aria-hidden="true" />
      <div ref={ringRef} className={styles.ring} aria-hidden="true">
        <div ref={labelRef} className={styles.label} />
      </div>
    </>
  );
}
