import { FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../db/prisma.js';

export async function checkCampaignLimit(request: FastifyRequest, reply: FastifyReply) {
  const user = request.user as any;
  if (!user) return reply.status(401).send({ error: 'UNAUTHORIZED' });

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    include: { subscription_tier: true }
  });

  if (!userData || !userData.subscription_tier) {
    // Default to a free tier if not set? Or block?
    // Let's assume there's a default or we fetch a 'Free' tier.
    return; 
  }

  const campaignCount = await prisma.campaign.count({
    where: { user_id: user.id }
  });

  if (campaignCount >= userData.subscription_tier.max_campaigns) {
    return reply.status(403).send({
      error: 'LIMIT_EXCEEDED',
      message: `You have reached the maximum number of campaigns (${userData.subscription_tier.max_campaigns}) for your current tier: ${userData.subscription_tier.name}.`
    });
  }
}

export async function checkReachLimit(request: FastifyRequest, reply: FastifyReply) {
  const user = request.user as any;
  if (!user) return reply.status(401).send({ error: 'UNAUTHORIZED' });

  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    include: { subscription_tier: true }
  });

  if (!userData || !userData.subscription_tier) return;

  // Aggregate reach from daily_metrics or campaign events
  const totalReachResult = await prisma.dailyMetric.aggregate({
    where: {
      user_id: user.id,
      metric_name: 'reach'
    },
    _sum: {
      value: true
    }
  });

  const totalReach = Number(totalReachResult._sum.value || 0);

  if (totalReach >= userData.subscription_tier.max_reach) {
    return reply.status(403).send({
      error: 'LIMIT_EXCEEDED',
      message: `You have reached the maximum reach limit (${userData.subscription_tier.max_reach}) for your current tier: ${userData.subscription_tier.name}.`
    });
  }
}
