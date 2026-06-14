import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { CampaignService } from '../services/campaign.service.js';
import { z } from 'zod';
import { checkCampaignLimit } from '../middleware/tier-enforcement.js';

const createCampaignSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['follower_boost', 'engagement', 'search_visibility']),
  budget: z.number().nonnegative(),
  target_parameters: z.any().optional(),
});

const updateCampaignSchema = z.object({
  name: z.string().optional(),
  status: z.enum(['draft', 'active', 'paused', 'completed']).optional(),
  budget: z.number().nonnegative().optional(),
  target_parameters: z.any().optional(),
});

const createVariantSchema = z.object({
  name: z.string().min(1),
  target_parameters_json: z.any().optional(),
  content_metadata_json: z.any().optional(),
  is_baseline: z.boolean().optional(),
});

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  const campaignService = new CampaignService();

  fastify.get('/campaigns', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { status, type, platform, page = '1', limit = '10' } = request.query as any;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const [campaigns, total] = await Promise.all([
      campaignService.listCampaigns(userId, { status, type, platform }, { skip, take }),
      campaignService.countCampaigns(userId, { status, type })
    ]);

    return {
      campaigns,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / take)
      }
    };
  });

  fastify.post('/campaigns', {
    preHandler: [fastify.authenticate, checkCampaignLimit]
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const data = createCampaignSchema.parse(request.body);
      
      const campaign = await campaignService.createCampaign(userId, data);
      return reply.status(201).send(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: (error as any).errors });
      }
      throw error;
    }
  });

  fastify.get('/campaigns/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as any;
    
    const campaign = await campaignService.getCampaign(userId, id);
    if (!campaign) {
      return reply.status(404).send({ message: 'Campaign not found' });
    }
    return campaign;
  });

  fastify.patch('/campaigns/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const { id } = request.params as any;
      const data = updateCampaignSchema.parse(request.body);
      
      const campaign = await campaignService.updateCampaign(userId, id, data);
      return campaign;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: (error as any).errors });
      }
      throw error;
    }
  });

  fastify.delete('/campaigns/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as any;
    
    await campaignService.deleteCampaign(userId, id);
    return reply.status(204).send();
  });

  // Variant support
  fastify.post('/campaigns/:id/variants', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const { id: campaignId } = request.params as any;
      const data = createVariantSchema.parse(request.body);

      // Verify campaign ownership
      const campaign = await campaignService.getCampaign(userId, campaignId);
      if (!campaign) {
        return reply.status(404).send({ message: 'Campaign not found' });
      }

      const variant = await campaignService.createVariant(campaignId, data);
      return reply.status(201).send(variant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: (error as any).errors });
      }
      throw error;
    }
  });
}
