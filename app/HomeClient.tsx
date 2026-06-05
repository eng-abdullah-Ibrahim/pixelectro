"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import s from './page.module.css';
import dynamic from 'next/dynamic';
import { HeroScene } from './components/ThreeCanvas/ThreeScene';
import { useTranslation } from './components/TranslationProvider';

const ServicesScene = dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(mod => mod.ServicesScene), { ssr: false });
const StatementScene = dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(mod => mod.StatementScene), { ssr: false });
const ProcessScene = dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(mod => mod.ProcessScene), { ssr: false });
const BoxScene = dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.BoxScene), { ssr: false });
const TorusKnotScene = dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.TorusKnotScene), { ssr: false });
const TetrahedronScene = dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.TetrahedronScene), { ssr: false });

const SceneMap: Record<string, React.ComponentType<any>> = {
  BrandingScene: dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.BrandingScene), { ssr: false }),
  FilmScene: dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.FilmScene), { ssr: false }),
  VFXScene: dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.VFXScene), { ssr: false }),
  SoftwareScene: dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.SoftwareScene), { ssr: false }),
  PerformanceScene: dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.PerformanceScene), { ssr: false }),
  AIScene: dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.AIScene), { ssr: false }),
  IcosahedronScene: dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.IcosahedronScene), { ssr: false }),
  BoxScene: dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.BoxScene), { ssr: false }),
  RingScene: dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.RingScene), { ssr: false }),
  CapsuleScene: dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.CapsuleScene), { ssr: false }),
  TorusKnotScene: dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.TorusKnotScene), { ssr: false }),
  TetrahedronScene: dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.TetrahedronScene), { ssr: false }),
};

type ServiceData = {
  n: string;
  title: string;
  sub: string;
  href: string;
  icon: string;
  homeImage: string | null;
  homeScene: string | null;
  translations?: any;
};

type ClientData = {
  id: string;
  name: string;
  logoUrl: string;
  link: string;
};

const STATS = [
  { value: '200+', label: 'Projects',     note: 'Delivered globally' },
  { value: '50+',  label: 'Clients',      note: 'Across 5 countries' },
  { value: '8',    label: 'Disciplines',  note: 'Creative domains' },
  { value: '2023', label: 'Founded',      note: 'Alexandria, Egypt' },
];

export default function HomeClient({ services = [], clients = [], dynamicContent = null }: { services?: any[], clients?: any[], dynamicContent?: any }) {
  const meshRef = useRef<HTMLCanvasElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { t, locale } = useTranslation();

  // Helper to safely get dynamic content or fallback to JSON translation
  const getDc = (path: string, fallbackKey: string) => {
    if (dynamicContent && dynamicContent.content && dynamicContent.content[locale]) {
      const parts = path.split('.');
      let val = dynamicContent.content[locale];
      for (const p of parts) {
        if (!val) break;
        val = val[p];
      }
      if (val) return val;
    }
    return t(fallbackKey);
  };

  const getScene = (section: string, FallbackComponent: any) => {
    if (dynamicContent && dynamicContent.scenes && dynamicContent.scenes[section]) {
      const sceneName = dynamicContent.scenes[section];
      if (sceneName && SceneMap[sceneName]) return SceneMap[sceneName];
    }
    return FallbackComponent;
  };

  const HeroDynamicScene = getScene('hero', HeroScene);
  const AboutDynamicScene = getScene('about', StatementScene);
  const VisionDynamicScene = getScene('vision', BoxScene);
  const MissionDynamicScene = getScene('mission', TorusKnotScene);
  const GoalsDynamicScene = getScene('goals', TetrahedronScene);
  const PhilosophyDynamicScene = getScene('philosophy', StatementScene);
  const ProcessDynamicScene = getScene('process', ProcessScene);

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

    const isMobile = window.innerWidth < 768;
    const orbCount = isMobile ? 8 : 18;

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

    let isVisible = true;
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    }, { threshold: 0 });
    observer.observe(canvas);

    const loop = () => {
      if (isVisible) draw();
      else raf = requestAnimationFrame(loop);
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
        {!isMobile && <HeroDynamicScene />}
        <canvas ref={meshRef} className={s.heroMesh} aria-hidden />

        <div className={s.heroContent} style={{ position: 'relative', zIndex: 1 }} data-reveal="true">
          <div className={s.heroBadge} dangerouslySetInnerHTML={{ __html: getDc('hero.badge', 'hero.badge') }} />
          <div className={s.heroTitle}>
            <div className={s.heroLine1} dangerouslySetInnerHTML={{ __html: getDc('hero.titleLine1', 'hero.titleLine1') }} />
            <div className={`${s.heroLine2} ${s.heroItalic}`} dangerouslySetInnerHTML={{ __html: getDc('hero.titleLine2', 'hero.titleLine2') }} />
            <div className={s.heroLine3}>
              <span dangerouslySetInnerHTML={{ __html: getDc('hero.titleLine3Prefix', 'hero.titleLine3Prefix') }} />
              <span className={s.heroBlue} dangerouslySetInnerHTML={{ __html: getDc('hero.titleLine3Highlight', 'hero.titleLine3Highlight') }} />
            </div>
          </div>
          <div className={s.heroSub} dangerouslySetInnerHTML={{ __html: getDc('hero.sub', 'hero.sub') }} />
          <div className={s.heroActions} data-reveal="true">
            <Link href="/projects" className={s.btnBlue}>
              {t('common.exploreOurWork')}
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M3.5 9h11M10 4l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link href="/contact" className={s.btnOutline}>{t('common.startAProject')}</Link>
          </div>

          <div className={s.heroScroll} data-reveal="true" aria-hidden>
            <div className={s.heroScrollTrack}><div className={s.heroScrollThumb}/></div>
            <span>{t('hero.scroll')}</span>
          </div>
        </div>
      </section>

      {/* ══ STATS BELT ══════════════════════════════════════════════ */}
      <div className={s.statsBelt} data-stagger-container="true">
        {[
          { value: dynamicContent?.stats?.projectsValue || t('stats.projectsValue'), label: dynamicContent?.stats?.projectsLabel || t('common.projects'),     note: dynamicContent?.stats?.projectsNote || t('stats.projectsNote') },
          { value: dynamicContent?.stats?.clientsValue || t('stats.clientsValue'),  label: dynamicContent?.stats?.clientsLabel || t('common.clients'),      note: dynamicContent?.stats?.clientsNote || t('stats.clientsNote') },
          { value: dynamicContent?.stats?.disciplinesValue || '8',                      label: dynamicContent?.stats?.disciplinesLabel || t('common.disciplines'),  note: dynamicContent?.stats?.disciplinesNote || t('stats.disciplinesNote') },
          { value: dynamicContent?.stats?.foundedValue || '2023',                   label: dynamicContent?.stats?.foundedLabel || t('common.founded'),      note: dynamicContent?.stats?.foundedNote || t('stats.foundedNote') },
        ].map((st, i) => (
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

      {/* ══ ABOUT / VISION / MISSION / GOALS ════════════════════════ */}
      <section className={s.aboutSection} data-reveal style={{ paddingBottom: 0 }}>
        <AboutDynamicScene />
        <div style={{ padding: '7rem 6%', position: 'relative', zIndex: 2 }} data-reveal="true">
          <div className={s.eyebrow} style={{ color: 'var(--blue-core)' }} dangerouslySetInnerHTML={{ __html: getDc('about.eyebrow', 'about.eyebrow') }} />
          <div className={s.sectionTitle} style={{ color: 'var(--ink)', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
            <div dangerouslySetInnerHTML={{ __html: getDc('about.titleLine1', 'about.titleLine1') }} />
            <div style={{ fontStyle: 'italic', fontWeight: 300, fontFamily: 'var(--font-cormorant)' }} dangerouslySetInnerHTML={{ __html: getDc('about.titleLine2', 'about.titleLine2') }} />
          </div>
          <div className={s.statementBody} style={{ color: 'var(--ink-dim)' }} dangerouslySetInnerHTML={{ __html: getDc('about.intro', 'about.intro') }} />
        </div>
      </section>

      {/* Vision Section */}
      <section data-reveal style={{ minHeight: 'auto', padding: '100px 0', position: 'relative', overflow: 'hidden' }}>
        {/* Full-width absolute background scene */}
        {!isMobile && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.9 }}>
            <VisionDynamicScene />
          </div>
        )}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
          <div style={{ padding: '5rem 3rem', borderRadius: '2rem' }}>
            <div style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 600, color: 'var(--ink)', marginBottom: '1.5rem', letterSpacing: '-0.02em' }} dangerouslySetInnerHTML={{ __html: getDc('vision.title', 'about.vision.title') }} />
            <div style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: 'var(--ink-dim)', lineHeight: 1.8, maxWidth: '900px', margin: '0 auto' }} dangerouslySetInnerHTML={{ __html: getDc('vision.desc', 'about.vision.desc') }} />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section data-reveal style={{ minHeight: 'auto', padding: '100px 0', position: 'relative', overflow: 'hidden' }}>
        {/* Full-width absolute background scene */}
        {!isMobile && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, opacity: 0.9 }}>
            <MissionDynamicScene />
          </div>
        )}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
          <div style={{ padding: '5rem 3rem', borderRadius: '2rem' }}>
            <div style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 600, color: 'var(--ink)', marginBottom: '1.5rem', letterSpacing: '-0.02em' }} dangerouslySetInnerHTML={{ __html: getDc('mission.title', 'about.mission.title') }} />
            <div style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: 'var(--ink-dim)', lineHeight: 1.8, maxWidth: '900px', margin: '0 auto' }} dangerouslySetInnerHTML={{ __html: getDc('mission.desc', 'about.mission.desc') }} />
          </div>
        </div>
      </section>

      {/* Goals Section Redesigned */}
      <section className={s.aboutSection} data-reveal style={{ paddingTop: '40px' }}>
        <GoalsDynamicScene />
        <div className={s.aboutHead} data-reveal="true" style={{ marginBottom: '40px' }}>
          <div className={s.sectionTitle} style={{ color: 'var(--ink)' }} dangerouslySetInnerHTML={{ __html: getDc('goals.title', 'about.goals.title') }} />
        </div>
        <div className={s.aboutGrid} data-stagger-container="true">
          {[0, 1, 2].map((i) => {
            const itemTitle = getDc(`goals.items.${i}.title`, `about.goals.items.${i}.title`);
            const itemDesc = getDc(`goals.items.${i}.desc`, `about.goals.items.${i}.desc`);
            if (!itemTitle || itemTitle === `about.goals.items.${i}.title`) return null;
            return (
              <div key={i} className={s.aboutCard} data-stagger-item="true" data-reveal style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className={s.aboutCardNum}>0{i + 1}</div>
                <div className={s.aboutCardTitle} dangerouslySetInnerHTML={{ __html: itemTitle }} />
                <div className={s.aboutCardDesc} dangerouslySetInnerHTML={{ __html: itemDesc }} />
              </div>
            );
          })}
        </div>
      </section>


      {/* ══ SERVICES — ALTERNATING SECTIONS ════════════════════════ */}
      <section className={s.services}>
        <div className={s.servicesHead} data-reveal="true" style={{ marginBottom: 0 }}>
          <p className={s.eyebrow}>{t('services.eyebrow', { count: services.length.toString().padStart(2, '0') })}</p>
          <h2 className={s.sectionTitle}>
            {t('services.titleLine1')}<br />
            <em>{t('services.titleLine2')}</em>
          </h2>
        </div>
      </section>

      {/* Alternating Service Sections */}
      {services.map((svc, i) => {
        const getLocField = (field: string) => {
          if (locale === 'en') return (svc as any)[field];
          const tr = svc.translations?.[locale];
          return tr?.[field] || (svc as any)[field];
        };
        const title = getLocField('title');
        const sub = getLocField('description') || getLocField('excerpt') || getLocField('sub');
        const DynamicScene = svc.homeScene && SceneMap[svc.homeScene] ? SceneMap[svc.homeScene] : null;

        const isEven = i % 2 === 0;

        return (
          <section key={svc.n} className={s.serviceSection} data-reveal>
            <div className={s.serviceSectionInner} style={{ flexDirection: isEven ? 'row' : 'row-reverse' }}>
              <div className={s.serviceSectionText}>
                <div className={s.serviceSectionEyebrow}>
                  <span className={s.serviceSectionIcon}>{svc.icon}</span>
                  <span className={s.serviceSectionNum}>{svc.n}</span>
                </div>
                <h3 className={s.serviceSectionTitle}>{title}</h3>
                <div className={s.serviceSectionSub} dangerouslySetInnerHTML={{ __html: sub || '' }} />
                <Link href={svc.href} className={s.serviceSectionLink}>
                  {t('services.exploreService', { title: title || '' })}
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <path d="M4 10h12M12 5l5 5-5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>

              {/* Right side for image/video and 3D scene */}
              <div className={s.serviceSectionVisualEmpty}>
                {svc.homeImage ? (
                  <div className={s.serviceSectionImageWrap}>
                    {svc.homeImage.match(/\.(mp4|webm|mov)$/i) ? (
                      <video 
                        src={svc.homeImage} 
                        className={s.serviceSectionImage} 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                      />
                    ) : (
                      <img 
                        src={svc.homeImage} 
                        alt={title} 
                        className={s.serviceSectionImage} 
                        loading="lazy"
                      />
                    )}
                    <div className={s.serviceSectionImageGlow} />
                  </div>
                ) : (
                  !isMobile && DynamicScene && (
                    <div className={s.serviceSectionDynamicScene}>
                      <DynamicScene />
                    </div>
                  )
                )}
              </div>
            </div>
          </section>
        );
      })}

      {/* ══ DARK NAVY STATEMENT ══════════════════════════════════════ */}
      <section className={s.statement} data-reveal>
        <PhilosophyDynamicScene />
        <div className={s.statementOrbs} aria-hidden>
          <div className={s.statOrb1} />
          <div className={s.statOrb2} />
        </div>
        <div className={s.statementInner} data-reveal="true">
          <div className={s.eyebrowLight} dangerouslySetInnerHTML={{ __html: getDc('philosophy.eyebrow', 'statement.eyebrow') }} />
          <div className={s.statementQuote} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div dangerouslySetInnerHTML={{ __html: getDc('philosophy.quoteLine1', 'statement.quoteLine1') }} />
            <div style={{ fontStyle: 'italic', fontWeight: 300, fontFamily: 'var(--font-cormorant)' }} dangerouslySetInnerHTML={{ __html: getDc('philosophy.quoteLine2', 'statement.quoteLine2') }} />
          </div>
          <div className={s.statementBody} dangerouslySetInnerHTML={{ __html: getDc('philosophy.body', 'statement.body') }} />
          <div>
            <Link href="/contact" className={s.btnWhite} dangerouslySetInnerHTML={{ __html: getDc('philosophy.cta', 'statement.cta') || 'Start the Conversation' }} />
          </div>
        </div>

        {/* 3D floating card visual */}
        <div className={s.statementVisual} aria-hidden>
          <div className={s.floatCard} data-reveal="true" data-tilt>
            <div className={s.floatCardInner}>
              <div className={s.floatSphere} />
              <p className={s.floatLabel}>{getDc('philosophy.floatLabel', 'statement.floatLabel') || 'PIXELECTRO STUDIO'}</p>
              <p className={s.floatSub}>{getDc('philosophy.floatSub', 'statement.floatSub') || 'Global Creative Force'}</p>
              <div className={s.floatStats}>
                <div><span>{dynamicContent?.stats?.projectsValue || t('stats.projectsValue')}</span><small>{dynamicContent?.stats?.projectsLabel || t('stats.projectsLabel')}</small></div>
                <div><span>{dynamicContent?.stats?.clientsValue || t('stats.clientsValue')}</span><small>{dynamicContent?.stats?.clientsLabel || t('stats.clientsLabel')}</small></div>
                <div><span>{dynamicContent?.stats?.disciplinesValue || '5'}</span><small>{dynamicContent?.stats?.disciplinesLabel || t('common.countries')}</small></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PROCESS ══════════════════════════════════════════════════ */}
      <section className={s.process}>
        <ProcessDynamicScene />
        <div className={s.processHead} data-reveal="true">
          <div className={s.eyebrow} dangerouslySetInnerHTML={{ __html: getDc('process.eyebrow', 'process.eyebrow') }} />
          <div className={s.sectionTitle} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div dangerouslySetInnerHTML={{ __html: getDc('process.titleLine1', 'process.titleLine1') }} />
            <div style={{ fontStyle: 'italic', fontWeight: 300, fontFamily: 'var(--font-cormorant)' }} dangerouslySetInnerHTML={{ __html: getDc('process.titleLine2', 'process.titleLine2') }} />
          </div>
        </div>
        <div className={s.processSteps} data-stagger-container="true">
          {[0, 1, 2, 3].map((i) => {
            const stepNum = getDc(`process.items.${i}.num`, `process.step${i+1}Num`);
            const stepTitle = getDc(`process.items.${i}.title`, `process.step${i+1}Title`);
            const stepBody = getDc(`process.items.${i}.body`, `process.step${i+1}Body`);
            if (!stepTitle || stepTitle === `process.step${i+1}Title`) return null;
            return (
              <div key={i} className={s.processStep} data-stagger-item="true" data-reveal style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className={s.stepNum} dangerouslySetInnerHTML={{ __html: stepNum }} />
                <div className={s.stepTitle} style={{ color: 'var(--ink)' }} dangerouslySetInnerHTML={{ __html: stepTitle }} />
                <div className={s.stepBody} style={{ color: 'var(--ink-dim)' }} dangerouslySetInnerHTML={{ __html: stepBody }} />
              </div>
            );
          })}
        </div>
      </section>

      {/* ══ PROMINENT CLIENTS ══════════════════════════════════════ */}
      {clients.length > 0 && (
        <section className={s.clientsSection} data-reveal>
          <div className={s.clientsInner}>
            <p className={s.eyebrow} style={{ color: 'var(--blue-core)' }}>{t('clients.eyebrow')}</p>
            <div className={s.clientsGrid}>
              {clients.map(c => (
                c.link ? (
                  <a key={c.id} href={c.link} target="_blank" rel="noopener noreferrer" className={s.clientItem}>
                    {c.logoUrl && <img src={c.logoUrl} alt={c.name} className={s.clientLogo} />}
                    {!c.logoUrl && <span className={s.clientName}>{c.name}</span>}
                  </a>
                ) : (
                  <div key={c.id} className={s.clientItem}>
                    {c.logoUrl && <img src={c.logoUrl} alt={c.name} className={s.clientLogo} />}
                    {!c.logoUrl && <span className={s.clientName}>{c.name}</span>}
                  </div>
                )
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ CTA FULL ═════════════════════════════════════════════════ */}
      <section className={s.ctaSection} data-reveal>
        <div className={s.ctaOrbs} aria-hidden>
          <div className={s.ctaOrb1} />
          <div className={s.ctaOrb2} />
        </div>
        <div className={s.ctaInner} data-reveal="true">
          <p className={s.eyebrowLight}>{t('cta.eyebrow')}</p>
          <h2 className={s.ctaTitle}>
            {t('cta.titleLine1')}<br />
            <em>{t('cta.titleLine2')}</em>
          </h2>
          <div className={s.ctaActions}>
            <Link href="/contact" className={s.btnWhite}>
              {t('common.getInTouch')}
            </Link>
            <a href="https://wa.me/201060107536" target="_blank" rel="noopener noreferrer" className={s.btnGhostLight}>
              {t('common.chatOnWhatsapp')}
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
