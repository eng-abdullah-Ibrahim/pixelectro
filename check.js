const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.servicePage.findMany().then(p => console.log(p.map(x => ({ slug: x.slug, scene: x.scene, homeScene: x.homeScene })))).finally(() => prisma.$disconnect());
