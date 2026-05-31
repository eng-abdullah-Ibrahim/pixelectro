import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

// Simple SHA256 hash — must match what the login page uses
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

async function main() {
  const email = 'admin@pixelectro.com';
  const password = 'Pixelectro2026!';

  // Delete existing admin if exists
  await prisma.user.deleteMany({ where: { email } });

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashPassword(password),
      name: 'Admin',
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Admin user created successfully!');
  console.log('   Email   :', user.email);
  console.log('   Password: Pixelectro2026!');
  console.log('   Role    :', user.role);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
