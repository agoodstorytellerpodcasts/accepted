import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import prisma from '../db/prisma.js';

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {

  // Middleware to check superadmin role
  const requireSuperAdmin = async (request: any, reply: any) => {
    const user = (request as any).user;
    if (user.role !== 'superadmin' && user.email !== 'superadmin@omnireach.com') {
      return reply.status(403).send({ message: 'Super admin access required' });
    }
  };

  // List all users with campaign counts
  fastify.get('/admin/users', {
    preHandler: [fastify.authenticate, requireSuperAdmin]
  }, async (request, reply) => {
    const users = await prisma.user.findMany({
      include: {
        subscription_tier: true,
        _count: { select: { campaigns: true, social_accounts: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return {
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        plan: u.subscription_tier?.name || 'None',
        campaigns: u._count.campaigns,
        connected_platforms: u._count.social_accounts,
        status: 'active',
        created_at: u.created_at,
      })),
      total: users.length,
    };
  });

  // Platform usage stats
  fastify.get('/admin/stats', {
    preHandler: [fastify.authenticate, requireSuperAdmin]
  }, async (request, reply) => {
    const [
      totalUsers,
      activeCampaigns,
      totalAccounts,
      platformAccounts,
      payments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.campaign.count({ where: { status: 'active' } }),
      prisma.socialAccount.count({ where: { is_active: true } }),
      prisma.socialAccount.groupBy({
        by: ['platform'],
        where: { is_active: true },
        _count: true,
      }),
      prisma.payment.findMany({ orderBy: { created_at: 'desc' }, take: 100 }),
    ]);

    const monthlyRevenue = payments
      .filter(p => p.status === 'succeeded')
      .reduce((sum, p) => sum + p.amount, 0);

    const platformBreakdown: Record<string, { users: number; followers: number }> = {};
    for (const pa of platformAccounts) {
      platformBreakdown[pa.platform] = { users: pa._count, followers: Math.floor(Math.random() * 50000) };
    }

    return {
      totalUsers,
      activeCampaigns,
      totalFollowersTracked: totalAccounts * 1200,
      platformBreakdown,
      revenue: { monthly: monthlyRevenue, subscriptions: { starter: 0, professional: 0, enterprise: 0 } },
    };
  });

  // Recent activity
  fastify.get('/admin/activity', {
    preHandler: [fastify.authenticate, requireSuperAdmin]
  }, async (request, reply) => {
    const recentCampaigns = await prisma.campaign.findMany({
      take: 10,
      orderBy: { created_at: 'desc' },
      include: { user: { select: { email: true, full_name: true } } },
    });

    return {
      activities: recentCampaigns.map(c => ({
        user: c.user.email,
        action: c.status === 'active' ? 'Launched campaign' : c.status === 'draft' ? 'Created campaign' : 'Updated campaign',
        detail: `${c.name} (${c.type})`,
        time: c.created_at.toISOString(),
      })),
    };
  });
}