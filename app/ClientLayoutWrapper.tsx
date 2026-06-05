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
import { trackPageView } from '../lib/tracking';


export default function ClientLayoutWrapper({ children, links = [] }: { children: React.ReactNode, links?: {href: string, label: string, translations?: any}[] }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/pxl-studio-9x7k2');

  useEffect(() => {
    if (isAdmin) return;
    // Track unique site visit — fires only once per browser lifetime
    trackPageView();
  }, [isAdmin]);


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
