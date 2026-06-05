import type { Metadata } from 'next';
import { Space_Grotesk, Cormorant_Garamond, JetBrains_Mono, Cairo } from 'next/font/google';
import './globals.css';
import ClientLayoutWrapper from './ClientLayoutWrapper';
import prisma from '@/lib/prisma';
import { Analytics } from '@vercel/analytics/react';
import { cookies } from 'next/headers';
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

const cairo = Cairo({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['arabic', 'latin'],
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
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';
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
      <body className={`${spaceGrotesk.variable} ${cormorant.variable} ${jetbrains.variable} ${cairo.variable}`}>
        <TranslationProvider initialLocale={locale}>
          <ClientLayoutWrapper links={links}>{children}</ClientLayoutWrapper>
        </TranslationProvider>
        <Analytics />
      </body>
    </html>
  );
}
