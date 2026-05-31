import prisma from "../lib/prisma";
import HomeClient from "./HomeClient";

export default async function Page() {
  const pages = await prisma.servicePage.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });

  const services = pages.map((p, i) => ({
    n: (i + 1).toString().padStart(2, '0'),
    title: p.title,
    sub: p.description || 'Elevating digital experiences.',
    href: `/${p.slug}`,
    icon: p.icon || '◈'
  }));

  return <HomeClient services={services} />;
}
