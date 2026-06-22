import type { Metadata } from 'next';
import { Space_Grotesk, Cormorant_Garamond, JetBrains_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import ClientLayoutWrapper from './ClientLayoutWrapper';
import prisma from '@/lib/prisma';
import { Analytics } from '@vercel/analytics/react';
import { getLanguage } from '@/lib/translationHelper';
import { TranslationProvider } from './components/TranslationProvider';

const spaceGrotesk = Space_Grotesk({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  weight: ['300', '400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const lyonArabic = localFont({
  src: [
    { path: './fonts/COMM - Lyon Arabic Display Light.otf', weight: '300', style: 'normal' },
    { path: './fonts/COMM - Lyon Arabic Display Regular.otf', weight: '400', style: 'normal' },
    { path: './fonts/COMM - Lyon Arabic Display Medium.otf', weight: '500', style: 'normal' },
    { path: './fonts/COMM - Lyon Arabic Display Bold.otf', weight: '700', style: 'normal' },
    { path: './fonts/COMM - Lyon Arabic Display Black.otf', weight: '900', style: 'normal' },
    { path: './fonts/COMM - Lyon Arabic Slanted Display Light.otf', weight: '300', style: 'italic' },
    { path: './fonts/COMM - Lyon Arabic Slanted Display Regular.otf', weight: '400', style: 'italic' },
    { path: './fonts/COMM - Lyon Arabic Slanted Display Medium.otf', weight: '500', style: 'italic' },
    { path: './fonts/COMM - Lyon Arabic Slanted Display Bold.otf', weight: '700', style: 'italic' },
    { path: './fonts/COMM - Lyon Arabic Slanted Display Black.otf', weight: '900', style: 'italic' }
  ],
  variable: '--font-arabic',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Pixelectro — Where Vision Becomes Architecture',
  description: 'Pixelectro is a global creative studio crafting cinematic brand identities, immersive digital experiences, and elite software infrastructure.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1565D8',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const pages = await prisma.servicePage.findMany({ 
    where: { isActive: true },
    orderBy: { order: 'asc' } 
  });
  const locale = await getLanguage();
  const RTL = ['ar', 'ur', 'he', 'fa'];
  const dir = RTL.includes(locale) ? 'rtl' : 'ltr';

  const links = [
    ...pages.map(p => {
      return { href: `/${p.slug}`, label: p.title, translations: p.translations || {} };
    }),
    { href: '/testimonials', label: 'Testimonials' }
  ];

  return (
    <html lang={locale} dir={dir} data-lang={locale}>
      <body className={`${spaceGrotesk.variable} ${cormorant.variable} ${jetbrains.variable} ${lyonArabic.variable}`}>
        <div className="noise-overlay" aria-hidden="true" />
        <TranslationProvider initialLocale={locale}>
          <ClientLayoutWrapper links={links}>{children}</ClientLayoutWrapper>
        </TranslationProvider>
        <Analytics />
      </body>
    </html>
  );
}
