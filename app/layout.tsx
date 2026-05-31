import type { Metadata } from 'next';
import { Space_Grotesk, Cormorant_Garamond, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import ClientLayoutWrapper from './ClientLayoutWrapper';
import prisma from '../lib/prisma';

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
  const links = pages.map(p => ({ href: `/${p.slug}`, label: p.title }));

  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${cormorant.variable} ${jetbrains.variable}`}>
        <ClientLayoutWrapper links={links}>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
