"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import s from './page.module.css';
import dynamic from 'next/dynamic';
import { HeroScene } from './components/ThreeCanvas/ThreeScene';

const ServicesScene = dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(mod => mod.ServicesScene), { ssr: false });
const StatementScene = dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(mod => mod.StatementScene), { ssr: false });
const ProcessScene = dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(mod => mod.ProcessScene), { ssr: false });

type ServiceData = {
  n: string;
  title: string;
  sub: string;
  href: string;
  icon: string;
};

const STATS = [
  { value: '200+', label: 'Projects',     note: 'Delivered globally' },
  { value: '50+',  label: 'Clients',      note: 'Across 5 countries' },
  { value: '8',    label: 'Disciplines',  note: 'Creative domains' },
  { value: '2023', label: 'Founded',      note: 'Alexandria, Egypt' },
];

export default function HomeClient({ services }: { services: ServiceData[] }) {
  const meshRef = useRef<HTMLCanvasElement>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  /* ── Animated mesh canvas (blue palette) ─────────── */
  useEffect(() => {
    const canvas = meshRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0, t = 0;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Reduce particle count on mobile for performance
    const isMobile = window.innerWidth < 768;
    const orbCount = isMobile ? 8 : 18;

    /* Floating orb particles */
    const ORBS = Array.from({ length: orbCount }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      r: (isMobile ? 30 : 40) + Math.random() * (isMobile ? 80 : 120),
      vx: (Math.random() - 0.5) * 0.0003,
      vy: (Math.random() - 0.5) * 0.0003,
      hue: 200 + Math.random() * 40,
    }));

    const draw = () => {
      t += 0.006;
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);

      ORBS.forEach(o => {
        o.x += o.vx; o.y += o.vy;
        if (o.x < 0 || o.x > 1) o.vx *= -1;
        if (o.y < 0 || o.y > 1) o.vy *= -1;
        const x = o.x * w, y = o.y * h;
        const g = ctx.createRadialGradient(x, y, 0, x, y, o.r);
        g.addColorStop(0,   `hsla(${o.hue}, 80%, 60%, 0.18)`);
        g.addColorStop(0.5, `hsla(${o.hue}, 70%, 45%, 0.08)`);
        g.addColorStop(1,   `hsla(${o.hue}, 60%, 35%, 0)`);
        ctx.beginPath();
        ctx.arc(x, y, o.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      /* Grid of dots */
      const STEP = 60;
      for (let gx = 0; gx <= w + STEP; gx += STEP) {
        for (let gy = 0; gy <= h + STEP; gy += STEP) {
          const wave = Math.sin(t + gx * 0.018 + gy * 0.012) * 0.5 + 0.5;
          ctx.beginPath();
          ctx.arc(gx, gy, 1.2 + wave * 1.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(21, 101, 216, ${0.06 + wave * 0.14})`;
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    // Only run animation when the canvas is in view
    let isVisible = true;
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    }, { threshold: 0 });
    observer.observe(canvas);

    const loop = () => {
      if (isVisible) draw();
      else raf = requestAnimationFrame(loop); // Still request frame to check visibility, but skip drawing
    };
    raf = requestAnimationFrame(loop);

    return () => { 
      cancelAnimationFrame(raf); 
      ro.disconnect(); 
      observer.disconnect();
    };
  }, []);

  /* ── 3D tilt effect for service cards ──────────── */
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>('[data-tilt]');
    const handlers: Array<{ el: HTMLElement; onMove: (e: MouseEvent) => void; onLeave: () => void }> = [];

    cards.forEach(card => {
      const onMove = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width - 0.5) * 16;
        const y = ((e.clientY - r.top) / r.height - 0.5) * -16;
        card.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) translateZ(8px)`;
      };
      const onLeave = () => { card.style.transform = ''; };
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
      handlers.push({ el: card, onMove, onLeave });
    });

    return () => handlers.forEach(h => {
      h.el.removeEventListener('mousemove', h.onMove);
      h.el.removeEventListener('mouseleave', h.onLeave);
    });
  }, []);

  /* ── Intersection reveal ──────────────────────── */
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) (e.target as HTMLElement).dataset.visible = 'true';
      }),
      { threshold: 0.1 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className={s.page}>

      {/* ══ HERO ═══════════════════════════════════════════════════ */}
      <section className={s.hero}>
        {!isMobile && <HeroScene />}
        {/* Animated mesh background */}
        <canvas ref={meshRef} className={s.heroMesh} aria-hidden />



        <div className={s.heroContent}>
          <div className={s.heroBadge} data-reveal="true">
            <span className={s.heroBadgeDot} />
            Alexandria · Global Creative Studio · Est. 2023
          </div>

          <h1 className={s.heroTitle}>
            <span className={s.heroLine1}>We Build</span>
            <span className={s.heroLine2}>
              <em className={s.heroItalic}>Cinematic</em>
            </span>
            <span className={s.heroLine3}>
              Digital <span className={s.heroBlue}>Worlds.</span>
            </span>
          </h1>

          <p className={s.heroSub} data-reveal="true">
            A global advertising & creative studio operating at the intersection of design, technology, and culture. We engineer digital flagships for visionary brands.
          </p>

          <div className={s.heroActions} data-reveal="true">
            <Link href="/branding" className={s.btnBlue}>
              Explore Our Work
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M3.5 9h11M10 4l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link href="/contact" className={s.btnOutline}>Start a Project</Link>
          </div>

          {/* Scroll indicator */}
          <div className={s.heroScroll} data-reveal="true" aria-hidden>
            <div className={s.heroScrollTrack}><div className={s.heroScrollThumb}/></div>
            <span>Scroll to explore</span>
          </div>
        </div>
      </section>

      {/* ══ STATS BELT ══════════════════════════════════════════════ */}
      <div className={s.statsBelt} data-stagger-container="true">
        {STATS.map((st, i) => (
          <div key={i} className={s.statCell} data-stagger-item="true" data-reveal style={{ transitionDelay: `${i * 0.06}s` }}>
            <span className={s.statVal}>{st.value}</span>
            <span className={s.statLbl}>{st.label}</span>
            <span className={s.statNote}>{st.note}</span>
          </div>
        ))}
      </div>

      {/* ══ MARQUEE ══════════════════════════════════════════════════ */}
      <div className={s.marqueeWrap} aria-hidden>
        <div className={s.marqueeTrack}>
          {Array.from({ length: 10 }, (_, i) => (
            <span key={i} className={s.marqueeItem}>
              PIXELECTRO <span className={s.marqueeDot}>●</span> CINEMA <span className={s.marqueeDot}>●</span> BRAND <span className={s.marqueeDot}>●</span> CODE <span className={s.marqueeDot}>●</span> 3D <span className={s.marqueeDot}>●</span>
            </span>
          ))}
        </div>
      </div>

      {/* ══ SERVICES ═════════════════════════════════════════════════ */}
      <section className={s.services}>
        <ServicesScene />
        <div className={s.servicesHead} data-reveal="true">
          <p className={s.eyebrow}>Our Disciplines — {services.length.toString().padStart(2, '0')}</p>
          <h2 className={s.sectionTitle}>
            Everything your brand<br />
            <em>needs to dominate.</em>
          </h2>
        </div>

        <div className={s.servicesGrid} data-stagger-container="true">
          {services.map((svc, i) => (
            <Link
              key={svc.n}
              href={svc.href}
              className={s.serviceCard}
              data-stagger-item="true"
              data-tilt
              data-reveal
              style={{ transitionDelay: `${i * 0.07}s` }}
            >
              <div className={s.cardGlow} />
              <span className={s.cardIcon}>{svc.icon}</span>
              <span className={s.cardNum}>{svc.n}</span>
              <h3 className={s.cardTitle}>{svc.title}</h3>
              <p className={s.cardSub}>{svc.sub}</p>
              <div className={s.cardArrow}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path d="M4 10h12M12 5l5 5-5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ DARK NAVY STATEMENT ══════════════════════════════════════ */}
      <section className={s.statement} data-reveal>
        <StatementScene />
        <div className={s.statementOrbs} aria-hidden>
          <div className={s.statOrb1} />
          <div className={s.statOrb2} />
        </div>
        <div className={s.statementInner}>
          <p className={s.eyebrowLight}>Our Philosophy</p>
          <blockquote className={s.statementQuote} data-reveal="true">
            "We don't make content.<br />
            We <em>engineer perception.</em>"
          </blockquote>
          <p className={s.statementBody} data-reveal="true">
            Every pixel has a purpose. Every frame carries intention. Pixelectro is a
            precision instrument, calibrated to shift how the world sees your brand —
            from Alexandria to New York, we translate ideas into visual architectures that
            outlast trends and define categories.
          </p>
          <Link href="/contact" className={s.btnWhite}>
            Start the Conversation
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        {/* 3D floating card visual */}
        <div className={s.statementVisual} aria-hidden>
          <div className={s.floatCard} data-reveal="true" data-tilt>
            <div className={s.floatCardInner}>
              <div className={s.floatSphere} />
              <p className={s.floatLabel}>PIXELECTRO STUDIO</p>
              <p className={s.floatSub}>Global Creative Force</p>
              <div className={s.floatStats}>
                <div><span>200+</span><small>Projects</small></div>
                <div><span>50+</span><small>Clients</small></div>
                <div><span>5</span><small>Countries</small></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PROCESS ══════════════════════════════════════════════════ */}
      <section className={s.process}>
        <ProcessScene />
        <div className={s.processHead} data-reveal="true">
          <p className={s.eyebrow}>How We Work</p>
          <h2 className={s.sectionTitle}>A process built for<br /><em>perfection.</em></h2>
        </div>
        <div className={s.processSteps} data-stagger-container="true">
          {[
            { n: '01', t: 'Discovery',    b: 'We immerse in your brand, market, and audience to architect a strategy.' },
            { n: '02', t: 'Concept',      b: 'We craft bold creative concepts that challenge convention.' },
            { n: '03', t: 'Production',   b: 'Our studios execute with military precision across every discipline.' },
            { n: '04', t: 'Delivery',     b: 'We launch, measure, and optimize until results exceed expectations.' },
          ].map((step, i) => (
            <div key={step.n} className={s.processStep} data-stagger-item="true" data-reveal style={{ transitionDelay: `${i * 0.1}s` }}>
              <span className={s.stepNum}>{step.n}</span>
              <h3 className={s.stepTitle}>{step.t}</h3>
              <p className={s.stepBody}>{step.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CTA FULL ═════════════════════════════════════════════════ */}
      <section className={s.ctaSection} data-reveal>
        <div className={s.ctaOrbs} aria-hidden>
          <div className={s.ctaOrb1} />
          <div className={s.ctaOrb2} />
        </div>
        <div className={s.ctaInner} data-reveal="true">
          <p className={s.eyebrowLight}>Ready to begin?</p>
          <h2 className={s.ctaTitle}>
            Let's build something<br />
            <em>permanent.</em>
          </h2>
          <div className={s.ctaActions}>
            <Link href="/contact" className={s.btnWhite}>
              Get in Touch →
            </Link>
            <a href="https://wa.me/201060107536" target="_blank" rel="noopener noreferrer" className={s.btnGhostLight}>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
