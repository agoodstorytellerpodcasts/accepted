import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { AnalyticsService } from '../services/analytics.service.js';

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  const analyticsService = new AnalyticsService();

  fastify.get('/analytics/overview', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { start_date, end_date } = request.query as any;
    
    const cacheKey = `analytics:overview:${userId}:${start_date}:${end_date}`;
    if (fastify.redis) {
      const cached = await fastify.redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    const data = await analyticsService.getOverview(
      userId, 
      start_date ? new Date(start_date) : undefined,
      end_date ? new Date(end_date) : undefined
    );

    if (fastify.redis) {
      await fastify.redis.set(cacheKey, JSON.stringify(data), 'EX', 300); // 5 min cache
    }

    return data;
  });

  fastify.get('/analytics/campaign/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as any;
    const { start_date, end_date } = request.query as any;
    
    return analyticsService.getCampaignMetrics(
      userId, 
      id,
      start_date ? new Date(start_date) : undefined,
      end_date ? new Date(end_date) : undefined
    );
  });

  fastify.get('/analytics/platform/:platform', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { platform } = request.params as any;
    const { start_date, end_date } = request.query as any;

    return analyticsService.getPlatformMetrics(
      userId,
      platform,
      start_date ? new Date(start_date) : undefined,
      end_date ? new Date(end_date) : undefined
    );
  });

  fastify.get('/analytics/trends', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { start_date, end_date } = request.query as any;

    return analyticsService.getTrends(
      userId,
      start_date ? new Date(start_date) : undefined,
      end_date ? new Date(end_date) : undefined
    );
  });

  fastify.get('/analytics/export', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { type, id } = request.query as any;

    const csv = await analyticsService.exportCSV(userId, type, id);
    
    reply
      .header('Content-Type', 'text/csv')
      .header('Content-Disposition', `attachment; filename="analytics_${type}.csv"`)
      .send(csv);
  });
}
