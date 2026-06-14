import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { AuthService } from '../services/auth.service.js';

const DEV_TOKEN = 'mock-access-token-for-dev';
const SUPERADMIN_TOKEN = 'mock-superadmin-token';

export default fp(async (fastify: FastifyInstance) => {
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Dev mode: accept mock tokens without JWT verification
      const authHeader = request.headers.authorization;
      if (authHeader === `Bearer ${DEV_TOKEN}`) {
        (request as any).user = { id: 'mock-admin-id', email: 'admin@omnireach.com', role: 'admin' };
        return;
      }
      if (authHeader === `Bearer ${SUPERADMIN_TOKEN}`) {
        (request as any).user = { id: 'mock-superadmin-id', email: 'superadmin@omnireach.com', role: 'superadmin' };
        return;
      }

      await request.jwtVerify();
      
      const token = request.headers.authorization?.split(' ')[1];
      if (token) {
        const authService = new AuthService(fastify);
        const isBlacklisted = await authService.isTokenBlacklisted(token);
        if (isBlacklisted) {
          return reply.status(401).send({ message: 'Token is invalidated' });
        }
      }
    } catch (err) {
      reply.send(err);
    }
  });
});

declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: any;
  }
}
