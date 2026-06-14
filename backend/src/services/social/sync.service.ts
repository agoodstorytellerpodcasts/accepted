/**
 * Platform Data Synchronization Service
 * Fetches and updates engagement metrics from all connected platforms.
 * Supports:
 * - On-demand sync per platform
 * - Batch sync all platforms for a user
 * - Batch sync all active accounts (scheduled)
 * - Webhook-triggered sync
 * - Daily metric snapshot recording
 * - Follower history tracking
 * - Mock mode for development
 */
import prisma from '../../db/prisma.js';
import { TokenManagerService } from './token-manager.service.js';
import { RateLimiterService } from './rate-limiter.service.js';
import { mockPlatformService } from './mock-platform.service.js';
import { withRetry } from './error-handler.js';
import type { PlatformName, PlatformMetrics, SyncResult, PlatformProfile } from './platforms/types.js';

export class SyncService {
  private tokenManager: TokenManagerService;
  private rateLimiter: RateLimiterService;

  constructor() {
    this.tokenManager = new TokenManagerService();
    this.rateLimiter = new RateLimiterService();
  }

  /**
   * Sync a specific platform account.
   * Uses mock mode if API keys aren't configured.
   */
  async syncAccount(userId: string, platform: PlatformName): Promise<SyncResult> {
    try {
      if (mockPlatformService.isMockMode) {
        return this.mockSync(userId, platform);
      }

      // Check rate limit
      await this.rateLimiter.checkRateLimit(platform, userId);

      // Get valid access token
      const accessToken = await this.tokenManager.getValidAccessToken(userId, platform);

      // Fetch metrics and profile from platform API
      const metrics = await this.fetchPlatformMetrics(platform, accessToken, userId);
      const profile = await this.fetchPlatformProfile(platform, accessToken, userId);

      // Update local storage
      await this.updateLocalData(userId, platform, profile.platformAccountId, metrics, profile.rawMetadata);

      // Update last synced timestamp
      await prisma.socialAccount.update({
        where: {
          user_id_platform: {
            user_id: userId,
            platform: platform as any,
          },
        },
        data: {
          last_synced_at: new Date(),
          profile_metadata_json: profile.rawMetadata as any,
          platform_username: profile.username,
        },
      });

      // Record daily metrics
      await this.recordDailyMetrics(userId, platform, metrics);

      // Consume rate limit
      this.rateLimiter.consume(platform, userId);

      return {
        platform,
        accountId: profile.platformAccountId,
        metrics,
        fetchedAt: new Date(),
        success: true,
      };
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown sync error';
      console.error(`Sync failed for ${platform} user ${userId}: ${errorMessage}`);
      return {
        platform,
        accountId: userId,
        metrics: {} as PlatformMetrics,
        fetchedAt: new Date(),
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Sync all connected platforms for a user.
   */
  async syncAllUserAccounts(userId: string): Promise<SyncResult[]> {
    const accounts = await prisma.socialAccount.findMany({
      where: { user_id: userId, is_active: true },
    });

    const results: SyncResult[] = [];
    for (const account of accounts) {
      const result = await this.syncAccount(userId, account.platform as PlatformName);
      results.push(result);
    }
    return results;
  }

  /**
   * Batch sync all active accounts across all users.
   */
  async syncAllActiveAccounts(): Promise<{ total: number; succeeded: number; failed: number }> {
    const accounts = await prisma.socialAccount.findMany({
      where: { is_active: true },
    });

    let succeeded = 0;
    let failed = 0;

    for (const account of accounts) {
      const result = await this.syncAccount(account.user_id, account.platform as PlatformName);
      if (result.success) succeeded++;
      else failed++;
    }

    return { total: accounts.length, succeeded, failed };
  }

  /**
   * Webhook-triggered sync: faster sync that only fetches current metrics
   * without full profile fetch, triggered by real-time events.
   */
  async webhookTriggeredSync(userId: string, platform: PlatformName): Promise<SyncResult> {
    try {
      if (mockPlatformService.isMockMode) {
        return this.mockSync(userId, platform);
      }

      const accessToken = await this.tokenManager.getValidAccessToken(userId, platform);
      const metrics = await this.fetchPlatformMetrics(platform, accessToken, userId);

      await this.recordDailyMetrics(userId, platform, metrics);
      await prisma.socialAccount.update({
        where: {
          user_id_platform: {
            user_id: userId,
            platform: platform as any,
          },
        },
        data: { last_synced_at: new Date() },
      });

      return {
        platform,
        accountId: userId,
        metrics,
        fetchedAt: new Date(),
        success: true,
      };
    } catch (error: any) {
      return {
        platform,
        accountId: userId,
        metrics: {} as PlatformMetrics,
        fetchedAt: new Date(),
        success: false,
        error: error.message,
      };
    }
  }

  // ──────────────────────────────────────────────
  // Platform metric fetching
  // ──────────────────────────────────────────────

  private async fetchPlatformMetrics(
    platform: PlatformName,
    accessToken: string,
    userId: string
  ): Promise<PlatformMetrics> {
    const fetcher = async () => {
      switch (platform) {
        case 'instagram': {
          const { InstagramHandler } = await import('./platforms/instagram.js');
          const account = await prisma.socialAccount.findUnique({
            where: { user_id_platform: { user_id: userId, platform: 'instagram' as any } },
          });
          const igId = account?.platform_account_id;
          if (!igId) throw new Error('Instagram account ID not found');
          return new InstagramHandler().fetchMetrics(accessToken, igId);
        }
        case 'tiktok': {
          const { TikTokHandler } = await import('./platforms/tiktok.js');
          return new TikTokHandler().fetchMetrics(accessToken);
        }
        case 'youtube': {
          const { YouTubeHandler } = await import('./platforms/youtube.js');
          return new YouTubeHandler().fetchMetrics(accessToken);
        }
        case 'x': {
          const { XHandler } = await import('./platforms/x.js');
          return new XHandler().fetchMetrics(accessToken);
        }
        case 'facebook': {
          const { FacebookHandler } = await import('./platforms/facebook.js');
          return new FacebookHandler().fetchMetrics(accessToken);
        }
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    };

    return withRetry(fetcher, platform);
  }

  private async fetchPlatformProfile(
    platform: PlatformName,
    accessToken: string,
    userId: string
  ): Promise<PlatformProfile> {
    const fetcher = async () => {
      switch (platform) {
        case 'instagram': {
          const { InstagramHandler } = await import('./platforms/instagram.js');
          const account = await prisma.socialAccount.findUnique({
            where: { user_id_platform: { user_id: userId, platform: 'instagram' as any } },
          });
          return new InstagramHandler().fetchProfile(accessToken, account?.platform_account_id);
        }
        case 'tiktok': {
          const { TikTokHandler } = await import('./platforms/tiktok.js');
          return new TikTokHandler().fetchProfile(accessToken);
        }
        case 'youtube': {
          const { YouTubeHandler } = await import('./platforms/youtube.js');
          return new YouTubeHandler().fetchProfile(accessToken);
        }
        case 'x': {
          const { XHandler } = await import('./platforms/x.js');
          return new XHandler().fetchProfile(accessToken);
        }
        case 'facebook': {
          const { FacebookHandler } = await import('./platforms/facebook.js');
          return new FacebookHandler().fetchProfile(accessToken);
        }
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    };

    return withRetry(fetcher, platform);
  }

  // ──────────────────────────────────────────────
  // Database storage
  // ──────────────────────────────────────────────

  private async updateLocalData(
    userId: string,
    platform: PlatformName,
    platformAccountId: string,
    metrics: PlatformMetrics,
    rawMetadata: Record<string, unknown>
  ): Promise<void> {
    await prisma.socialAccount.update({
      where: {
        user_id_platform: {
          user_id: userId,
          platform: platform as any,
        },
      },
      data: {
        platform_account_id: platformAccountId,
        profile_metadata_json: rawMetadata as any,
      },
    });
  }

  async recordDailyMetrics(
    userId: string,
    platform: PlatformName,
    metrics: PlatformMetrics
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const metricEntries = [
      { name: 'follower_count', value: metrics.followerCount },
      { name: 'following_count', value: metrics.followingCount },
      { name: 'post_count', value: metrics.postCount },
      { name: 'like_count', value: metrics.likeCount || 0 },
      { name: 'comment_count', value: metrics.commentCount || 0 },
      { name: 'view_count', value: metrics.viewCount || 0 },
      { name: 'reach', value: metrics.reach || 0 },
      { name: 'engagement_rate', value: Number((metrics.engagement_rate || 0).toFixed(4)) },
    ];

    for (const metric of metricEntries) {
      if (metric.value === undefined || metric.value === null) continue;

      await prisma.dailyMetric.upsert({
        where: {
          user_platform_metric_date: {
            user_id: userId,
            platform,
            metric_name: metric.name,
            date: today,
          },
        },
        update: { value: metric.value },
        create: {
          user_id: userId,
          platform,
          metric_name: metric.name,
          value: metric.value,
          date: today,
        },
      }).catch(() => {
        // Silently skip duplicates on concurrent writes
      });
    }
  }

  // ──────────────────────────────────────────────
  // Mock sync
  // ──────────────────────────────────────────────

  private async mockSync(userId: string, platform: PlatformName): Promise<SyncResult> {
    const metrics = await mockPlatformService.fetchMetrics(userId, platform);
    const profile = await mockPlatformService.fetchProfile(userId, platform);

    await this.recordDailyMetrics(userId, platform, metrics);

    return {
      platform,
      accountId: profile.platformAccountId,
      metrics,
      fetchedAt: new Date(),
      success: true,
    };
  }
}