import prisma from '../db/prisma.js';

export class AnalyticsService {
  async getOverview(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { user_id: userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const [campaignsCount, accountsCount, latestMetrics, socialAccounts] = await Promise.all([
      prisma.campaign.count({ where: { user_id: userId, status: 'active' } }),
      prisma.socialAccount.count({ where: { user_id: userId } }),
      prisma.dailyMetric.findMany({
        where,
        orderBy: { date: 'desc' },
      }),
      prisma.socialAccount.findMany({
        where: { user_id: userId }
      })
    ]);

    const latestMetricMap = new Map<string, any>();
    latestMetrics.forEach(m => {
      const key = `${m.platform}:${m.metric_name}`;
      if (!latestMetricMap.has(key)) {
        latestMetricMap.set(key, m);
      }
    });

    let totalFollowers = 0;
    let totalReach = 0;
    let totalEngagement = 0;
    let engagementCount = 0;

    latestMetricMap.forEach((m) => {
      const val = Number(m.value);
      if (m.metric_name === 'follower_count') totalFollowers += val;
      if (m.metric_name === 'reach') totalReach += val;
      if (m.metric_name === 'engagement_rate') {
        totalEngagement += val;
        engagementCount++;
      }
    });

    const platformBreakdown = socialAccounts.map(sa => {
      const metric = latestMetricMap.get(`${sa.platform}:follower_count`);
      return {
        platform: sa.platform,
        handle: sa.platform_username,
        followers: metric ? Number(metric.value) : 0,
        connected: true
      };
    });

    const trendData = new Map<string, any>();
    latestMetrics.forEach(m => {
      if (m.metric_name === 'follower_count') {
        const date = m.date.toISOString().split('T')[0];
        if (!trendData.has(date)) {
          trendData.set(date, { name: date, followers: 0 });
        }
        trendData.get(date).followers += Number(m.value);
      }
    });
    const followerGrowth = Array.from(trendData.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(-7);

    return {
      stats: {
        total_followers: totalFollowers,
        total_reach: totalReach,
        active_campaigns: campaignsCount,
        avg_engagement_rate: engagementCount > 0 ? totalEngagement / engagementCount : 0,
        connected_accounts: accountsCount,
      },
      followerGrowth,
      platformBreakdown,
      recent_metrics: latestMetrics.slice(0, 20)
    };
  }

  async getCampaignMetrics(userId: string, campaignId: string, startDate?: Date, endDate?: Date) {
    const where: any = {
      variant: {
        campaign_id: campaignId,
        campaign: { user_id: userId }
      }
    };
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const events = await prisma.campaignEvent.findMany({
      where,
      orderBy: { timestamp: 'asc' },
      include: { variant: true }
    });

    const series = new Map<string, any>();
    events.forEach(e => {
      const date = e.timestamp.toISOString().split('T')[0];
      if (!series.has(date)) {
        series.set(date, { date, likes: 0, comments: 0, shares: 0, other: 0 });
      }
      const day = series.get(date);
      if (e.event_type === 'like') day.likes++;
      else if (e.event_type === 'comment') day.comments++;
      else if (e.event_type === 'share') day.shares++;
      else day.other++;
    });

    return Array.from(series.values());
  }

  async getPlatformMetrics(userId: string, platform: string, startDate?: Date, endDate?: Date) {
    const where: any = { user_id: userId, platform };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    return prisma.dailyMetric.findMany({
      where,
      orderBy: { date: 'asc' }
    });
  }

  async getTrends(userId: string, startDate?: Date, endDate?: Date) {
    const where: any = { user_id: userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const metrics = await prisma.dailyMetric.findMany({
      where,
      orderBy: { date: 'asc' }
    });

    const trendData = new Map<string, any>();
    metrics.forEach(m => {
      const date = m.date.toISOString().split('T')[0];
      if (!trendData.has(date)) {
        trendData.set(date, { date });
      }
      const day = trendData.get(date);
      day[m.metric_name] = (day[m.metric_name] || 0) + Number(m.value);
    });

    return Array.from(trendData.values());
  }

  async exportCSV(userId: string, type: string, id?: string) {
    let data: any[];
    if (type === 'campaign' && id) {
      data = await this.getCampaignMetrics(userId, id);
    } else if (type === 'platform' && id) {
      data = await this.getPlatformMetrics(userId, id);
    } else {
      data = await this.getTrends(userId);
    }

    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    for (const row of data) {
      const values = headers.map(h => {
        const val = row[h];
        if (val instanceof Date) return val.toISOString();
        return typeof val === 'string' ? `"${val}"` : val;
      });
      csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
  }
}
