/**
 * Metrics Tracker Service
 * Tracks follower counts, engagement metrics, and growth trends over time.
 * Provides daily snapshots, growth calculations, and trend analysis.
 */
import prisma from '../../db/prisma.js';
import type { PlatformName, PlatformMetrics } from './platforms/types.js';

export interface FollowerHistory {
  date: string;
  count: number;
  change: number;
  changePercent: number;
}

export interface GrowthTrend {
  period: '7d' | '30d' | '90d';
  startCount: number;
  endCount: number;
  totalChange: number;
  totalChangePercent: number;
  averageDailyGrowth: number;
  averageDailyGrowthPercent: number;
}

export interface MetricsSummary {
  platform: PlatformName;
  current: PlatformMetrics;
  followerHistory: FollowerHistory[];
  growthTrends: GrowthTrend[];
  lastUpdated: Date | null;
}

export class MetricsTrackerService {
  /**
   * Get a comprehensive metrics summary for a user's platform.
   */
  async getMetricsSummary(userId: string, platform: PlatformName): Promise<MetricsSummary | null> {
    const account = await prisma.socialAccount.findUnique({
      where: {
        user_id_platform: {
          user_id: userId,
          platform: platform as any,
        },
      },
    });

    if (!account) return null;

    const currentMetrics: PlatformMetrics = {
      followerCount: 0,
      followingCount: 0,
      postCount: 0,
    };

    // Get current metrics from daily metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentDayMetrics = await prisma.dailyMetric.findMany({
      where: {
        user_id: userId,
        platform,
        date: today,
      },
    });

    for (const m of currentDayMetrics) {
      switch (m.metric_name) {
        case 'follower_count': currentMetrics.followerCount = Number(m.value); break;
        case 'following_count': currentMetrics.followingCount = Number(m.value); break;
        case 'post_count': currentMetrics.postCount = Number(m.value); break;
        case 'like_count': currentMetrics.likeCount = Number(m.value); break;
        case 'comment_count': currentMetrics.commentCount = Number(m.value); break;
        case 'view_count': currentMetrics.viewCount = Number(m.value); break;
        case 'engagement_rate': currentMetrics.engagement_rate = Number(m.value); break;
        case 'reach': currentMetrics.reach = Number(m.value); break;
      }
    }

    // Get follower history for the last 90 days
    const thirtyDaysAgo = new Date(Date.now() - 90 * 86_400_000);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const followerMetrics = await prisma.dailyMetric.findMany({
      where: {
        user_id: userId,
        platform,
        metric_name: 'follower_count',
        date: { gte: thirtyDaysAgo },
      },
      orderBy: { date: 'asc' },
    });

    // Build follower history with day-over-day changes
    const followerHistory: FollowerHistory[] = [];
    let prevCount: number | null = null;

    for (const m of followerMetrics) {
      const count = Number(m.value);
      const change = prevCount !== null ? count - prevCount : 0;
      const changePercent = prevCount && prevCount > 0
        ? Number(((change / prevCount) * 100).toFixed(2))
        : 0;

      followerHistory.push({
        date: m.date.toISOString().split('T')[0],
        count,
        change,
        changePercent,
      });

      prevCount = count;
    }

    // Calculate growth trends
    const growthTrends = this.calculateGrowthTrends(followerHistory);

    return {
      platform,
      current: currentMetrics,
      followerHistory,
      growthTrends,
      lastUpdated: account.last_synced_at,
    };
  }

  /**
   * Get follower count for a specific date (useful for historical queries).
   */
  async getFollowerCountForDate(userId: string, platform: PlatformName, date: Date): Promise<number | null> {
    // Start from the date and look backwards for the nearest recorded value
    const metric = await prisma.dailyMetric.findFirst({
      where: {
        user_id: userId,
        platform,
        metric_name: 'follower_count',
        date: { lte: date },
      },
      orderBy: { date: 'desc' },
    });

    return metric ? Number(metric.value) : null;
  }

  /**
   * Get average engagement rate over a period.
   */
  async getAverageEngagementRate(userId: string, platform: PlatformName, days: number = 30): Promise<number | null> {
    const since = new Date(Date.now() - days * 86_400_000);
    since.setHours(0, 0, 0, 0);

    const metrics = await prisma.dailyMetric.findMany({
      where: {
        user_id: userId,
        platform,
        metric_name: 'engagement_rate',
        date: { gte: since },
      },
    });

    if (metrics.length === 0) return null;

    const total = metrics.reduce((sum, m) => sum + Number(m.value), 0);
    return Number((total / metrics.length).toFixed(2));
  }

  /**
   * Calculate growth trends from follower history.
   */
  private calculateGrowthTrends(history: FollowerHistory[]): GrowthTrend[] {
    const trends: GrowthTrend[] = [];

    const periods: Array<{ period: GrowthTrend['period']; days: number }> = [
      { period: '7d', days: 7 },
      { period: '30d', days: 30 },
      { period: '90d', days: 90 },
    ];

    for (const { period, days } of periods) {
      if (history.length < 2) continue;

      const now = new Date();
      const cutoff = new Date(now.getTime() - days * 86_400_000);
      const cutoffStr = cutoff.toISOString().split('T')[0];

      // Find the closest entry to the cutoff date
      const pastEntries = history.filter(h => h.date <= cutoffStr);
      const startEntry = pastEntries.length > 0 ? pastEntries[pastEntries.length - 1] : history[0];
      const endEntry = history[history.length - 1];

      if (!startEntry || !endEntry) continue;

      const totalChange = endEntry.count - startEntry.count;
      const totalChangePercent = startEntry.count > 0
        ? Number(((totalChange / startEntry.count) * 100).toFixed(2))
        : 0;

      // Calculate daily averages
      const daysDiff = Math.max(1, (new Date(endEntry.date).getTime() - new Date(startEntry.date).getTime()) / 86_400_000);
      const averageDailyGrowth = Number((totalChange / daysDiff).toFixed(1));
      const averageDailyGrowthPercent = startEntry.count > 0
        ? Number(((averageDailyGrowth / startEntry.count) * 100).toFixed(4))
        : 0;

      trends.push({
        period,
        startCount: startEntry.count,
        endCount: endEntry.count,
        totalChange,
        totalChangePercent,
        averageDailyGrowth,
        averageDailyGrowthPercent,
      });
    }

    return trends;
  }
}