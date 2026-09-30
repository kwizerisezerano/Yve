/**
 * Super Admin Seed Script
 *
 * Creates the internal "platform" system tenant and a SUPER_ADMIN user.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register prisma/seeds/super-admin.seed.ts
 *
 * Env vars (can also be set in .env):
 *   SUPER_ADMIN_EMAIL    (default: superadmin@ingoga.internal)
 *   SUPER_ADMIN_PASSWORD (default: changeme123!)
 */

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { getDatabaseConfig } from '../../src/shared/prisma/database.config';
import * as bcrypt from 'bcrypt';

const PLATFORM_TENANT_ID = '00000000-0000-0000-0000-000000000001';
const PLATFORM_TENANT_NAME = 'Ingoga Platform';

async function main() {
  const dbConfig = getDatabaseConfig();
  const prisma = new PrismaClient({
    adapter: new PrismaPg(dbConfig),
  });

  const email = process.env.SUPER_ADMIN_EMAIL ?? 'superadmin@ingoga.internal';
  const password = process.env.SUPER_ADMIN_PASSWORD ?? 'changeme123!';

  console.log('🌱 Seeding Super Admin...');

  // 1. Upsert the platform system tenant
  const tenant = await prisma.tenant.upsert({
    where: { id: PLATFORM_TENANT_ID },
    create: { id: PLATFORM_TENANT_ID, name: PLATFORM_TENANT_NAME, status: 'ACTIVE' },
    update: { name: PLATFORM_TENANT_NAME },
  });
  console.log(`✅ Platform tenant: "${tenant.name}" (${tenant.id})`);

  // 2. Upsert SUPER_ADMIN user
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await prisma.user.findFirst({
    where: { tenantId: PLATFORM_TENANT_ID, email },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash, role: 'SUPER_ADMIN', status: 'ACTIVE' },
    });
    console.log(`✅ Updated SUPER_ADMIN: ${email}`);
  } else {
    await prisma.user.create({
      data: {
        tenantId: PLATFORM_TENANT_ID,
        email,
        passwordHash,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      },
    });
    console.log(`✅ Created SUPER_ADMIN: ${email}`);
  }

  await prisma.$disconnect();

  console.log('\n🎉 Done! Login credentials:');
  console.log(`   Email   : ${email}`);
  console.log(`   Password: ${password}`);
  console.log('\n⚠️  Change the password after first login!\n');
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
