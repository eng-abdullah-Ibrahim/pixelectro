"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import s from './page.module.css';
import dynamic from 'next/dynamic';
import { HeroScene } from './components/ThreeCanvas/ThreeScene';
import { useTranslation } from './components/TranslationProvider';

/* ─── Dynamic 3D scenes (SSR disabled — Three.js is client-only) ─── */
const ServicesScene  = dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.ServicesScene),  { ssr: false });
const StatementScene = dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.StatementScene), { ssr: false });
const ProcessScene   = dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.ProcessScene),   { ssr: false });
const BoxScene       = dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.BoxScene),       { ssr: false });
const TorusKnotScene = dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.TorusKnotScene), { ssr: false });
const TetrahedronScene = dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.TetrahedronScene), { ssr: false });

const SceneMap: Record<string, React.ComponentType<any>> = {
  BrandingScene:   dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.BrandingScene),   { ssr: false }),
  FilmScene:       dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.FilmScene),       { ssr: false }),
  VFXScene:        dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.VFXScene),        { ssr: false }),
  SoftwareScene:   dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.SoftwareScene),   { ssr: false }),
  PerformanceScene: dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.PerformanceScene), { ssr: false }),
  AIScene:         dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.AIScene),         { ssr: false }),
  IcosahedronScene: dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.IcosahedronScene), { ssr: false }),
  BoxScene,
  RingScene:       dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.RingScene),       { ssr: false }),
  CapsuleScene:    dynamic(() => import('./components/ThreeCanvas/ThreeScene').then(m => m.CapsuleScene),    { ssr: false }),
  TorusKnotScene,
  TetrahedronScene,
};

/* ─── Types ────────────────────────────────────────────────────── */
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

/* ─── Split text into spans for character animation ─────────────── */
function SplitChars({ text, className }: { text: string; className?: string }) {
  // Complex scripts (Arabic, Devanagari/Hindi, Bengali) form ligatures.
  // Splitting them by character breaks rendering and shows dotted circles.
  const isComplexScript = /[\u0600-\u06FF\u0900-\u097F\u0980-\u09FF]/.test(text);

  if (isComplexScript) {
    const parts = text.split(/(\s+)/);
    return (
      <span className={className} aria-label={text}>
        {parts.map((part, i) => {
          if (!part) return null;
          return (
            <span
              key={i}
              data-char
              aria-hidden="true"
              style={{ display: 'inline-block', willChange: 'transform, opacity', whiteSpace: 'pre' }}
            >
              {part}
            </span>
          );
        })}
      </span>
    );
  }

  // Non-Arabic: group characters by word to prevent mid-word line breaking
  const words = text.split(/(\s+)/);
  return (
    <span className={className} aria-label={text}>
      {words.map((word, wIdx) => {
        if (!word) return null;
        if (/^\s+$/.test(word)) {
          return (
            <span key={wIdx} style={{ display: 'inline-block', whiteSpace: 'pre' }}>
              {word}
            </span>
          );
        }
        return (
          <span key={wIdx} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
            {word.split('').map((char, cIdx) => (
              <span
                key={cIdx}
                data-char
                aria-hidden="true"
                style={{ display: 'inline-block', willChange: 'transform, opacity' }}
              >
                {char}
              </span>
            ))}
          </span>
        );
      })}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HOME CLIENT — 5-Act Cinematic Scroll Experience
   ═══════════════════════════════════════════════════════════════════ */
export default function HomeClient({
  services = [],
  clients = [],
  dynamicContent = null,
}: {
  services?: ServiceData[];
  clients?: ClientData[];
  dynamicContent?: any;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const { t, locale } = useTranslation();

  /* ── Dynamic content helper ────────────────────────────────── */
  const getDc = (path: string, fallbackKey: string): string => {
    if (dynamicContent?.content?.[locale]) {
      const parts = path.split('.');
      let val: any = dynamicContent.content[locale];
      for (const p of parts) {
        if (!val) break;
        val = val[p];
      }
      if (val && typeof val === 'string') return val;
    }
    return t(fallbackKey);
  };

  /* ── Scene selector ─────────────────────────────────────────── */
  const getScene = (section: string, Fallback: any) => {
    const name = dynamicContent?.scenes?.[section];
    if (name && SceneMap[name]) return SceneMap[name];
    return Fallback;
  };

  /* ── Dynamic scene assignments ──────────────────────────────── */
  const HeroDynamicScene       = getScene('hero', HeroScene);
  const PhilosophyDynamicScene = getScene('philosophy', StatementScene);
  const ProcessDynamicScene    = getScene('process', ProcessScene);
  const VisionDynamicScene     = getScene('vision', BoxScene);
  const MissionDynamicScene    = getScene('mission', TorusKnotScene);
  const GoalsDynamicScene      = getScene('goals', TetrahedronScene);

  /* ── Mobile detection ────────────────────────────────────────── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ── 3D card tilt (desktop only) ────────────────────────────── */
  useEffect(() => {
    if (isMobile) return;
    const cards = document.querySelectorAll<HTMLElement>('[data-tilt]');
    const handlers: { el: HTMLElement; mv: (e: MouseEvent) => void; ml: () => void }[] = [];

    cards.forEach(card => {
      const mv = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width  - 0.5) * 14;
        const y = ((e.clientY - r.top)  / r.height - 0.5) * -14;
        card.style.transform = `perspective(900px) rotateX(${y}deg) rotateY(${x}deg) translateZ(10px)`;
      };
      const ml = () => { card.style.transform = ''; };
      card.addEventListener('mousemove', mv);
      card.addEventListener('mouseleave', ml);
      handlers.push({ el: card, mv, ml });
    });

    return () => handlers.forEach(h => {
      h.el.removeEventListener('mousemove', h.mv);
      h.el.removeEventListener('mouseleave', h.ml);
    });
  }, [isMobile]);

  /* ── Stats from dynamic content ─────────────────────────────── */
  const stats = [
    {
      value: dynamicContent?.stats?.projectsValue   || t('stats.projectsValue'),
      label: t('stats.projectsLabel'),
      note:  t('stats.projectsNote'),
    },
    {
      value: dynamicContent?.stats?.clientsValue    || t('stats.clientsValue'),
      label: t('stats.clientsLabel'),
      note:  t('stats.clientsNote'),
    },
    {
      value: dynamicContent?.stats?.disciplinesValue || t('stats.disciplinesValue'),
      label: t('stats.disciplinesLabel'),
      note:  t('stats.disciplinesNote'),
    },
    {
      value: dynamicContent?.stats?.foundedValue    || t('stats.foundedValue'),
      label: t('stats.foundedLabel'),
      note:  t('stats.foundedNote'),
    },
  ];

  return (
    <div className={s.page} id="main">

      {/* ═══════════════════════════════════════════════════════
          ACT 1 — HOOK (100dvh)
          "We Build Cinematic Digital Worlds."
          Anti-center: 60/40 split — text left, 3D right
          The poster test: freeze any frame, it's fine art.
          ═══════════════════════════════════════════════════════ */}
      <section className={s.hero} aria-label="Hero">
        {/* WebGL 3D — right side, desktop only */}
        {!isMobile && (
          <div className={s.heroCanvas} aria-hidden="true">
            <HeroDynamicScene />
          </div>
        )}

        {/* Electric arc atmospheric overlay */}
        <div className={s.heroAtmosphere} aria-hidden="true">
          <div className={s.heroGlow1} />
          <div className={s.heroGlow2} />
        </div>

        {/* Vertical index label — editorial detail */}
        <div className={s.sectionIndex} aria-hidden="true">
          <span>01</span>
          <div className={s.sectionIndexLine} />
        </div>

        {/* Content block — LEFT aligned, not centered (anti-center rule) */}
        <div className={s.heroContent}>

          {/* Badge */}
          <div
            className={s.heroBadge}
            data-hero-badge
            dangerouslySetInnerHTML={{
              __html: getDc('hero.badge', 'hero.badge')
            }}
          />

          {/* Kinetic title — character split for GSAP animation */}
          <h1 className={s.heroTitle} aria-label={`${getDc('hero.titleLine1','hero.titleLine1')} ${getDc('hero.titleLine2','hero.titleLine2')} ${getDc('hero.titleLine3Prefix','hero.titleLine3Prefix')}${getDc('hero.titleLine3Highlight','hero.titleLine3Highlight')}`}>
            <span className={s.heroLine1}>
              <SplitChars
                text={getDc('hero.titleLine1', 'hero.titleLine1')}
              />
            </span>
            <span className={`${s.heroLine2} ${s.italic}`}>
              <SplitChars
                text={getDc('hero.titleLine2', 'hero.titleLine2')}
              />
            </span>
            <span className={s.heroLine3}>
              <SplitChars
                text={getDc('hero.titleLine3Prefix', 'hero.titleLine3Prefix')}
              />
              <span className={s.heroAccent}>
                <SplitChars
                  text={getDc('hero.titleLine3Highlight', 'hero.titleLine3Highlight')}
                />
              </span>
            </span>
          </h1>

          {/* Sub */}
          <p
            className={s.heroSub}
            data-hero-sub
            dangerouslySetInnerHTML={{ __html: getDc('hero.sub', 'hero.sub') }}
          />

          {/* CTAs */}
          <div className={s.heroActions} data-hero-actions>
            <Link href="/projects" className={`${s.btnPrimary} magnetic`}>
              <span>{t('common.exploreOurWork')}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.3"
                      strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link href="/contact" className={s.btnGhost}>
              {t('common.startAProject')}
            </Link>
          </div>
        </div>

        {/* Scroll indicator — fades out on first scroll */}
        <div className={s.scrollIndicator} data-scroll-indicator aria-hidden="true">
          <div className={s.scrollLine}>
            <div className={s.scrollThumb} />
          </div>
          <span>{t('hero.scroll')}</span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATS BELT — Kinetic counter numbers
          4 cells, animated on scroll entry
          ═══════════════════════════════════════════════════════ */}
      <div className={s.statsBelt} data-stagger-container aria-label="Studio statistics">
        {stats.map((st, i) => (
          <div
            key={i}
            className={s.statCell}
            data-stagger-item
            style={{ '--stagger-delay': `${i * 0.09}s` } as React.CSSProperties}
          >
            <span className={s.statVal} data-stat-val>{st.value}</span>
            <span className={s.statLabel}>{st.label}</span>
            <span className={s.statNote}>{st.note}</span>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════
          MARQUEE — Infinite scroll identity strip
          ═══════════════════════════════════════════════════════ */}
      <div className={s.marqueeOuter} aria-hidden="true">
        <div className={s.marqueeTrack} data-marquee-track>
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className={s.marqueeItem}>
              {t('marquee.text')}
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          ACT 2 — ABOUT / WHO WE ARE (asymmetric 60/40)
          Left: heavy text mass. Right: 3D atmospheric scene.
          ═══════════════════════════════════════════════════════ */}
      <section className={s.aboutSection} aria-label="About Pixelectro">
        {/* Section index */}
        <div className={s.sectionIndex} aria-hidden="true">
          <span>02</span>
          <div className={s.sectionIndexLine} />
        </div>

        {/* 3D scene — full bleed background */}
        {!isMobile && (
          <div className={s.aboutScene} aria-hidden="true">
            <StatementScene />
          </div>
        )}

        <div className={s.aboutContent}>
          <div className={s.aboutLeft} data-reveal-left>
            <p className={s.eyebrow}>
              {getDc('about.eyebrow', 'about.eyebrow')}
            </p>
            <h2 className={s.sectionTitle}>
              <span>{getDc('about.titleLine1', 'about.titleLine1')}</span>
              <em className={s.titleItalic}>
                {getDc('about.titleLine2', 'about.titleLine2')}
              </em>
            </h2>
            <div
              className={s.aboutBody}
              dangerouslySetInnerHTML={{ __html: getDc('about.intro', 'about.intro') }}
            />
            <Link href="/contact" className={s.btnGhostAccent}>
              {t('common.getInTouch')}
            </Link>
          </div>

          {/* Right: vision + mission compact */}
          <div className={s.aboutRight} data-reveal>
            <div className={s.aboutCard} data-tilt>
              <div className={s.aboutCardGlow} aria-hidden="true" />
              <p className={s.aboutCardEyebrow}>
                {getDc('vision.title', 'about.vision.title')}
              </p>
              <p className={s.aboutCardBody}
                dangerouslySetInnerHTML={{
                  __html: getDc('vision.desc', 'about.vision.desc')
                }}
              />
            </div>
            <div className={s.aboutCard} data-tilt>
              <div className={s.aboutCardGlow} aria-hidden="true" />
              <p className={s.aboutCardEyebrow}>
                {getDc('mission.title', 'about.mission.title')}
              </p>
              <p className={s.aboutCardBody}
                dangerouslySetInnerHTML={{
                  __html: getDc('mission.desc', 'about.mission.desc')
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          DISCIPLINES — What Sets Us Apart (goals)
          3 items — border-top dividers, no cards
          ═══════════════════════════════════════════════════════ */}
      <section className={s.disciplinesSection} aria-label="Our disciplines">
        <div className={s.sectionIndex} aria-hidden="true">
          <span>03</span>
          <div className={s.sectionIndexLine} />
        </div>

        <div className={s.disciplinesHead} data-reveal>
          <p className={s.eyebrow}>{getDc('goals.title', 'about.goals.title')}</p>
        </div>

        <div className={s.disciplinesList} data-stagger-container>
          {[0, 1, 2].map((i) => {
            const title = getDc(`goals.items.${i}.title`, `about.goals.items.${i}.title`);
            const desc  = getDc(`goals.items.${i}.desc`,  `about.goals.items.${i}.desc`);
            if (!title || title === `about.goals.items.${i}.title`) return null;
            return (
              <div
                key={i}
                className={s.disciplineItem}
                data-stagger-item
                style={{ '--stagger-delay': `${i * 0.12}s` } as React.CSSProperties}
              >
                <span className={s.disciplineNum}>0{i + 1}</span>
                <div className={s.disciplineBody}>
                  <h3
                    className={s.disciplineTitle}
                    dangerouslySetInnerHTML={{ __html: title }}
                  />
                  <p
                    className={s.disciplineDesc}
                    dangerouslySetInnerHTML={{ __html: desc }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SERVICES HEADER
          ═══════════════════════════════════════════════════════ */}
      <section className={s.servicesHead} aria-label="Our services">
        <div className={s.sectionIndex} aria-hidden="true">
          <span>04</span>
          <div className={s.sectionIndexLine} />
        </div>
        <div className={s.servicesHeadContent} data-reveal>
          <p className={s.eyebrow}>
            {t('services.eyebrow', { count: services.length.toString().padStart(2, '0') })}
          </p>
          <h2 className={s.sectionTitle}>
            <span>{t('services.titleLine1')}</span>
            <em className={s.titleItalic}>{t('services.titleLine2')}</em>
          </h2>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ACT 3 — SERVICES (alternating layout)
          Each service: 60/40 split, alternating direction.
          Images slide from off-screen. 3D on desktop.
          ═══════════════════════════════════════════════════════ */}
      {services.map((svc, i) => {
        const isEven = i % 2 === 0;

        const getLocField = (field: string) => {
          if (locale !== 'en') {
            const tr = svc.translations?.[locale];
            if (tr?.[field]) return tr[field];
          }
          return (svc as any)[field];
        };

        const title = getLocField('title');
        const sub   = getLocField('description') || getLocField('excerpt') || getLocField('sub');
        const DynamicScene = svc.homeScene && SceneMap[svc.homeScene]
          ? SceneMap[svc.homeScene]
          : null;

        return (
          <section
            key={svc.n}
            className={`${s.serviceSection} ${isEven ? s.serviceSectionEven : s.serviceSectionOdd}`}
            aria-label={title}
          >
            {/* Text block */}
            <div
              className={s.serviceText}
              data-reveal-left={isEven ? true : undefined}
              data-reveal-right={!isEven ? true : undefined}
            >
              <div className={s.serviceEyebrow}>
                <span className={s.serviceIcon}>{svc.icon}</span>
                <span className={s.serviceNum}>{svc.n}</span>
              </div>
              <h3 className={s.serviceTitle}>{title}</h3>
              <div
                className={s.serviceSub}
                dangerouslySetInnerHTML={{ __html: sub || '' }}
              />
              <Link href={svc.href} className={s.serviceLink}>
                <span>{t('services.exploreService', { title: title || '' })}</span>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <path d="M3.5 9h11M10 4l5 5-5 5" stroke="currentColor" strokeWidth="1.2"
                        strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>

            {/* Visual block — image or 3D scene */}
            <div className={s.serviceVisual} data-service-img>
              {svc.homeImage ? (
                <div className={s.serviceImgWrap}>
                  {svc.homeImage.match(/\.(mp4|webm|mov)$/i) ? (
                    <video
                      src={svc.homeImage}
                      className={s.serviceImg}
                      autoPlay loop muted playsInline
                    />
                  ) : (
                    <img
                      src={svc.homeImage}
                      alt={title}
                      className={s.serviceImg}
                      loading="lazy"
                    />
                  )}
                  <div className={s.serviceImgOverlay} aria-hidden="true" />
                </div>
              ) : (
                !isMobile && DynamicScene && (
                  <div className={s.service3DWrap} aria-hidden="true">
                    <DynamicScene />
                  </div>
                )
              )}
            </div>
          </section>
        );
      })}

      {/* ═══════════════════════════════════════════════════════
          ACT 4 — PHILOSOPHY STATEMENT (dark, full-bleed)
          "We don't make content. We engineer perception."
          ═══════════════════════════════════════════════════════ */}
      <section className={s.statement} aria-label="Our philosophy">
        {!isMobile && (
          <div className={s.statementScene} aria-hidden="true">
            <PhilosophyDynamicScene />
          </div>
        )}

        {/* Atmospheric orbs */}
        <div className={s.statementOrb1} aria-hidden="true" />
        <div className={s.statementOrb2} aria-hidden="true" />

        {/* Section index */}
        <div className={`${s.sectionIndex} ${s.sectionIndexLight}`} aria-hidden="true">
          <span>05</span>
          <div className={s.sectionIndexLine} />
        </div>

        <div className={s.statementInner}>
          {/* Left: manifesto text */}
          <div className={s.statementText} data-reveal-left>
            <p className={s.eyebrowLight}>
              {getDc('philosophy.eyebrow', 'statement.eyebrow')}
            </p>
            <blockquote className={s.statementQuote}>
              <span className={s.quoteLine1}
                dangerouslySetInnerHTML={{
                  __html: getDc('philosophy.quoteLine1', 'statement.quoteLine1')
                }}
              />
              <em className={s.quoteLine2}
                dangerouslySetInnerHTML={{
                  __html: getDc('philosophy.quoteLine2', 'statement.quoteLine2')
                }}
              />
            </blockquote>
            <p className={s.statementBody}
              dangerouslySetInnerHTML={{
                __html: getDc('philosophy.body', 'statement.body')
              }}
            />
            <Link
              href="/contact"
              className={`${s.btnWhite} magnetic`}
              dangerouslySetInnerHTML={{
                __html: getDc('philosophy.cta', 'statement.cta') || 'Start the Conversation'
              }}
            />
          </div>

          {/* Right: floating studio card */}
          <div className={s.statementCard} data-reveal data-tilt>
            <div className={s.floatGlobe} aria-hidden="true" />
            <div className={s.floatCardContent}>
              <p className={s.floatLabel}>
                {getDc('philosophy.floatLabel', 'statement.floatLabel')}
              </p>
              <p className={s.floatSub}>
                {getDc('philosophy.floatSub', 'statement.floatSub')}
              </p>
              <div className={s.floatStats}>
                <div className={s.floatStat}>
                  <span>{dynamicContent?.stats?.projectsValue || t('stats.projectsValue')}</span>
                  <small>{t('stats.projectsLabel')}</small>
                </div>
                <div className={s.floatStat}>
                  <span>{dynamicContent?.stats?.clientsValue || t('stats.clientsValue')}</span>
                  <small>{t('stats.clientsLabel')}</small>
                </div>
                <div className={s.floatStat}>
                  <span>{dynamicContent?.stats?.disciplinesValue || t('stats.disciplinesValue')}</span>
                  <small>{t('stats.disciplinesLabel')}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PROCESS — How We Work
          4 steps in a diagonal tension layout
          ═══════════════════════════════════════════════════════ */}
      <section className={s.process} aria-label="Our process">
        {!isMobile && (
          <div className={s.processScene} aria-hidden="true">
            <ProcessDynamicScene />
          </div>
        )}

        <div className={s.sectionIndex} aria-hidden="true">
          <span>06</span>
          <div className={s.sectionIndexLine} />
        </div>

        <div className={s.processHead} data-reveal>
          <p className={s.eyebrow}>
            {getDc('process.eyebrow', 'process.eyebrow')}
          </p>
          <h2 className={s.sectionTitle}>
            <span>{getDc('process.titleLine1', 'process.titleLine1')}</span>
            <em className={s.titleItalic}>
              {getDc('process.titleLine2', 'process.titleLine2')}
            </em>
          </h2>
        </div>

        <div className={s.processSteps} data-stagger-container>
          {[0, 1, 2, 3].map((i) => {
            const num   = getDc(`process.items.${i}.num`,   `process.step${i+1}Num`);
            const title = getDc(`process.items.${i}.title`, `process.step${i+1}Title`);
            const body  = getDc(`process.items.${i}.body`,  `process.step${i+1}Body`);
            if (!title || title === `process.step${i+1}Title`) return null;
            return (
              <div
                key={i}
                className={s.processStep}
                data-stagger-item
                style={{ '--stagger-delay': `${i * 0.12}s` } as React.CSSProperties}
              >
                <div className={s.processStepNum}
                  dangerouslySetInnerHTML={{ __html: num }}
                />
                <h3 className={s.processStepTitle}
                  dangerouslySetInnerHTML={{ __html: title }}
                />
                <p className={s.processStepBody}
                  dangerouslySetInnerHTML={{ __html: body }}
                />
                {/* Connector line between steps */}
                {i < 3 && <div className={s.processConnector} aria-hidden="true" />}
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CLIENTS — Trusted By (only if data exists)
          Minimal grid, filter to luminosity 0
          ═══════════════════════════════════════════════════════ */}
      {clients.length > 0 && (
        <section className={s.clients} data-reveal aria-label="Our clients">
          <div className={s.clientsInner}>
            <p className={s.eyebrow}>{t('clients.eyebrow')}</p>
            <div className={s.clientsGrid}>
              {clients.map(c => (
                c.link ? (
                  <a
                    key={c.id}
                    href={c.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={s.clientItem}
                    aria-label={c.name}
                  >
                    {c.logoUrl
                      ? <img src={c.logoUrl} alt={c.name} className={s.clientLogo} loading="lazy" />
                      : <span className={s.clientName}>{c.name}</span>
                    }
                  </a>
                ) : (
                  <div key={c.id} className={s.clientItem} aria-label={c.name}>
                    {c.logoUrl
                      ? <img src={c.logoUrl} alt={c.name} className={s.clientLogo} loading="lazy" />
                      : <span className={s.clientName}>{c.name}</span>
                    }
                  </div>
                )
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          ACT 5 — CLOSE / CTA (100dvh — echo of Act 1)
          The site breathing out. Accent shifts warmth.
          ═══════════════════════════════════════════════════════ */}
      <section className={s.cta} aria-label="Get in touch">
        <div className={s.ctaOrb1} aria-hidden="true" />
        <div className={s.ctaOrb2} aria-hidden="true" />

        <div className={s.sectionIndex} aria-hidden="true">
          <span>07</span>
          <div className={s.sectionIndexLine} />
        </div>

        <div className={s.ctaInner} data-reveal>
          <p className={s.eyebrowLight}>{t('cta.eyebrow')}</p>
          <h2 className={s.ctaTitle}>
            <span>{t('cta.titleLine1')}</span>
            <em className={s.ctaTitleItalic}>{t('cta.titleLine2')}</em>
          </h2>
          <div className={s.ctaActions}>
            <Link href="/contact" className={`${s.btnWhite} magnetic`}>
              {t('common.getInTouch')}
            </Link>
            <a
              href="https://wa.me/201060107536"
              target="_blank"
              rel="noopener noreferrer"
              className={s.btnGhostLight}
            >
              {t('common.chatOnWhatsapp')}
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
