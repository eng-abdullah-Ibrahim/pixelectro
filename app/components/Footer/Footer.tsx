"use client";

import Link from 'next/link';
import s from './Footer.module.css';
import { useTranslation } from '../TranslationProvider';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className={s.footer}>
      {/* Top gradient strip */}
      <div className={s.topStrip} />

      <div className={s.inner}>
        <div className={s.brand}>
          <div className={s.logoRow}>
            <div className={s.logoMark}><span>P</span></div>
            <span className={s.logoText}>PIXELECTRO</span>
          </div>
          <p className={s.tagline}>
            {t('footer.tagline')}
          </p>
          <p className={s.location}>{t('stats.foundedNote')} · Global Reach</p>
        </div>

        <div className={s.cols}>
          <div>
            <p className={s.colHead}>{t('navbar.services')}</p>
            <ul className={s.colList}>
              <li><Link href="/branding">{t('servicePages.branding')}</Link></li>
              <li><Link href="/video-editing">{t('servicePages.video')}</Link></li>
              <li><Link href="/3d-vfx">{t('servicePages.threeD')}</Link></li>
              <li><Link href="/software-development">{t('servicePages.web')}</Link></li>
              <li><Link href="/performance-marketing">{t('servicePages.marketing')}</Link></li>
            </ul>
          </div>
          <div>
            <p className={s.colHead}>{t('navbar.contact')}</p>
            <ul className={s.colList}>
              <li><a href="mailto:hello@pixelectro.com">hello@pixelectro.com</a></li>
              <li><a href="https://wa.me/201060107536">+20 106 010 7536</a></li>
              <li><Link href="/contact">{t('common.getInTouch')}</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className={s.bottom}>
        <span>{t('footer.copyright')}</span>
        <Link href="/pxl-studio-9x7k2" className={s.adminDot} title="Admin" />
      </div>
    </footer>
  );
}
