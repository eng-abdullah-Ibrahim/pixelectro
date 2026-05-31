"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ParallaxText.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function ParallaxText() {
  const containerRef = useRef<HTMLDivElement>(null);
  const track1Ref    = useRef<HTMLDivElement>(null);
  const track2Ref    = useRef<HTMLDivElement>(null);

  // Track scroll velocity for dynamic speed
  const scrollVel   = useRef(0);
  const lastScrollY = useRef(0);
  const xPos1       = useRef(0);
  const xPos2       = useRef(-40);
  const rafId       = useRef(0);

  useEffect(() => {
    // Velocity tracking
    const onScroll = () => {
      const delta = window.scrollY - lastScrollY.current;
      scrollVel.current = delta;
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Kinetic marquee loop — velocity-reactive
    const animate = () => {
      // Decay velocity
      scrollVel.current *= 0.9;

      const baseSpeed = 0.04;
      const velBoost  = scrollVel.current * 0.12;

      xPos1.current -= (baseSpeed + velBoost);
      xPos2.current += (baseSpeed + velBoost * 0.7);

      // Wrap at -50% (text is doubled to fill seamlessly)
      if (xPos1.current < -50) xPos1.current = 0;
      if (xPos2.current > 0)   xPos2.current = -50;

      if (track1Ref.current) track1Ref.current.style.transform = `translateX(${xPos1.current}%)`;
      if (track2Ref.current) track2Ref.current.style.transform = `translateX(${xPos2.current}%)`;

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  const marqueeText = "PIXELECTRO // BEYOND DIGITAL GENOME // PIXELECTRO // BEYOND DIGITAL GENOME // ";

  return (
    <div ref={containerRef} className={styles.parallaxContainer} aria-hidden="true">
      <div className={styles.parallaxRow}>
        <div ref={track1Ref} className={styles.track}>
          <span>{marqueeText}</span>
          <span>{marqueeText}</span>
        </div>
      </div>
      <div className={styles.parallaxRow}>
        <div ref={track2Ref} className={`${styles.track} ${styles.trackReverse}`}>
          <span>{marqueeText}</span>
          <span>{marqueeText}</span>
        </div>
      </div>
    </div>
  );
}
