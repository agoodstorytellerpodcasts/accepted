/**
 * Social Account Routes
 * Handles OAuth 2.0 connection flows, account management, and webhook endpoints
 * for all 5 social media platforms.
 */
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { SocialAccountService } from '../services/social-account.service.js';
import { OAuthService } from '../services/social/oauth.service.js';
import { WebhookService } from '../services/social/webhook.service.js';
import { isValidPlatform, getPlatformConfig } from '../services/social/platforms/config.js';
import type { PlatformName } from '../services/social/platforms/types.js';

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  const socialAccountService = new SocialAccountService();
  const oauthService = new OAuthService();
  const webhookService = new WebhookService();

  // ──────────────────────────────────────────────
  // Account listing & management
  // ──────────────────────────────────────────────

  fastify.get('/social-accounts', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const accounts = await socialAccountService.listAccounts(userId);
    return accounts;
  });

  fastify.get('/social-accounts/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as any;

    const account = await socialAccountService.getAccount(userId, id);
    if (!account) {
      return reply.status(404).send({ message: 'Social account not found' });
    }
    return {
      ...account,
      // Don't expose tokens
      access_token: undefined,
      refresh_token: undefined,
    };
  });

  fastify.delete('/social-accounts/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as any;

    await socialAccountService.deleteAccount(userId, id);
    return reply.status(204).send();
  });

  // ──────────────────────────────────────────────
  // OAuth 2.0 Connection Flow
  // ──────────────────────────────────────────────

  /**
   * GET /social-accounts/connect/:platform
   * Initiates the OAuth 2.0 connection flow for a platform.
   * Returns the authorization URL that the user should be redirected to.
   */
  fastify.get('/social-accounts/connect/:platform', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { platform } = request.params as { platform: string };

    if (!isValidPlatform(platform)) {
      return reply.status(400).send({
        error: 'INVALID_PLATFORM',
        message: `Unsupported platform: ${platform}`,
        supported: Object.keys(getPlatformConfig(platform) ? { [platform]: true } : {}),
      });
    }

    // Build the redirect URI (the callback endpoint)
    const redirectUri = `${request.protocol}://${request.hostname}/api/v1/social-accounts/callback/${platform}`;

    // Generate the OAuth authorization URL with CSRF state
    const { url, state, codeVerifier } = oauthService.generateAuthUrl(
      platform as PlatformName,
      userId,
      redirectUri
    );

    // Store state in session/cache for verification on callback
    // In production, use Redis with TTL
    if (fastify.redis) {
      await fastify.redis.setex(`oauth:state:${state}`, 600, JSON.stringify({
        userId,
        platform,
        codeVerifier,
        redirectUri,
      }));
    }

    return {
      platform,
      authorization_url: url,
      state,
    };
  });

  /**
   * GET /social-accounts/callback/:platform
   * Handles the OAuth callback from the platform.
   * Exchanges the authorization code for tokens and stores them.
   */
  fastify.get('/social-accounts/callback/:platform', {
    // No auth - this is called by the external OAuth provider
  }, async (request, reply) => {
    const { platform } = request.params as { platform: string };
    const { code, state, error } = request.query as any;

    if (error) {
      return reply.status(400).send({
        error: 'OAUTH_ERROR',
        message: `User denied access or error occurred: ${error}`,
      });
    }

    if (!isValidPlatform(platform)) {
      return reply.status(400).send({ error: 'INVALID_PLATFORM', message: `Unsupported platform: ${platform}` });
    }

    if (!code) {
      return reply.status(400).send({ error: 'MISSING_CODE', message: 'Authorization code is required' });
    }

    // Verify state (CSRF protection)
    // In production, look up from Redis
    let storedData: any = { userId: null, codeVerifier: null, redirectUri: null };
    if (fastify.redis) {
      const stored = await fastify.redis.get(`oauth:state:${state}`);
      if (stored) {
        storedData = JSON.parse(stored);
        await fastify.redis.del(`oauth:state:${state}`);
      }
    }

    if (!storedData.userId && !state) {
      return reply.status(400).send({ error: 'INVALID_STATE', message: 'Invalid OAuth state parameter' });
    }

    // For now, if no Redis, we use the redirect URI from the request
    const redirectUri = storedData.redirectUri ||
      `${request.protocol}://${request.hostname}/api/v1/social-accounts/callback/${platform}`;

    try {
      // Exchange the authorization code for tokens
      const tokenInfo = await oauthService.exchangeCodeForToken(
        platform as PlatformName,
        code,
        redirectUri,
        storedData.codeVerifier
      );

      // If we have the userId, store the tokens
      if (storedData.userId) {
        await socialAccountService.upsertAccount(storedData.userId, {
          platform: platform as any,
          platform_account_id: '', // Will be updated on first sync
          access_token: tokenInfo.accessToken,
          refresh_token: tokenInfo.refreshToken,
          token_expires_at: tokenInfo.expiresAt,
          token_type: tokenInfo.tokenType,
          token_scope: tokenInfo.scope,
        });

        // Redirect to the frontend success page
        return reply.redirect(`/social-accounts?connected=${platform}&success=true`);
      }

      // Return token info for client-side storage
      return {
        platform,
        connected: true,
        token_type: tokenInfo.tokenType,
        scope: tokenInfo.scope,
        expires_at: tokenInfo.expiresAt,
      };
    } catch (err: any) {
      fastify.log.error(`OAuth callback error for ${platform}:`, err);
      return reply.status(500).send({
        error: 'OAUTH_FAILED',
        message: err.message || 'Failed to complete OAuth flow',
      });
    }
  });

  /**
   * POST /social-accounts/refresh/:id
   * Manually refresh tokens for a connected account.
   */
  fastify.post('/social-accounts/refresh/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as any;

    try {
      const result = await socialAccountService.refreshAccountTokens(id);
      return {
        account_id: id,
        refreshed: true,
        platform: result.platform,
      };
    } catch (err: any) {
      return reply.status(500).send({
        error: 'REFRESH_FAILED',
        message: err.message,
      });
    }
  });

  /**
   * GET /social-accounts/:id/verify
   * Verifies if the social account connection is still valid.
   */
  fastify.get('/social-accounts/:id/verify', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { id } = request.params as any;

    const account = await socialAccountService.getAccount(userId, id);
    if (!account) {
      return reply.status(404).send({ message: 'Social account not found' });
    }

    const { SyncService } = await import('../services/social/sync.service.js');
    const syncService = new SyncService();

    const result = await syncService.syncAccount(userId, account.platform as PlatformName);
    
    return {
      id,
      platform: account.platform,
      valid: result.success,
      error: result.error,
    };
  });

  // ──────────────────────────────────────────────
  // Sync Endpoints
  // ──────────────────────────────────────────────

  /**
   * POST /social-accounts/sync/:platform
   * Trigger an immediate sync for a specific platform.
   */
  fastify.post('/social-accounts/sync/:platform', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { platform } = request.params as { platform: string };

    if (!isValidPlatform(platform)) {
      return reply.status(400).send({ error: 'INVALID_PLATFORM', message: `Unsupported platform: ${platform}` });
    }

    const { SyncService } = await import('../services/social/sync.service.js');
    const syncService = new SyncService();

    const result = await syncService.syncAccount(userId, platform as PlatformName);
    return result;
  });

  /**
   * POST /social-accounts/sync
   * Trigger sync for all connected platforms.
   */
  fastify.post('/social-accounts/sync', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;

    const { SyncService } = await import('../services/social/sync.service.js');
    const syncService = new SyncService();

    const results = await syncService.syncAllUserAccounts(userId);
    return results;
  });

  // ──────────────────────────────────────────────
  // Webhook Endpoints
  // ──────────────────────────────────────────────

  /**
   * GET /social-accounts/webhook/:platform
   * Webhook verification endpoint (required by platforms for subscription verification).
   * Facebook, Instagram, and YouTube use GET for challenge-response.
   */
  fastify.get('/social-accounts/webhook/:platform', async (request, reply) => {
    const { platform } = request.params as { platform: string };
    const query = request.query as Record<string, string>;

    const result = await webhookService.handleWebhookPayload(
      platform as PlatformName,
      null,
      query
    );

    if (result.status === 'verified') {
      return reply.type('text/plain').send(result.challenge);
    }

    return reply.status(400).send({ error: 'VERIFICATION_FAILED' });
  });

  /**
   * POST /social-accounts/webhook/:platform
   * Receive webhook events from platforms.
   */
  fastify.post('/social-accounts/webhook/:platform', async (request, reply) => {
    const { platform } = request.params as { platform: string };
    const signature = (request.headers['x-hub-signature-256'] ||
      request.headers['x-signature'] ||
      '') as string;

    // Process with best-effort (return 200 to acknowledge receipt)
    try {
      await webhookService.handleWebhookPayload(
        platform as PlatformName,
        request.body,
        {},
        signature
      );
    } catch (error: any) {
      fastify.log.error(`Webhook processing error for ${platform}: ${error.message}`);
    }

    return reply.status(200).send({ received: true });
  });
}