import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import redis from '@fastify/redis';
import rateLimit from '@fastify/rate-limit';
import autoload from '@fastify/autoload';
import rawBody from 'fastify-raw-body';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger: true
  });

  // Register plugins
  await app.register(cors, {
    origin: true,
    credentials: true,
  });
  await app.register(helmet);
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute'
  });
  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'supersecret'
  });

  await app.register(rawBody, {
    field: 'rawBody',
    global: false,
    encoding: 'utf8',
    runFirst: true
  });

  // Redis configuration
  if (process.env.REDIS_URL) {
    await app.register(redis, {
      url: process.env.REDIS_URL
    });
  }

  // Health check
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Autoload plugins, routes
  await app.register(autoload, {
    dir: path.join(__dirname, 'plugins')
  });

  await app.register(autoload, {
    dir: path.join(__dirname, 'routes'),
    options: { prefix: '/api/v1' }
  });

  // Error handling
  app.setErrorHandler((error: any, request, reply) => {
    app.log.error(error);
    reply.status(error.statusCode || 500).send({
      error: error.name,
      message: error.message,
      statusCode: error.statusCode || 500
    });
  });

  return app;
}
