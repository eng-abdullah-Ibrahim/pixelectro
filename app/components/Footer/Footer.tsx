"use client";

import Link from 'next/link';
import Image from 'next/image';
import s from './Footer.module.css';
import { useTranslation } from '../TranslationProvider';
import { MessageCircle, Mail } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────
   FOOTER — Editorial Exhale
   Philosophy: The site breathing out. Echoes Act 1 (hero).
   Layout: Asymmetric — large wordmark left, sparse links right.
   The footer IS the closing manifesto.
   ───────────────────────────────────────────────────────────────── */

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className={s.footer}>
      {/* Top separator hairline with glow */}
      <div className={s.topRule} aria-hidden="true" />

      <div className={s.inner}>
        {/* ── Left: Brand block ──────────────────────────────── */}
        <div className={s.brand}>
          <div className={s.logoRow}>
            <div className={s.logoImgWrap} aria-hidden="true">
              <Image
                src="/logo.jpg"
                alt="Pixelectro logo"
                width={52}
                height={52}
                className={s.logoImg}
              />
            </div>
            <div className={s.logoTextBlock}>
              <span className={s.logoText}>PIXELECTRO</span>
              <span className={s.logoSubText}>{t('brand.forAdvertising') || 'FOR ADVERTISING'}</span>
            </div>
          </div>

          <p className={s.tagline}>
            {t('footer.tagline')}
          </p>

          <p className={s.location}>
            {t('brand.location') || 'Alexandria, Egypt · Global Reach'}
          </p>

          {/* Social links */}
          <div className={s.socials}>
            <a
              href="https://wa.me/201060107536"
              target="_blank"
              rel="noopener noreferrer"
              className={s.socialLink}
              aria-label="WhatsApp"
            >
              <MessageCircle size={18} />
            </a>
            <a
              href="mailto:hello@pixelectro.com"
              className={s.socialLink}
              aria-label="Email"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>

        {/* ── Right: sparse link columns ──────────────────────── */}
        <div className={s.cols}>
          <div className={s.col}>
            <p className={s.colHead}>{t('navbar.services')}</p>
            <ul className={s.colList}>
              <li><Link href="/branding">{t('servicePages.branding')}</Link></li>
              <li><Link href="/video-editing">{t('servicePages.video')}</Link></li>
              <li><Link href="/3d-vfx">{t('servicePages.threeD')}</Link></li>
              <li><Link href="/software-development">{t('servicePages.web')}</Link></li>
              <li><Link href="/performance-marketing">{t('servicePages.marketing')}</Link></li>
            </ul>
          </div>

          <div className={s.col}>
            <p className={s.colHead}>{t('navbar.contact')}</p>
            <ul className={s.colList}>
              <li>
                <a href="mailto:hello@pixelectro.com">
                  hello@pixelectro.com
                </a>
              </li>
              <li>
                <a href="https://wa.me/201060107536" target="_blank" rel="noopener noreferrer">
                  +20 106 010 7536
                </a>
              </li>
              <li>
                <Link href="/contact">{t('common.getInTouch')}</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Oversized background wordmark ── visual weight anchor */}
      <div className={s.bgWordmark} aria-hidden="true">
        PIXELECTRO
      </div>

      {/* ── Bottom bar ─────────────────────────────────────────── */}
      <div className={s.bottom}>
        <span className={s.copyright}>
          © {year} Pixelectro. All rights reserved.
        </span>
        <div className={s.bottomRight}>
          <span className={s.builtWith}>
            <span className={s.accentDot}>■</span> {t('brand.builtWithLocation') || 'Alexandria, Egypt'}
          </span>
          {/* Invisible admin link — the tradition */}
          <Link
            href="/pxl-studio-9x7k2"
            className={s.adminDot}
            title="Studio"
            aria-label="Admin"
          />
        </div>
      </div>
    </footer>
  );
}
