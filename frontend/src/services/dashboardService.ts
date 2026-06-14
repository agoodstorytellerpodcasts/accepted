import api from './api';
import type { Campaign } from './campaignService';

export interface DashboardStats {
  stats: {
    total_followers: number;
    total_reach: number;
    active_campaigns: number;
    avg_engagement_rate: number;
    connected_accounts: number;
  };
  followerGrowth: { name: string; followers: number }[];
  platformBreakdown: {
    platform: string;
    followers: number;
    handle: string;
    connected: boolean;
  }[];
  recent_metrics: any[];
}

export const dashboardService = {
  getOverview: async (): Promise<DashboardStats> => {
    const response = await api.get('/analytics/overview');
    return response.data;
  },
  
  getRecentCampaigns: async (): Promise<Campaign[]> => {
    const response = await api.get('/campaigns', { params: { limit: 5 } });
    return response.data.campaigns;
  }
};
