/**
 * Mock/Simulation Platform Service
 * Provides simulated API responses for development and testing without real API keys.
 * Generates realistic metrics, profiles, and engagement results with variance.
 */
import type { PlatformName, PlatformProfile, PlatformMetrics, EngagementAction } from './platforms/types.js';

interface MockAccount {
  userId: string;
  platform: PlatformName;
  profile: PlatformProfile;
  metrics: PlatformMetrics;
  followerHistory: { date: Date; count: number }[];
  posts: MockPost[];
}

interface MockPost {
  id: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  createdAt: Date;
}

export class MockPlatformService {
  /** Store mock accounts for simulation */
  private accounts: Map<string, MockAccount> = new Map();

  /** Whether mock mode is enabled (true when real API keys are missing) */
  private mockEnabled: boolean = false;

  constructor() {
    this.checkMockMode();
  }

  /**
   * Check if mock mode should be used (missing API credentials).
   */
  private checkMockMode(): void {
    const requiredEnvVars = [
      'INSTAGRAM_CLIENT_ID',
      'TIKTOK_CLIENT_ID',
      'YOUTUBE_CLIENT_ID',
      'X_CLIENT_ID',
      'FACEBOOK_CLIENT_ID',
    ];
    this.mockEnabled = requiredEnvVars.every(key => !process.env[key]);
    if (this.mockEnabled) {
      console.log('MockPlatformService: No API keys detected, running in simulation mode.');
    }
  }

  /**
   * Whether mock mode is active.
   */
  get isMockMode(): boolean {
    return this.mockEnabled;
  }

  /**
   * Initialize a mock account for a user+platform combination.
   */
  initAccount(userId: string, platform: PlatformName): MockAccount {
    const key = this.accountKey(userId, platform);
    const profile = this.generateProfile(platform);
    const metrics = this.generateMetrics(platform);
    const posts = this.generatePosts(platform);

    const account: MockAccount = {
      userId,
      platform,
      profile,
      metrics,
      followerHistory: [{ date: new Date(), count: metrics.followerCount }],
      posts,
    };

    this.accounts.set(key, account);
    return account;
  }

  /**
   * Get or create a mock account.
   */
  private getOrCreateAccount(userId: string, platform: PlatformName): MockAccount {
    const key = this.accountKey(userId, platform);
    let account = this.accounts.get(key);
    if (!account) {
      account = this.initAccount(userId, platform);
    }
    return account;
  }

  /**
   * Simulate fetching a platform profile.
   */
  async fetchProfile(userId: string, platform: PlatformName): Promise<PlatformProfile> {
    const account = this.getOrCreateAccount(userId, platform);
    return { ...account.profile };
  }

  /**
   * Simulate fetching platform metrics with realistic variance.
   */
  async fetchMetrics(userId: string, platform: PlatformName): Promise<PlatformMetrics> {
    const account = this.getOrCreateAccount(userId, platform);

    // Add realistic growth (0.1-1.5% follower growth per fetch)
    const followerGrowth = Math.floor(account.metrics.followerCount * (0.001 + Math.random() * 0.014));
    const postGrowth = Math.floor(Math.random() * 2);

    account.metrics.followerCount += followerGrowth;
    account.metrics.postCount += postGrowth;
    account.metrics.likeCount = Math.floor(account.metrics.followerCount * (0.5 + Math.random() * 3));
    account.metrics.commentCount = Math.floor(account.metrics.likeCount * (0.05 + Math.random() * 0.15));
    account.metrics.viewCount = Math.floor(account.metrics.followerCount * (10 + Math.random() * 50));
    account.metrics.engagement_rate = Number(
      (((account.metrics.likeCount || 0) + (account.metrics.commentCount || 0)) / Math.max(account.metrics.followerCount, 1) * 100).toFixed(2)
    );
    account.metrics.reach = Math.floor(account.metrics.followerCount * (0.3 + Math.random() * 0.7));

    // Record follower history
    account.followerHistory.push({ date: new Date(), count: account.metrics.followerCount });

    return { ...account.metrics };
  }

  /**
   * Simulate an engagement action (follow, like, comment, share, view).
   */
  async performEngagement(userId: string, action: EngagementAction): Promise<{ delivered: number; platformActionId?: string }> {
    // Validate action
    if (action.quantity <= 0) throw new Error('Quantity must be positive');

    // Simulate delivery (90-100% success rate)
    const successRate = 0.9 + Math.random() * 0.1;
    const delivered = Math.max(1, Math.floor(action.quantity * successRate));

    return {
      delivered,
      platformActionId: `mock_${action.platform}_${action.type}_${Date.now()}`,
    };
  }

  /**
   * Simulate webhook event generation.
   */
  async simulateWebhookEvent(
    userId: string,
    platform: PlatformName,
    eventType: string
  ): Promise<Record<string, unknown>> {
    const account = this.getOrCreateAccount(userId, platform);

    switch (eventType) {
      case 'follow':
        account.metrics.followerCount += Math.floor(Math.random() * 5) + 1;
        return {
          field: 'follow',
          value: { new_follow_count: account.metrics.followerCount },
        };

      case 'comment':
        return {
          field: 'comment',
          value: {
            text: 'Great content!',
            created_time: new Date().toISOString(),
          },
        };

      case 'like':
        account.metrics.likeCount = (account.metrics.likeCount || 0) + Math.floor(Math.random() * 10) + 1;
        return {
          field: 'like',
          value: { total_count: account.metrics.likeCount },
        };

      case 'video_upload':
        account.metrics.postCount += 1;
        return {
          video_id: `mock_video_${Date.now()}`,
          title: 'Mock Video Upload',
        };

      default:
        return { event: eventType, simulated: true };
    }
  }

  /**
   * Get follower count history for trend analysis.
   */
  getFollowerHistory(userId: string, platform: PlatformName, days: number = 30) {
    const account = this.getOrCreateAccount(userId, platform);
    const cutoff = new Date(Date.now() - days * 86_400_000);
    return account.followerHistory.filter(h => h.date >= cutoff);
  }

  /**
   * Set mock mode explicitly.
   */
  setMockMode(enabled: boolean): void {
    this.mockEnabled = enabled;
  }

  /**
   * Generate a realistic mock profile for a platform.
   */
  private generateProfile(platform: PlatformName): PlatformProfile {
    const usernames: Record<PlatformName, string[]> = {
      instagram: ['travel_adventures', 'foodie_life', 'fitness_journey', 'art_daily', 'tech_reviews'],
      tiktok: ['dance_creator', 'comedy_sketches', 'diy_projects', 'pet_lover', 'cooking_tips'],
      youtube: ['TechChannel', 'GamingHub', 'MusicStudio', 'EduTube', 'VlogLife'],
      x: ['@tech_observer', '@market_news', '@sports_update', '@science_daily', '@art_world'],
      facebook: ['LocalBusinessPage', 'CommunityHub', 'BrandSpotlight', 'EventCentral', 'NewsFeedPage'],
    };

    const names = usernames[platform];
    const name = names[Math.floor(Math.random() * names.length)];

    return {
      platformAccountId: `${platform}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      username: name,
      displayName: name.replace('_', ' ').replace(/^./, c => c.toUpperCase()),
      avatarUrl: `https://mock.omni-reach.io/avatars/${platform}/${name}.jpg`,
      bio: `This is a simulated ${platform} profile for development and testing.`,
      followerCount: Math.floor(Math.random() * 5000) + 100,
      followingCount: Math.floor(Math.random() * 500) + 10,
      postCount: Math.floor(Math.random() * 200) + 5,
      rawMetadata: { mock: true, platform, generatedAt: new Date().toISOString() },
    };
  }

  /**
   * Generate realistic mock metrics.
   */
  private generateMetrics(platform: PlatformName): PlatformMetrics {
    const followers = Math.floor(Math.random() * 5000) + 100;

    return {
      followerCount: followers,
      followingCount: Math.floor(Math.random() * 500) + 10,
      postCount: Math.floor(Math.random() * 200) + 5,
      likeCount: Math.floor(followers * (1 + Math.random() * 3)),
      commentCount: Math.floor(followers * (0.1 + Math.random() * 0.3)),
      viewCount: Math.floor(followers * (20 + Math.random() * 80)),
      engagement_rate: Number(((Math.random() * 3 + 0.5)).toFixed(2)),
      reach: Math.floor(followers * (0.4 + Math.random() * 0.6)),
    };
  }

  /**
   * Generate mock posts with engagement data.
   */
  private generatePosts(platform: PlatformName, count = 25): MockPost[] {
    const posts: MockPost[] = [];
    for (let i = 0; i < count; i++) {
      posts.push({
        id: `mock_post_${platform}_${i}_${Date.now()}`,
        likeCount: Math.floor(Math.random() * 500) + 10,
        commentCount: Math.floor(Math.random() * 50) + 1,
        shareCount: Math.floor(Math.random() * 100),
        viewCount: Math.floor(Math.random() * 5000) + 100,
        createdAt: new Date(Date.now() - i * 86_400_000),
      });
    }
    return posts;
  }

  /**
   * Generate a composite key for account storage.
   */
  private accountKey(userId: string, platform: PlatformName): string {
    return `${userId}:${platform}`;
  }
}

/** Singleton instance */
export const mockPlatformService = new MockPlatformService();