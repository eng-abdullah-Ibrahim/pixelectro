import prisma from '@/lib/prisma';
import HomeClient from "./HomeClient";
import { getLanguage, translateField } from "../lib/translationHelper";

export default async function Page() {
  const lang = await getLanguage();

  const pages = await prisma.servicePage.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });

  const prominentClients = await prisma.prominentClient.findMany({
    orderBy: { order: 'asc' }
  });

  const services = pages.map((p, i) => ({
    n: (i + 1).toString().padStart(2, '0'),
    title: p.title,
    sub: p.excerpt || p.description || 'Elevating digital experiences.',
    href: `/${p.slug}`,
    icon: p.icon || '◈',
    homeImage: p.homeImage || null,
    homeScene: p.homeScene || p.scene || null,
    translations: p.translations || {},
  }));

  const clients = prominentClients.map(c => ({
    id: c.id,
    name: c.name || '',
    logoUrl: c.logoUrl || '',
    link: c.link || '',
  }));

  let homepageContent = null;
  const setting = await prisma.globalSetting.findUnique({
    where: { key: 'HOMEPAGE_CONTENT' }
  });
  if (setting) {
    try {
      homepageContent = JSON.parse(setting.value);
    } catch (e) {
      console.error('Failed to parse HOMEPAGE_CONTENT', e);
    }
  }

  return <HomeClient services={services} clients={clients} dynamicContent={homepageContent} />;
}
