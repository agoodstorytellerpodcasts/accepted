import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ScheduledContentService } from '../services/scheduled-content.service.js';
import { z } from 'zod';

const createScheduledSchema = z.object({
  platform: z.string().min(1),
  content_json: z.any(),
  scheduled_at: z.string().datetime(),
});

const updateScheduledSchema = z.object({
  platform: z.string().optional(),
  content_json: z.any().optional(),
  scheduled_at: z.string().datetime().optional(),
  status: z.enum(['pending', 'published', 'failed']).optional(),
});

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  const scheduledService = new ScheduledContentService();

  fastify.get('/scheduled-content', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { platform, status } = request.query as any;
    
    return scheduledService.listScheduled(userId, { platform, status });
  });

  fastify.post('/scheduled-content', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const data = createScheduledSchema.parse(request.body);
      
      const scheduled = await scheduledService.createScheduled(userId, {
        ...data,
        scheduled_at: new Date(data.scheduled_at)
      });
      return reply.status(201).send(scheduled);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: (error as any).errors });
      }
      throw error;
    }
  });

  fastify.get('/scheduled-content/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as any;
    
    const scheduled = await scheduledService.getScheduled(userId, id);
    if (!scheduled) {
      return reply.status(404).send({ message: 'Scheduled content not found' });
    }
    return scheduled;
  });

  fastify.patch('/scheduled-content/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const { id } = request.params as any;
      const data = updateScheduledSchema.parse(request.body);
      
      const scheduled = await scheduledService.updateScheduled(userId, id, {
        ...data,
        ...(data.scheduled_at && { scheduled_at: new Date(data.scheduled_at) })
      });
      return scheduled;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: (error as any).errors });
      }
      throw error;
    }
  });

  fastify.delete('/scheduled-content/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as any;
    
    await scheduledService.deleteScheduled(userId, id);
    return reply.status(204).send();
  });
}
