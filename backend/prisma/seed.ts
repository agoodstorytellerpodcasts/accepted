import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding OmniReach database...');

  // Create subscription tiers
  const starterTier = await prisma.subscriptionTier.upsert({
    where: { id: 'tier-starter' },
    update: {},
    create: {
      id: 'tier-starter',
      name: 'Starter',
      monthly_price: 29,
      max_campaigns: 3,
      max_reach: 10000,
      stripe_price_id: 'price_starter',
    },
  });

  const proTier = await prisma.subscriptionTier.upsert({
    where: { id: 'tier-pro' },
    update: {},
    create: {
      id: 'tier-pro',
      name: 'Professional',
      monthly_price: 99,
      max_campaigns: 10,
      max_reach: 100000,
      stripe_price_id: 'price_pro',
    },
  });

  const enterpriseTier = await prisma.subscriptionTier.upsert({
    where: { id: 'tier-enterprise' },
    update: {},
    create: {
      id: 'tier-enterprise',
      name: 'Enterprise',
      monthly_price: 299,
      max_campaigns: 100,
      max_reach: 1000000,
      stripe_price_id: 'price_enterprise',
    },
  });

  console.log('✓ Subscription tiers created');

  // Create admin users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const superAdminPassword = await bcrypt.hash('superadmin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@omnireach.com' },
    update: {},
    create: {
      id: 'user-admin-001',
      email: 'admin@omnireach.com',
      password_hash: adminPassword,
      full_name: 'Admin User',
      subscription_tier_id: enterpriseTier.id,
    },
  });

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@omnireach.com' },
    update: {},
    create: {
      id: 'user-superadmin-001',
      email: 'superadmin@omnireach.com',
      password_hash: superAdminPassword,
      full_name: 'Super Admin',
      subscription_tier_id: enterpriseTier.id,
    },
  });

  // Create employee/team users
  const employeePassword = await bcrypt.hash('employee123', 10);

  const employees = [
    { email: 'alice@omnireach.io', name: 'Alice Johnson', plan: proTier.id },
    { email: 'bob@omnireach.io', name: 'Bob Smith', plan: proTier.id },
    { email: 'carol@omnireach.io', name: 'Carol Williams', plan: enterpriseTier.id },
    { email: 'dave@omnireach.io', name: 'Dave Brown', plan: starterTier.id },
    { email: 'emma@omnireach.io', name: 'Emma Davis', plan: proTier.id },
  ];

  for (const emp of employees) {
    await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        id: `user-${randomUUID().slice(0, 8)}`,
        email: emp.email,
        password_hash: employeePassword,
        full_name: emp.name,
        subscription_tier_id: emp.plan,
      },
    });
  }

  console.log('✓ Users created (admin + superadmin + 5 employees)');

  // Create some sample campaigns for each user
  const allUsers = await prisma.user.findMany();
  const campaignTypes = ['follower_boost', 'engagement', 'search_visibility'];
  const platforms = ['instagram', 'tiktok', 'youtube', 'x', 'facebook'];

  for (const user of allUsers) {
    const numCampaigns = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numCampaigns; i++) {
      const type = campaignTypes[Math.floor(Math.random() * campaignTypes.length)];
      const statuses = ['draft', 'active', 'active', 'paused', 'completed'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      await prisma.campaign.create({
        data: {
          user_id: user.id,
          name: `${user.full_name.split(' ')[0]}'s ${type.replace('_', ' ')} campaign`,
          type,
          status,
          budget: Math.floor(Math.random() * 5000) + 500,
        },
      });
    }
  }

  console.log('✓ Sample campaigns created');

  // Create social accounts for each user
  for (const user of allUsers) {
    const numAccounts = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...platforms].sort(() => 0.5 - Math.random());
    for (let i = 0; i < numAccounts; i++) {
      const platform = shuffled[i];
      await prisma.socialAccount.upsert({
        where: { user_id_platform: { user_id: user.id, platform } },
        update: {},
        create: {
          user_id: user.id,
          platform,
          platform_account_id: `${platform}_${user.id.slice(0, 6)}`,
          platform_username: `${user.full_name.split(' ')[0].toLowerCase()}_${platform}`,
          access_token: 'mock_token_for_dev',
          token_type: 'Bearer',
          is_active: true,
        },
      });
    }
  }

  console.log('✓ Sample social accounts created');

  console.log('\n✅ Database seeded successfully!');
  console.log('\nLogin credentials:');
  console.log('  Admin:      admin@omnireach.com / admin123');
  console.log('  Super Admin: superadmin@omnireach.com / superadmin123');
  console.log('  Employees:   alice@omnireach.io, bob@omnireach.io, carol@omnireach.io, dave@omnireach.io, emma@omnireach.io');
  console.log('  Password:    employee123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
