"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import WhatsAppWidget from './components/WhatsAppWidget/WhatsAppWidget';
import Preloader from './components/Preloader/Preloader';
import GridBackground from './components/GridBackground/GridBackground';
import GSAPInitializer from './components/GSAPInitializer';
import ContentProtection from './components/ContentProtection';


export default function ClientLayoutWrapper({ children, links = [] }: { children: React.ReactNode, links?: {href: string, label: string}[] }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) return;

    // Track the page view event
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'PAGE_VIEW',
        targetId: pathname || '/',
        targetName: document.title || pathname || 'Home',
      }),
    }).catch(err => console.error('Failed to track page view:', err));
  }, [pathname, isAdmin]);

  return (
    <>
      {!isAdmin && <ContentProtection />}
      <Preloader />
      {!isAdmin && <GSAPInitializer />}
      <GridBackground />
      <div style={{ position: 'relative', zIndex: 10 }}>
        {!isAdmin && <Navbar links={links} />}
        <main>
          {children}
        </main>
        {!isAdmin && <Footer />}
        {!isAdmin && <WhatsAppWidget />}
      </div>
    </>
  );
}
