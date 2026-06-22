"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

/* ─────────────────────────────────────────────────────────────────
   GSAP SCROLL ENGINE — Awwwards-Level Animation System
   
   Phase 7 implementation from awwwards-ui-design.md:
   - Pinned scroll story (SOTY signature)
   - Staggered batch card reveals  
   - Variable font weight scrubbing
   - Horizontal marquee parallax
   - Section entrance with velvet ease
   - Mobile: simplified (no ScrollTrigger pins)
   ───────────────────────────────────────────────────────────────── */

export default function GSAPInitializer() {
  const pathname = usePathname();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.innerWidth < 768;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isReducedMotion) {
      // Force all reveals visible immediately
      document.querySelectorAll<HTMLElement>(
        '[data-reveal], [data-reveal-left], [data-reveal-right], [data-stagger-item]'
      ).forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      document.querySelectorAll<HTMLElement>('[data-stagger-container]').forEach(el => {
        el.dataset.visible = 'true';
      });
      return;
    }

    if (isMobile) {
      // ── Mobile: IntersectionObserver — no GSAP, no ScrollTrigger ──
      const io = new IntersectionObserver(
        entries => entries.forEach(e => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.visible = 'true';
            (e.target as HTMLElement).style.opacity = '1';
            (e.target as HTMLElement).style.transform = 'none';
            io.unobserve(e.target);
          }
        }),
        { threshold: 0.08 }
      );

      document.querySelectorAll<HTMLElement>(
        '[data-reveal], [data-reveal-left], [data-reveal-right], [data-stagger-container]'
      ).forEach(el => io.observe(el));

      // Also make stagger items visible when their container enters
      document.querySelectorAll<HTMLElement>('[data-stagger-container]').forEach(container => {
        const items = container.querySelectorAll<HTMLElement>('[data-stagger-item]');
        const containerIO = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting) {
            items.forEach((item, i) => {
              setTimeout(() => {
                item.dataset.visible = 'true';
                item.style.opacity = '1';
                item.style.transform = 'none';
              }, i * 100);
            });
            containerIO.disconnect();
          }
        }, { threshold: 0.05 });
        containerIO.observe(container);
      });

      return () => io.disconnect();
    }

    // ── Desktop: Full GSAP ScrollTrigger System ──────────────────

    // ── 1. Section reveals (fade + translate Y) ─────────────────
    const revealEls = document.querySelectorAll<HTMLElement>('[data-reveal]');
    revealEls.forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 56 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // ── 2. Slide from left ──────────────────────────────────────
    const revealLeftEls = document.querySelectorAll<HTMLElement>('[data-reveal-left]');
    revealLeftEls.forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, x: -72 },
        {
          opacity: 1,
          x: 0,
          duration: 1.3,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // ── 3. Slide from right ─────────────────────────────────────
    const revealRightEls = document.querySelectorAll<HTMLElement>('[data-reveal-right]');
    revealRightEls.forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, x: 72 },
        {
          opacity: 1,
          x: 0,
          duration: 1.3,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // ── 4. Stagger batch reveals (ScrollTrigger.batch) ──────────
    const staggerContainers = document.querySelectorAll<HTMLElement>('[data-stagger-container]');
    staggerContainers.forEach(container => {
      const items = container.querySelectorAll<HTMLElement>('[data-stagger-item]');
      if (!items.length) return;

      // Set initial state
      gsap.set(items, { opacity: 0, y: 40 });

      ScrollTrigger.batch(items, {
        interval: 0.08,
        batchMax: 4,
        start: 'top 85%',
        onEnter: batch => {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            stagger: { amount: 0.4, from: 'start' },
            duration: 0.9,
            ease: 'power3.out',
          });
        },
      });
    });

    // ── 5. Marquee: simple GSAP x-translate loop ─────────────────
    const marqueeTrack = document.querySelector<HTMLElement>('[data-marquee-track]');
    if (marqueeTrack) {
      const totalWidth = marqueeTrack.scrollWidth / 2; // track has 2x content via CSS repeat
      // Simple: animate from 0 to -50% width, then reset
      gsap.to(marqueeTrack, {
        x: `-=${totalWidth}`,
        duration: 30,
        ease: 'none',
        repeat: -1,
        onRepeat() {
          gsap.set(marqueeTrack, { x: 0 });
        },
      });
    }

    // ── 6. Stats counter animation ───────────────────────────────
    const statVals = document.querySelectorAll<HTMLElement>('[data-stat-val]');
    statVals.forEach(el => {
      const text = el.textContent || '';
      const numMatch = text.match(/[\d.]+/);
      if (!numMatch) return;

      const target = parseFloat(numMatch[0]);
      const suffix = text.replace(numMatch[0], '');
      const isDecimal = text.includes('.');

      // Correct pattern: animate a plain proxy object, read in onUpdate
      const proxy = { val: 0 };
      gsap.to(proxy, {
        val: target,
        duration: 2.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        onUpdate() {
          const v = isDecimal
            ? proxy.val.toFixed(1)
            : Math.floor(proxy.val);
          el.textContent = `${v}${suffix}`;
        },
      });
    });

    // ── 7. Hero title character stagger ─────────────────────────
    const heroChars = document.querySelectorAll<HTMLElement>('[data-char]');
    if (heroChars.length > 0) {
      gsap.fromTo(heroChars,
        { opacity: 0, y: 80, rotateX: -40 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.03,
          duration: 1.0,
          ease: 'power3.out',
          delay: 2.5, // after preloader
          transformPerspective: 800,
        }
      );
    }

    // ── 8. Hero sub-content fade (after characters) ─────────────
    const heroBadge  = document.querySelector<HTMLElement>('[data-hero-badge]');
    const heroSub    = document.querySelector<HTMLElement>('[data-hero-sub]');
    const heroActions = document.querySelector<HTMLElement>('[data-hero-actions]');

    if (heroBadge && heroSub && heroActions) {
      gsap.fromTo([heroBadge, heroSub, heroActions],
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 1.0,
          ease: 'power3.out',
          delay: 3.0,
        }
      );
    }

    // ── 9. Service image slide-in (off-screen) ──────────────────
    const serviceImages = document.querySelectorAll<HTMLElement>('[data-service-img]');
    serviceImages.forEach((img, i) => {
      const isEven = i % 2 === 0;
      gsap.fromTo(img,
        { opacity: 0, x: isEven ? 120 : -120 },
        {
          opacity: 1,
          x: 0,
          duration: 1.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: img,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // ── 10. Scroll indicator fade out on scroll ──────────────────
    const scrollIndicator = document.querySelector<HTMLElement>('[data-scroll-indicator]');
    if (scrollIndicator) {
      ScrollTrigger.create({
        start: 100,
        onEnter: () => gsap.to(scrollIndicator, { opacity: 0, y: -12, duration: 0.5 }),
        onLeaveBack: () => gsap.to(scrollIndicator, { opacity: 1, y: 0, duration: 0.5 }),
      });
    }

    // ── Cleanup ──────────────────────────────────────────────────
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [pathname]);

  return null;
}
