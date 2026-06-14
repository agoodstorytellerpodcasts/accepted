import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.get('/', async () => {
    return { message: 'OmniReach API (Prisma)' };
  });
}
