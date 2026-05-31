import Link from 'next/link';
import s from './Footer.module.css';

export default function Footer() {
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
            Where vision becomes<br />
            <em>architecture.</em>
          </p>
          <p className={s.location}>Alexandria, Egypt · Global Reach</p>
        </div>

        <div className={s.cols}>
          <div>
            <p className={s.colHead}>Services</p>
            <ul className={s.colList}>
              <li><Link href="/branding">Brand &amp; Identity</Link></li>
              <li><Link href="/video-editing">Film &amp; Video</Link></li>
              <li><Link href="/3d-vfx">3D &amp; VFX</Link></li>
              <li><Link href="/software-development">Engineering</Link></li>
              <li><Link href="/performance-marketing">Marketing</Link></li>
              <li><Link href="/ai-solutions">AI Solutions</Link></li>
            </ul>
          </div>
          <div>
            <p className={s.colHead}>Contact</p>
            <ul className={s.colList}>
              <li><a href="mailto:hello@pixelectro.com">hello@pixelectro.com</a></li>
              <li><a href="https://wa.me/201060107536">+20 106 010 7536</a></li>
              <li><Link href="/contact">Send a Message</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className={s.bottom}>
        <span>© {new Date().getFullYear()} Pixelectro Studio. All rights reserved.</span>
        <Link href="/admin" className={s.adminDot} title="Admin" />
      </div>
    </footer>
  );
}
