"use client";

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

export default function GSAPInitializer() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Fade up animations for anything with [data-reveal]
    const revealElements = document.querySelectorAll('[data-reveal]');
    revealElements.forEach((el) => {
      gsap.fromTo(el, 
        { opacity: 0, y: 50 },
        {
          scrollTrigger: {
            trigger: el,
            start: "top 85%", // Trigger when top of element hits 85% of viewport
            toggleActions: "play none none reverse", // Play on scroll down, reverse on scroll up
          },
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out"
        }
      );
    });

    // Staggered lists (e.g. Services grid, Stats)
    const staggerContainers = document.querySelectorAll('[data-stagger-container]');
    staggerContainers.forEach((container) => {
      const children = container.querySelectorAll('[data-stagger-item]');
      if (children.length === 0) return;

      gsap.fromTo(children,
        { opacity: 0, y: 40 },
        {
          scrollTrigger: {
            trigger: container,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out"
        }
      );
    });

    // Clean up
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return null;
}
