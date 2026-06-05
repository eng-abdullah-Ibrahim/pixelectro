"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import LanguageSwitcher from '../LanguageSwitcher';
import { useTranslation } from '../TranslationProvider';
import s from './Navbar.module.css';

export default function Navbar({ links }: { links: { href: string; label: string; translations?: any }[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t, locale } = useTranslation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <nav className={`${s.nav} ${scrolled ? s.scrolled : ''}`}>
        <Link href="/" className={s.logo}>
          <div className={s.logoMark}><span>P</span></div>
          <span className={s.logoText}>PIXELECTRO</span>
        </Link>

        <ul className={s.links}>
          {links.map(l => {
            let label = l.label;
            if (locale !== 'en') {
              if (l.translations && l.translations[locale]?.title) {
                label = l.translations[locale].title;
              } else if (l.href === '/testimonials') {
                label = t('navbar.testimonials');
              } else {
                // Fallback to static JSON file
                const slug = l.href.slice(1);
                const staticTitle = t(`servicePages.${slug}`);
                if (staticTitle && staticTitle !== `servicePages.${slug}`) {
                  label = staticTitle;
                }
              }
            }
            return (
              <li key={l.href}>
                <Link href={l.href} className={s.link}>{label}</Link>
              </li>
            );
          })}
        </ul>

        <div className={s.navActions}>
          <LanguageSwitcher />
          <Link href="/contact" className={s.cta}>{t('common.getInTouch').replace(' →', '')}</Link>
        </div>

        {/* Hamburger */}
        <button
          className={`${s.hamburger} ${menuOpen ? s.open : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile Fullscreen Menu */}
      <div className={`${s.mobileMenu} ${menuOpen ? s.open : ''}`}>
        <ul className={s.mobileLinks}>
          {links.map(l => {
            let mobileLabel = l.label;
            if (locale !== 'en') {
              if (l.translations && l.translations[locale]?.title) {
                mobileLabel = l.translations[locale].title;
              } else if (l.href === '/testimonials') {
                mobileLabel = t('navbar.testimonials');
              } else {
                const slug = l.href.slice(1);
                const staticTitle = t(`servicePages.${slug}`);
                if (staticTitle && staticTitle !== `servicePages.${slug}`) {
                  mobileLabel = staticTitle;
                }
              }
            }
            return (
              <li key={l.href}>
                <Link href={l.href} className={s.mobileLink} onClick={() => setMenuOpen(false)}>
                  {mobileLabel}
                </Link>
              </li>
            );
          })}
        </ul>
        <Link href="/contact" className={s.mobileCta} onClick={() => setMenuOpen(false)}>
          {t('common.getInTouch').replace(' →', '')}
        </Link>
      </div>
    </>
  );
}
