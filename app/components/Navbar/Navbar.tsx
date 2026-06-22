"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from '../LanguageSwitcher';
import { useTranslation } from '../TranslationProvider';
import s from './Navbar.module.css';
import gsap from 'gsap';

/* ─────────────────────────────────────────────────────────────────
   NAVBAR — Asymmetric Architectural Bar
   Philosophy: Barely visible at rest. Presence only when needed.
   - Scrolled < 50px: transparent, floating
   - Scrolled > 50px: frost glass, hairline bottom border
   - Mobile: fullscreen kinetic menu with staggered link reveal
   ───────────────────────────────────────────────────────────────── */

export default function Navbar({
  links,
}: {
  links: { href: string; label: string; translations?: any }[];
}) {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const pathname  = usePathname();
  const { t, locale }             = useTranslation();
  const mobileLinksRef            = useRef<HTMLUListElement>(null);
  const menuRef                   = useRef<HTMLDivElement>(null);

  // ── Scroll detection ──────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Close on route change ─────────────────────────────────────
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // ── Lock body scroll when menu open ──────────────────────────
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // ── Animate mobile menu open/close ───────────────────────────
  useEffect(() => {
    if (!menuRef.current || !mobileLinksRef.current) return;

    if (menuOpen) {
      gsap.fromTo(menuRef.current,
        { clipPath: 'inset(0 0 100% 0)', pointerEvents: 'none' },
        { clipPath: 'inset(0 0 0% 0)', duration: 0.7, ease: 'expo.inOut', pointerEvents: 'all' }
      );
      gsap.fromTo(
        mobileLinksRef.current.querySelectorAll('li, .menuCta'),
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, stagger: 0.07, duration: 0.6, ease: 'power3.out', delay: 0.35 }
      );
    } else {
      gsap.to(menuRef.current, {
        clipPath: 'inset(0 0 100% 0)',
        duration: 0.6,
        ease: 'expo.inOut',
        pointerEvents: 'none',
      });
    }
  }, [menuOpen]);

  // ── Label resolution with RTL locale support ──────────────────
  const getLabel = (l: (typeof links)[0]) => {
    if (locale !== 'en') {
      if (l.translations?.[locale]?.title) return l.translations[locale].title;
      if (l.href === '/testimonials') return t('navbar.testimonials');
      const slug = l.href.slice(1);
      const static_ = t(`servicePages.${slug}`);
      if (static_ !== `servicePages.${slug}`) return static_;
    }
    return l.label;
  };

  return (
    <>
      <a className="skip-link" href="#main">{t('common.skipToContent') || 'Skip to content'}</a>

      <nav
        className={`${s.nav} ${scrolled ? s.scrolled : ''}`}
        aria-label="Main navigation"
      >
        {/* ── Logo ───────────────────────────────────────────── */}
        <Link href="/" className={s.logo} aria-label="Pixelectro — Home">
          <div className={s.logoImgWrap} aria-hidden="true">
            <Image
              src="/logo.jpg"
              alt="Pixelectro logo"
              width={44}
              height={44}
              className={s.logoImg}
              priority
            />
            <div className={s.logoGlow} />
          </div>
          <div className={s.logoTextBlock}>
            <span className={s.logoText}>PIXELECTRO</span>
            <span className={s.logoSubText}>{t('brand.forAdvertising') || 'FOR ADVERTISING'}</span>
          </div>
        </Link>

        {/* ── Desktop nav links (center) ───────────────────────── */}
        <ul className={s.links} role="list">
          {links.map(l => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={s.link}
                aria-current={pathname === l.href ? 'page' : undefined}
              >
                {getLabel(l)}
                <span className={s.linkLine} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Right side: language + CTA ───────────────────────── */}
        <div className={s.navEnd}>
          <LanguageSwitcher />
          <Link href="/contact" className={`${s.cta} magnetic`}>
            <span>{t('common.getInTouch').replace(' →', '')}</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2"
                    strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        {/* ── Hamburger ──────────────────────────────────────────── */}
        <button
          className={`${s.hamburger} ${menuOpen ? s.open : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          type="button"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </nav>

      {/* ── Mobile Fullscreen Menu ──────────────────────────────── */}
      <div
        ref={menuRef}
        id="mobile-menu"
        className={s.mobileMenu}
        role="dialog"
        aria-label="Navigation menu"
        aria-modal="true"
      >
        {/* Diagonal decorative element */}
        <div className={s.menuDecor} aria-hidden="true">
          <span>PIXELECTRO</span>
        </div>

        <ul ref={mobileLinksRef} className={s.mobileLinks} role="list">
          {links.map((l, i) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={s.mobileLink}
                onClick={() => setMenuOpen(false)}
              >
                <span className={s.mobileLinkNum}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={s.mobileLinkText}>{getLabel(l)}</span>
                <svg className={s.mobileLinkArrow} width="20" height="20"
                     viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path d="M4 10h12M12 5l5 5-5 5" stroke="currentColor"
                        strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </li>
          ))}
        </ul>

        <div className="menuCta">
          <Link
            href="/contact"
            className={s.mobileCta}
            onClick={() => setMenuOpen(false)}
          >
            {t('common.startAProject')}
          </Link>
        </div>

        {/* Corner markers */}
        <div className={s.menuCornerTL} aria-hidden="true" />
        <div className={s.menuCornerBR} aria-hidden="true" />
      </div>
    </>
  );
}
