"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Palette, Video, Film, Cuboid, MonitorPlay, Share2, TrendingUp, Cpu } from 'lucide-react';
import styles from './ServicesHub.module.css';

const services = [
  { id: 'branding', title: 'Branding & Design', icon: <Palette size={48} />, desc: 'Visual Identity, Logos, and Brand Guidelines.', link: '/branding' },
  { id: 'video-editing', title: 'Video Editing', icon: <Video size={48} />, desc: 'High-end post-production and VFX.', link: '/video-editing' },
  { id: '2d-animation', title: '2D Animation', icon: <Film size={48} />, desc: 'Motion Graphics and 2D Characters.', link: '/2d-animation' },
  { id: '3d-vfx', title: '3D & VFX', icon: <Cuboid size={48} />, desc: 'CGI, VFX, and 3D Product Motion.', link: '/3d-vfx' },
  { id: 'software-development', title: 'Software Dev', icon: <MonitorPlay size={48} />, desc: 'Custom UI/UX Web Design & Apps.', link: '/software-development' },
  { id: 'content-management', title: 'Content Mgmt', icon: <Share2 size={48} />, desc: 'Social Media Strategies and publishing.', link: '/content-management' },
  { id: 'performance-marketing', title: 'Performance Ads', icon: <TrendingUp size={48} />, desc: 'Google, Meta, and TikTok Ads.', link: '/performance-marketing' },
  { id: 'ai-solutions', title: 'AI Automation', icon: <Cpu size={48} />, desc: 'AI generation and workflow automation.', link: '/ai-solutions' }
];

export default function ServicesHub() {
  const [activeBg, setActiveBg] = useState<string | null>(null);

  return (
    <section className={styles.hubSection}>
      <div className={styles.content}>
        <h2 className={styles.title}>Our <span className={styles.titleAccent}>8 Pillars</span> of Creation</h2>
        <div className={styles.grid}>
          {services.map((svc) => (
            <Link href={svc.link} key={svc.id}>
              <div 
                className={styles.card}
                onMouseEnter={() => setActiveBg(svc.id)}
                onMouseLeave={() => setActiveBg(null)}
              >
                <div className={styles.icon}>{svc.icon}</div>
                <h3 className={styles.cardTitle}>{svc.title}</h3>
                <p className={styles.cardDesc}>{svc.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
