import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { CompetitorService } from '../services/competitor.service.js';
import { z } from 'zod';

const createTrackerSchema = z.object({
  platform: z.string().min(1),
  handle: z.string().min(1),
});

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  const competitorService = new CompetitorService();

  fastify.get('/competitors', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    return competitorService.listTrackers(userId);
  });

  fastify.post('/competitors', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const data = createTrackerSchema.parse(request.body);
      
      const tracker = await competitorService.createTracker(userId, data);
      return reply.status(201).send(tracker);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: error.issues });
      }
      throw error;
    }
  });

  fastify.delete('/competitors/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as any;
    
    await competitorService.deleteTracker(userId, id);
    return reply.status(204).send();
  });
}
