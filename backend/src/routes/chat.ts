import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ChatService } from '../services/chat.service.js';
import { z } from 'zod';

const createSessionSchema = z.object({
  title: z.string().optional(),
});

const addMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  tool_calls_json: z.any().optional(),
});

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  const chatService = new ChatService();

  fastify.get('/chat/sessions', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    return chatService.listSessions(userId);
  });

  fastify.get('/chat/sessions/:id/messages', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as any;
    
    const messages = await chatService.getSessionMessages(userId, id);
    if (!messages) {
      return reply.status(404).send({ message: 'Session not found' });
    }
    return messages;
  });

  fastify.post('/chat/sessions', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const { title } = createSessionSchema.parse(request.body);
      
      const session = await chatService.createSession(userId, title);
      return reply.status(201).send(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: error.issues });
      }
      throw error;
    }
  });

  fastify.post('/chat/sessions/:id/messages', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const { id: sessionId } = request.params as any;
      const data = addMessageSchema.parse(request.body);

      // Verify session ownership
      const messages = await chatService.getSessionMessages(userId, sessionId);
      if (!messages) {
        return reply.status(404).send({ message: 'Session not found' });
      }

      const message = await chatService.addMessage(sessionId, data);
      return reply.status(201).send(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: error.issues });
      }
      throw error;
    }
  });

  fastify.delete('/chat/sessions/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as any;
    
    await chatService.deleteSession(userId, id);
    return reply.status(204).send();
  });
}
