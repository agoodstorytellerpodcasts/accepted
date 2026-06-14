/**
 * Real-Time Sync Orchestrator
 * Manages real-time data synchronization from all platforms using:
 * - Webhook event processing (instant updates)
 * - Adaptive polling for platforms without webhooks
 * - Scheduled periodic sync for all platforms
 * - Follower count and engagement metrics tracking over time
 */
import prisma from '../../db/prisma.js';
import { SyncService } from './sync.service.js';
import { WebhookService } from './webhook.service.js';
import { mockPlatformService } from './mock-platform.service.js';
import type { PlatformName, PlatformMetrics, SyncResult, WebhookEvent } from './platforms/types.js';

export interface SyncSchedule {
  platform: PlatformName;
  /** Polling interval in milliseconds */
  intervalMs: number;
  /** Whether webhooks are available for this platform */
  hasWebhooks: boolean;
  /** Last sync timestamp */
  lastSyncAt: Date | null;
  /** Timer reference */
  timer?: ReturnType<typeof setInterval>;
}

export interface SyncSnapshot {
  id: string;
  userId: string;
  platform: PlatformName;
  metrics: PlatformMetrics;
  recordedAt: Date;
}

export class RealTimeSyncOrchestrator {
  private syncService: SyncService;
  private webhookService: WebhookService;
  private schedules: Map<string, SyncSchedule> = new Map();
  private pollingTimers: Map<string, ReturnType<typeof setInterval>> = new Map();
  private activePolling: boolean = false;

  /** Default polling intervals per platform (ms) */
  private readonly DEFAULT_INTERVALS: Record<PlatformName, number> = {
    instagram: 5 * 60 * 1000,     // 5 min (webhooks available)
    tiktok: 15 * 60 * 1000,       // 15 min (limited webhooks)
    youtube: 10 * 60 * 1000,      // 10 min (webhooks available)
    x: 10 * 60 * 1000,            // 10 min (no webhooks for basic)
    facebook: 5 * 60 * 1000,      // 5 min (webhooks available)
  };

  /** Webhook availability per platform */
  private readonly WEBHOOK_AVAILABLE: Record<PlatformName, boolean> = {
    instagram: true,
    tiktok: false,    // Beta/limited
    youtube: true,
    x: false,         // Enterprise only
    facebook: true,
  };

  constructor() {
    this.syncService = new SyncService();
    this.webhookService = new WebhookService();
    this.setupWebhookHandlers();
  }

  /**
   * Start real-time sync for all active accounts.
   */
  async startAllSync(): Promise<void> {
    const accounts = await prisma.socialAccount.findMany({
      where: { is_active: true },
    });

    for (const account of accounts) {
      this.startPolling(account.user_id, account.platform as PlatformName);
    }

    this.activePolling = true;
    console.log(`RealTimeSyncOrchestrator: Started sync for ${accounts.length} accounts`);
  }

  /**
   * Start polling for a specific user+platform.
   */
  startPolling(userId: string, platform: PlatformName): void {
    const key = this.scheduleKey(userId, platform);

    // Stop existing polling if any
    this.stopPolling(userId, platform);

    const intervalMs = this.DEFAULT_INTERVALS[platform];
    const hasWebhooks = this.WEBHOOK_AVAILABLE[platform];

    const schedule: SyncSchedule = {
      platform,
      intervalMs,
      hasWebhooks,
      lastSyncAt: null,
    };

    this.schedules.set(key, schedule);

    // Initial immediate sync
    this.performSync(userId, platform);

    // Set up polling interval
    const timer = setInterval(() => {
      this.performSync(userId, platform);
    }, intervalMs);

    this.pollingTimers.set(key, timer);
    schedule.timer = timer;

    console.log(`Polling started: ${platform} for user ${userId} every ${intervalMs / 1000}s`);
  }

  /**
   * Stop polling for a specific user+platform.
   */
  stopPolling(userId: string, platform: PlatformName): void {
    const key = this.scheduleKey(userId, platform);
    const existingTimer = this.pollingTimers.get(key);
    if (existingTimer) {
      clearInterval(existingTimer);
      this.pollingTimers.delete(key);
      this.schedules.delete(key);
      console.log(`Polling stopped: ${platform} for user ${userId}`);
    }
  }

  /**
   * Stop all polling.
   */
  stopAllPolling(): void {
    for (const [key] of this.pollingTimers) {
      const [userId, platform] = key.split(':');
      this.stopPolling(userId, platform as PlatformName);
    }
    this.activePolling = false;
    console.log('RealTimeSyncOrchestrator: All polling stopped');
  }

  /**
   * Handle incoming webhook event.
   * Triggers an immediate sync for the affected account.
   */
  async handleWebhookEvent(event: WebhookEvent): Promise<void> {
    console.log(`Webhook event received: ${event.platform}/${event.eventType} for ${event.accountId}`);

    // Find the affected social account
    const account = await prisma.socialAccount.findFirst({
      where: {
        platform: event.platform as any,
        platform_account_id: event.accountId,
        is_active: true,
      },
    });

    if (!account) {
      console.log(`No active account found for webhook: ${event.accountId}`);
      return;
    }

    // Record the event in the database for analytics
    await this.recordWebhookEvent(event, account.user_id);

    // Trigger immediate sync
    await this.performSync(account.user_id, event.platform);
  }

  /**
   * Perform a sync operation with mock fallback.
   */
  async performSync(userId: string, platform: PlatformName): Promise<SyncResult> {
    try {
      let result: SyncResult;

      if (mockPlatformService.isMockMode) {
        // Use mock service for development
        const metrics = await mockPlatformService.fetchMetrics(userId, platform);
        const profile = await mockPlatformService.fetchProfile(userId, platform);

        // Still update the database with mock data
        await this.recordSyncSnapshot(userId, platform, metrics);
        await this.storeDailyMetrics(userId, platform, metrics);

        result = {
          platform,
          accountId: profile.platformAccountId,
          metrics,
          fetchedAt: new Date(),
          success: true,
        };
      } else {
        // Use real platform API
        result = await this.syncService.syncAccount(userId, platform);
      }

      // Update schedule
      const key = this.scheduleKey(userId, platform);
      const schedule = this.schedules.get(key);
      if (schedule) {
        schedule.lastSyncAt = new Date();
      }

      return result;
    } catch (error: any) {
      console.error(`Sync failed for ${platform} user ${userId}:`, error.message);
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

  /**
   * Record a sync snapshot for historical tracking.
   */
  private async recordSyncSnapshot(userId: string, platform: PlatformName, metrics: PlatformMetrics): Promise<void> {
    await prisma.dailyMetric.upsert({
      where: {
        user_platform_metric_date: {
          user_id: userId,
          platform,
          metric_name: 'followers_snapshot',
          date: new Date(),
        },
      },
      update: {
        value: metrics.followerCount,
      },
      create: {
        user_id: userId,
        platform,
        metric_name: 'followers_snapshot',
        value: metrics.followerCount,
        date: new Date(),
      },
    }).catch(err => {
      // Snapshot recording is best-effort
      console.debug('Snapshot recording skipped:', err.message);
    });
  }

  /**
   * Store daily aggregated metrics.
   */
  async storeDailyMetrics(userId: string, platform: PlatformName, metrics: PlatformMetrics): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updates = [
      { name: 'follower_count', value: metrics.followerCount },
      { name: 'following_count', value: metrics.followingCount },
      { name: 'post_count', value: metrics.postCount },
      { name: 'like_count', value: metrics.likeCount || 0 },
      { name: 'comment_count', value: metrics.commentCount || 0 },
      { name: 'view_count', value: metrics.viewCount || 0 },
      { name: 'engagement_rate', value: Number((metrics.engagement_rate || 0).toFixed(4)) },
      { name: 'reach', value: metrics.reach || 0 },
    ];

    for (const metric of updates) {
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
      }).catch(() => {});
    }
  }

  /**
   * Record webhook event for audit/analytics.
   */
  private async recordWebhookEvent(event: WebhookEvent, userId: string): Promise<void> {
    // In production, this would store to an events table
    console.log(`[Webhook Audit] ${event.platform} | ${event.eventType} | user: ${userId} | at: ${event.receivedAt.toISOString()}`);
  }

  /**
   * Set up webhook event handlers.
   */
  private setupWebhookHandlers(): void {
    // Follow events
    this.webhookService.on('follow', async (event) => {
      await this.handleWebhookEvent(event);
    });

    // Comment events
    this.webhookService.on('comment', async (event) => {
      await this.handleWebhookEvent(event);
    });

    // Like events
    this.webhookService.on('like', async (event) => {
      await this.handleWebhookEvent(event);
    });

    // Instagram-specific
    this.webhookService.on('mention', async (event) => {
      await this.handleWebhookEvent(event);
    });

    // YouTube video uploads
    this.webhookService.on('video_upload', async (event) => {
      await this.handleWebhookEvent(event);
    });

    // Generic change handler
    this.webhookService.on('changes', async (event) => {
      await this.handleWebhookEvent(event);
    });
  }

  /**
   * Generate a composite key for schedule storage.
   */
  private scheduleKey(userId: string, platform: PlatformName): string {
    return `${userId}:${platform}`;
  }

  /**
   * Get sync status for all active schedules.
   */
  getSyncStatus(): Array<{ platform: PlatformName; lastSyncAt: Date | null; intervalMs: number; hasWebhooks: boolean }> {
    const statuses: Array<{ platform: PlatformName; lastSyncAt: Date | null; intervalMs: number; hasWebhooks: boolean }> = [];
    for (const [, schedule] of this.schedules) {
      statuses.push({
        platform: schedule.platform,
        lastSyncAt: schedule.lastSyncAt,
        intervalMs: schedule.intervalMs,
        hasWebhooks: schedule.hasWebhooks,
      });
    }
    return statuses;
  }

  /**
   * Update polling interval for a platform.
   */
  updateInterval(platform: PlatformName, intervalMs: number): void {
    this.DEFAULT_INTERVALS[platform] = intervalMs;
  }

  /**
   * Get adaptive interval based on rate limit remaining.
   */
  getAdaptiveInterval(platform: PlatformName, rateLimitRemaining: number): number {
    const base = this.DEFAULT_INTERVALS[platform];
    if (rateLimitRemaining < 10) {
      return base * 4; // Very conservative
    } else if (rateLimitRemaining < 50) {
      return base * 2; // Conservative
    }
    return base; // Normal
  }
}