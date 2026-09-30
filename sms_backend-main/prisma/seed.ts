import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const host = process.env.DB_HOST ?? '127.0.0.1';
const port = Number(process.env.DB_PORT ?? 5432);
const database = process.env.DB_DATABASE ?? 'ingoga_core';
const user = process.env.DB_USERNAME ?? 'postgres';
const password = process.env.DB_PASSWORD ?? 'postgres';

const adapter = new PrismaPg({ host, port, database, user, password });
const prisma = new PrismaClient({ adapter });



async function main() {
  console.log('🌱 Starting seed...');

  // ── Tenant ───────────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { id: 'seed-tenant-001' },
    update: {},
    create: {
      id: 'seed-tenant-001',
      name: 'Ingoga Demo',
      email: 'demo@ingoga.com',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Tenant:', tenant.name);

  // ── Admin User ────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin123!', 12);
  const user = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@demo.ingoga.com' } },
    update: {},
    create: {
      id: 'seed-user-001',
      tenantId: tenant.id,
      email: 'admin@demo.ingoga.com',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Admin user:', user.email);

  // ── Wallet ────────────────────────────────────────────────────────────────
  const wallet = await prisma.wallet.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      id: 'seed-wallet-001',
      tenantId: tenant.id,
      balance: 100000,
      reservedBalance: 0,
      currency: 'RWF',
      version: 0,
    },
  });
  console.log('✅ Wallet balance:', wallet.balance.toString(), wallet.currency);

  // ── Initial ledger credit entry ───────────────────────────────────────────
  const existingCredit = await prisma.ledgerEntry.findFirst({ where: { walletId: wallet.id, type: 'CREDIT' } });
  if (!existingCredit) {
    await prisma.ledgerEntry.create({
      data: {
        id: 'seed-ledger-001',
        walletId: wallet.id,
        type: 'CREDIT',
        amount: 100000,
        balanceBefore: 0,
        balanceAfter: 100000,
        reference: 'SEED_INITIAL_CREDIT',
        description: 'Initial seed credit',
      },
    });
    console.log('✅ Initial ledger credit entry created');
  }

  // ── App ───────────────────────────────────────────────────────────────────
  const app = await prisma.app.upsert({
    where: { id: 'seed-app-001' },
    update: {},
    create: {
      id: 'seed-app-001',
      tenantId: tenant.id,
      name: 'Demo Application',
      description: 'Default application created during seed',
      status: 'ACTIVE',
      messagesSent: 0,
    },
  });
  console.log('✅ App:', app.name);

  // ── API Key ───────────────────────────────────────────────────────────────
  const rawKey = `sk_test_seed_${crypto.randomBytes(20).toString('hex')}`;
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const prefix = 'sk_test_seed';
  const existingKey = await prisma.apiKey.findFirst({
    where: {
      appId: app.id,
      status: 'ACTIVE',
    },
  });
  if (!existingKey) {
    await prisma.apiKey.create({
      data: {
        id: 'seed-apikey-001',
        appId: app.id,
        name: 'Seed API Key (dev only)',
        keyHash,
        keyPrefix: prefix,
        status: 'ACTIVE',
      },
    });
    console.log(`✅ API Key created. RAW SECRET (save this now): ${rawKey}`);
  } else {
    console.log('ℹ️  API key already exists, skipping');
  }

  // ── Sender ID ─────────────────────────────────────────────────────────────
  const senderId = await prisma.senderID.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: 'INGOGA' } },
    update: {},
    create: {
      id: 'seed-sender-001',
      tenantId: tenant.id,
      name: 'INGOGA',
      status: 'APPROVED',
      approvedAt: new Date(),
    },
  });
  console.log('✅ Sender ID:', senderId.name, senderId.status);

  // ── Global Pricing ────────────────────────────────────────────────────────
  const routes = [
    { country: 'RW', operator: 'MTN', customerPrice: 32, providerCost: 25 },
    { country: 'RW', operator: 'AIRTEL', customerPrice: 32, providerCost: 25 },
    { country: 'KE', operator: 'SAFARICOM', customerPrice: 45, providerCost: 35 },
    { country: 'UG', operator: 'MTN', customerPrice: 38, providerCost: 28 },
  ];

  for (const route of routes) {
    const existing = await prisma.pricing.findFirst({
      where: { tenantId: null, country: route.country, operator: route.operator },
    });
    if (!existing) {
      await prisma.pricing.create({
        data: {
          tenantId: null,
          country: route.country,
          operator: route.operator,
          customerPrice: route.customerPrice,
          providerCost: route.providerCost,
          currency: 'RWF',
        },
      });
    }
  }
  console.log('✅ Global pricing routes seeded:', routes.length);

  // ── Providers ─────────────────────────────────────────────────────────────
  await prisma.provider.upsert({
    where: { code: 'STUB_PROVIDER' },
    update: {},
    create: {
      id: 'seed-provider-001',
      name: 'Stub Provider (Dev)',
      code: 'STUB_PROVIDER',
      isActive: true,
      capabilities: { sms: true, whatsapp: false, voice: false },
      metadata: { endpoint: 'http://stub-provider:4000' },
    },
  });
  console.log('✅ Stub provider seeded');

  console.log('\n✅ Seed complete!');
  console.log('   Tenant ID :', tenant.id);
  console.log('   Login     : admin@demo.ingoga.com / Admin123!');
  console.log('   Tenant ID needed for POST /auth/login');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
