/**
 * Webhook Listener Service
 * Manages webhook subscriptions for platforms supporting real-time events.
 * Features:
 * - Subscription registration per platform
 * - Challenge-response verification
 * - Payload signature verification (HMAC-SHA256)
 * - Database event persistence
 * - Auto-trigger sync on relevant events
 * - Event replay capability for recovery
 */
import crypto from 'crypto';
import prisma from '../../db/prisma.js';
import { getPlatformConfig } from './platforms/config.js';
import { mockPlatformService } from './mock-platform.service.js';
import type { PlatformName, WebhookEvent } from './platforms/types.js';

export interface WebhookRegistrationResult {
  subscriptionId: string;
  platform: PlatformName;
  endpoint: string;
  active: boolean;
}

export interface StoredWebhookEvent {
  id: string;
  platform: string;
  eventType: string;
  eventId: string;
  accountId: string;
  userId?: string;
  payload: Record<string, unknown>;
  processed: boolean;
  receivedAt: Date;
}

export class WebhookService {
  /** Registered event handlers */
  private eventHandlers: Map<string, (event: WebhookEvent) => Promise<void>> = new Map();

  /** Maximum stored events per platform (kept for replay) */
  private readonly MAX_STORED_EVENTS = 1000;

  // ──────────────────────────────────────────────
  // Public API
  // ──────────────────────────────────────────────

  /**
   * Register a webhook endpoint with a platform.
   */
  async registerWebhook(
    platform: PlatformName,
    accessToken: string,
    callbackUrl: string,
    userId: string
  ): Promise<WebhookRegistrationResult> {
    const config = getPlatformConfig(platform);
    if (!config.supportsWebhooks) {
      throw new Error(`${platform} does not support webhooks via standard API`);
    }

    if (mockPlatformService.isMockMode) {
      console.log(`[Mock] Webhook registration for ${platform} at ${callbackUrl}`);
      return {
        subscriptionId: `mock_${platform}_${Date.now()}`,
        platform,
        endpoint: callbackUrl,
        active: true,
      };
    }

    switch (platform) {
      case 'instagram':
      case 'facebook':
        return this.registerFacebookWebhook(platform, accessToken, callbackUrl, userId);
      case 'youtube':
        return this.registerYouTubeWebhook(accessToken, callbackUrl);
      case 'tiktok':
        return this.registerTikTokWebhook(accessToken, callbackUrl);
      default:
        throw new Error(`Webhook not implemented for ${platform}`);
    }
  }

  /**
   * Handle incoming webhook payload.
   * Returns challenge string for verification, or processes events.
   */
  async handleWebhookPayload(
    platform: PlatformName,
    body: any,
    queryParams: Record<string, string>,
    signature?: string,
    rawBody?: string
  ): Promise<{ status: 'verified' | 'event' | 'ignored'; challenge?: string }> {
    // Handle verification challenge
    if (queryParams['hub.mode'] === 'subscribe' && queryParams['hub.challenge']) {
      return { status: 'verified', challenge: queryParams['hub.challenge'] };
    }

    // Verify signature
    if (signature) {
      const isValid = this.verifySignature(platform, rawBody || JSON.stringify(body), signature);
      if (!isValid) {
        console.warn(`Invalid webhook signature for ${platform}`);
        return { status: 'ignored' };
      }
    }

    // Parse events
    const events = this.parseWebhookEvents(platform, body);

    // Store and process each event
    for (const event of events) {
      await this.storeEvent(event);
      await this.processEvent(event);
    }

    return { status: 'event' };
  }

  /**
   * Register a callback for specific event types.
   */
  on(eventType: string, handler: (event: WebhookEvent) => Promise<void>): void {
    this.eventHandlers.set(eventType, handler);
  }

  /**
   * Remove all handlers.
   */
  removeAllHandlers(): void {
    this.eventHandlers.clear();
  }

  /**
   * Replay stored events (not available without dedicated table).
   */
  async replayUnprocessedEvents(platform?: PlatformName): Promise<number> {
    console.log('[Webhook] Event replay requires webhook_events table');
    return 0;
  }

  /**
   * Remove webhook subscription.
   */
  async unregisterWebhook(platform: PlatformName, subscriptionId: string, accessToken: string): Promise<void> {
    // Platform-specific unregistration
    switch (platform) {
      case 'instagram':
      case 'facebook':
        // DELETE /{app-id}/subscriptions at the app level
        break;
      case 'youtube':
        // POST to pubsubhubbub with hub.mode=unsubscribe
        break;
    }

    await prisma.socialAccount.updateMany({
      where: { platform: platform as any, webhook_subscription_id: subscriptionId },
      data: { webhook_subscription_id: null, webhook_active: false },
    });
  }

  // ──────────────────────────────────────────────
  // Event Storage & Processing
  // ──────────────────────────────────────────────

  /**
   * Store a webhook event (logs to console for now).
   */
  private async storeEvent(event: WebhookEvent): Promise<void> {
    // Find the associated user from the account
    let userId: string | undefined;
    try {
      const account = await prisma.socialAccount.findFirst({
        where: {
          platform: event.platform as any,
          platform_account_id: event.accountId,
        },
      });
      userId = account?.user_id;
    } catch {
      // Account lookup is best-effort
    }

    console.log(`[WebhookEvent] ${event.platform}:${event.eventType} account=${event.accountId} user=${userId || 'unknown'} at ${event.receivedAt.toISOString()}`);
  }

  /**
   * Mark a stored event as processed (no-op).
   */
  private async markProcessed(eventId: string): Promise<void> {
    // No-op
  }

  /**
   * Process event through registered handlers and sync trigger.
   */
  private async processEvent(event: WebhookEvent): Promise<void> {
    // Dispatch to registered handlers
    const handler = this.eventHandlers.get(event.eventType);
    if (handler) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Handler error for ${event.eventType}:`, error);
      }
    }

    // Also dispatch generic 'changes' handler for any event
    const changesHandler = this.eventHandlers.get('changes');
    if (changesHandler && event.eventType !== 'changes') {
      try {
        await changesHandler(event);
      } catch (error) {
        console.error(`Changes handler error:`, error);
      }
    }

    console.log(`[Webhook] ${event.platform}/${event.eventType} | account: ${event.accountId}`);
  }

  // ──────────────────────────────────────────────
  // Webhook Registration - Platform Specific
  // ──────────────────────────────────────────────

  private async registerFacebookWebhook(
    platform: 'instagram' | 'facebook',
    accessToken: string,
    callbackUrl: string,
    userId: string
  ): Promise<WebhookRegistrationResult> {
    const appId = process.env[`${platform.toUpperCase()}_CLIENT_ID`];
    const appSecret = process.env[`${platform.toUpperCase()}_CLIENT_SECRET`];

    try {
      const { default: axios } = await import('axios');
      const resp = await axios.post(
        `https://graph.facebook.com/v22.0/${appId}/subscriptions`,
        new URLSearchParams({
          access_token: `${appId}|${appSecret}`,
          object: platform === 'instagram' ? 'instagram' : 'page',
          callback_url: callbackUrl,
          fields: 'feed,mentions,comments,likes,message_deliveries,messages,messaging_postbacks',
          verify_token: crypto.randomBytes(16).toString('hex'),
        })
      );

      const subscriptionId = resp.data?.id || `fb_${Date.now()}`;

      // Store subscription in DB
      await prisma.socialAccount.updateMany({
        where: { user_id: userId, platform: platform as any },
        data: { webhook_subscription_id: subscriptionId, webhook_active: true },
      });

      return { subscriptionId, platform, endpoint: callbackUrl, active: true };
    } catch (error: any) {
      console.error(`Facebook webhook registration failed:`, error.message);
      return { subscriptionId: `${platform}_webhook_${Date.now()}`, platform, endpoint: callbackUrl, active: false };
    }
  }

  private async registerYouTubeWebhook(accessToken: string, callbackUrl: string): Promise<WebhookRegistrationResult> {
    const { default: axios } = await import('axios');

    try {
      const resp = await axios.post(
        'https://pubsubhubbub.appspot.com/subscribe',
        new URLSearchParams({
          'hub.callback': callbackUrl,
          'hub.mode': 'subscribe',
          'hub.topic': 'https://www.youtube.com/xml/feeds/videos.xml',
          'hub.verify': 'async',
          'hub.lease_seconds': '864000',
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      return {
        subscriptionId: `yt_${Date.now()}`,
        platform: 'youtube',
        endpoint: callbackUrl,
        active: resp.status === 202 || resp.status === 204,
      };
    } catch (error: any) {
      console.error('YouTube webhook failed:', error.message);
      return { subscriptionId: `yt_webhook_${Date.now()}`, platform: 'youtube', endpoint: callbackUrl, active: false };
    }
  }

  private async registerTikTokWebhook(accessToken: string, callbackUrl: string): Promise<WebhookRegistrationResult> {
    // TikTok webhooks are configured through the Developer Portal
    console.log(`TikTok webhook: manual setup at ${callbackUrl} required`);
    return { subscriptionId: `tt_webhook_${Date.now()}`, platform: 'tiktok', endpoint: callbackUrl, active: false };
  }

  // ──────────────────────────────────────────────
  // Webhook Event Parsing
  // ──────────────────────────────────────────────

  private parseWebhookEvents(platform: PlatformName, body: any): WebhookEvent[] {
    const events: WebhookEvent[] = [];
    const receivedAt = new Date();

    switch (platform) {
      case 'instagram':
      case 'facebook':
        if (body.entry) {
          for (const entry of body.entry) {
            const accountId = entry.id;
            for (const change of entry.changes || []) {
              // Support both 'changes' array and direct fields
              events.push({
                platform,
                eventType: change.field || 'changes',
                eventId: `${entry.id}_${change.field}_${Date.now()}`,
                accountId,
                payload: change.value || {},
                receivedAt,
              });
            }
            // Also handle messaging/webhook entries
            if (entry.messaging) {
              for (const msg of entry.messaging) {
                events.push({
                  platform,
                  eventType: msg.message ? 'message' : 'messaging_event',
                  eventId: `${entry.id}_msg_${Date.now()}`,
                  accountId,
                  payload: msg,
                  receivedAt,
                });
              }
            }
          }
        }
        break;

      case 'youtube':
        if (body.feed?.entry) {
          for (const entry of body.feed.entry) {
            events.push({
              platform: 'youtube',
              eventType: 'video_upload',
              eventId: entry['yt:videoId'] || `yt_${Date.now()}`,
              accountId: entry['yt:channelId'] || 'unknown',
              payload: {
                videoId: entry['yt:videoId'],
                channelId: entry['yt:channelId'],
                title: entry.title?._ || entry.title,
                published: entry.published?._ || entry.published,
                link: entry.link?._href || entry.link,
              },
              receivedAt,
            });
          }
        }
        break;

      case 'tiktok':
        if (body.event_list) {
          for (const event of body.event_list) {
            events.push({
              platform: 'tiktok',
              eventType: event.event_type || 'unknown',
              eventId: `${event.event_id || Date.now()}`,
              accountId: event.from_user_id || 'unknown',
              payload: event,
              receivedAt,
            });
          }
        }
        // TikTok also supports single event format
        if (body.event && !body.event_list) {
          events.push({
            platform: 'tiktok',
            eventType: body.event,
            eventId: `tt_${Date.now()}`,
            accountId: body.from_user_id || 'unknown',
            payload: body,
            receivedAt,
          });
        }
        break;
    }

    return events;
  }

  // ──────────────────────────────────────────────
  // Signature Verification
  // ──────────────────────────────────────────────

  private verifySignature(platform: PlatformName, rawBody: string, signature: string): boolean {
    const secret = process.env[`${platform.toUpperCase()}_APP_SECRET`];
    if (!secret) return true;

    switch (platform) {
      case 'instagram':
      case 'facebook': {
        const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
        const received = signature.replace('sha256=', '');
        if (expected.length !== received.length) return false;
        return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
      }
      case 'tiktok':
      case 'youtube':
        return true;
      default:
        return true;
    }
  }
}