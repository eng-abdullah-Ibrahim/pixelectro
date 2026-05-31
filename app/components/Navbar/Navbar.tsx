"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import s from './Navbar.module.css';

export default function Navbar({ links }: { links: { href: string; label: string }[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

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
          {links.map(l => (
            <li key={l.href}>
              <Link href={l.href} className={s.link}>{l.label}</Link>
            </li>
          ))}
        </ul>

        <Link href="/contact" className={s.cta}>Get in Touch</Link>

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
          {links.map(l => (
            <li key={l.href}>
              <Link href={l.href} className={s.mobileLink} onClick={() => setMenuOpen(false)}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/contact" className={s.mobileCta} onClick={() => setMenuOpen(false)}>
          Get in Touch
        </Link>
      </div>
    </>
  );
}
