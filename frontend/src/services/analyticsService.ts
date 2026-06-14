import api from './api';

export interface AnalyticsOverview {
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

export interface MetricDataPoint {
  date: string;
  [key: string]: any;
}

export const analyticsService = {
  getOverview: async (params: { start_date?: string; end_date?: string } = {}) => {
    const response = await api.get('/analytics/overview', { params });
    return response.data as AnalyticsOverview;
  },

  getCampaignMetrics: async (id: string, params: { start_date?: string; end_date?: string } = {}) => {
    const response = await api.get(`/analytics/campaign/${id}`, { params });
    return response.data;
  },

  getPlatformMetrics: async (platform: string, params: { start_date?: string; end_date?: string } = {}) => {
    const response = await api.get(`/analytics/platform/${platform}`, { params });
    return response.data;
  },

  getTrends: async (params: { start_date?: string; end_date?: string } = {}) => {
    const response = await api.get('/analytics/trends', { params });
    return response.data as MetricDataPoint[];
  },

  exportCSV: async (type: 'campaign' | 'platform' | 'trends', id?: string) => {
    const response = await api.get('/analytics/export', { 
      params: { type, id },
      responseType: 'blob'
    });
    return response.data;
  },
};
