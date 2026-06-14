import Fastify from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import { handleConnection } from './websocket/server.js';
import dotenv from 'dotenv';

dotenv.config();

const fastify = Fastify({
  logger: true
});

await fastify.register(fastifyWebsocket);

fastify.register(async function (fastify) {
  fastify.get('/ws/chat', { websocket: true }, (connection: any, req: any) => {
    handleConnection(connection, req);
  });
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Chat service listening on http://0.0.0.0:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
