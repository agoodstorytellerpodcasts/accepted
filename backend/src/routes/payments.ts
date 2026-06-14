import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { PaymentService } from '../services/payment.service.js';
import { z } from 'zod';

const createCheckoutSchema = z.object({
  priceId: z.string().min(1),
});

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  const paymentService = new PaymentService();

  // List user's payments
  fastify.get('/payments', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    return paymentService.listPayments(userId);
  });

  // Create checkout session
  fastify.post('/payments/create-checkout', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const { priceId } = createCheckoutSchema.parse(request.body);
      
      const session = await paymentService.createCheckoutSession(userId, priceId);
      return { url: session.url };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: error.issues });
      }
      fastify.log.error(error);
      return reply.status(500).send({ error: 'STRIPE_ERROR', message: (error as any).message });
    }
  });

  // Create customer portal session
  fastify.post('/payments/customer-portal', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const session = await paymentService.createPortalSession(userId);
      return { url: session.url };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'PORTAL_ERROR', message: (error as any).message });
    }
  });

  // Stripe Webhook (unprotected, verified by Stripe signature)
  // Note: We need the raw body for Stripe signature verification
  fastify.post('/payments/webhook', {
    config: {
      rawBody: true
    }
  }, async (request, reply) => {
    const sig = request.headers['stripe-signature'] as string;
    
    if (!sig) {
      return reply.status(400).send('Missing stripe-signature');
    }

    try {
      // Fastify by default parses JSON. For Stripe we might need the raw body.
      // If we use a plugin like fastify-raw-body, we can access request.rawBody
      const payload = (request as any).rawBody || JSON.stringify(request.body);
      
      const result = await paymentService.handleWebhook(sig, payload);
      return result;
    } catch (error) {
      fastify.log.error(error);
      return reply.status(400).send(`Webhook Error: ${(error as any).message}`);
    }
  });
}
