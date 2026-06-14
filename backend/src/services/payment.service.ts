import prisma from '../db/prisma.js';
import { stripe, FRONTEND_URL } from '../config/stripe.js';
import { Stripe } from 'stripe';

export class PaymentService {
  async listPayments(userId: string) {
    return prisma.payment.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
  }

  async createCheckoutSession(userId: string, priceId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription_tier: true }
    });

    if (!user) throw new Error('User not found');

    let customerId = user.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: { userId: user.id }
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: userId },
        data: { stripe_customer_id: customerId }
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/billing`,
      metadata: { userId: user.id }
    });

    return session;
  }

  async createPortalSession(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.stripe_customer_id) {
      throw new Error('Stripe customer not found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${FRONTEND_URL}/billing`,
    });

    return session;
  }

  async handleWebhook(sig: string, payload: string | Buffer) {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        payload,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
      );
    } catch (err: any) {
      throw new Error(`Webhook Error: ${err.message}`);
    }

    console.log(`Handling Stripe event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutCompleted(session);
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await this.handleInvoicePaid(invoice);
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionUpdated(subscription);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const stripeSubscriptionId = session.subscription as string;

    if (userId && stripeSubscriptionId) {
      await prisma.user.update({
        where: { id: userId },
        data: { stripe_subscription_id: stripeSubscriptionId }
      });

      // Record payment
      await prisma.payment.create({
        data: {
          user_id: userId,
          stripe_session_id: session.id,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency || 'usd',
          status: 'succeeded'
        }
      });
    }
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice) {
    const stripeCustomerId = invoice.customer as string;
    const amount = invoice.amount_paid / 100;
    const currency = invoice.currency;

    const user = await prisma.user.findFirst({
      where: { stripe_customer_id: stripeCustomerId }
    });

    if (user) {
      await prisma.payment.create({
        data: {
          user_id: user.id,
          stripe_session_id: invoice.id || `inv_${Date.now()}`,
          amount,
          currency,
          status: 'succeeded'
        }
      });
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const stripeCustomerId = subscription.customer as string;
    const priceId = subscription.items.data[0]?.price.id;

    const user = await prisma.user.findFirst({
      where: { stripe_customer_id: stripeCustomerId }
    });

    if (user && priceId) {
      const tier = await prisma.subscriptionTier.findUnique({
        where: { stripe_price_id: priceId }
      });

      if (tier) {
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            subscription_tier_id: tier.id,
            stripe_subscription_id: subscription.id
          }
        });
      }
    }
  }
}
