const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log('Connecting...');
  const start = Date.now();
  try {
    const res = await prisma.servicePage.count();
    console.log('Success! Count:', res, 'Time:', Date.now() - start, 'ms');
  } catch(e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
