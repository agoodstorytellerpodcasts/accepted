import api from './api';

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';
export type CampaignType = 'follower_boost' | 'engagement' | 'search_visibility' | 'website_traffic' | 'content_promotion';

export interface CampaignVariant {
  id: string;
  campaign_id: string;
  name: string;
  target_parameters_json: any;
  content_metadata_json: any;
  is_baseline: boolean;
  performance_score: number;
}

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  budget: number;
  created_at: string;
  variants?: CampaignVariant[];
  platform?: string;
  reach?: number;
  engagement?: number;
}

export interface CreateCampaignData {
  name: string;
  type: CampaignType;
  budget: number;
  target_parameters?: any;
}

export const campaignService = {
  getCampaigns: async (params?: { 
    status?: string; 
    type?: string; 
    platform?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ campaigns: Campaign[], total: number }> => {
    const response = await api.get('/campaigns', { params });
    return {
      campaigns: response.data.campaigns,
      total: response.data.pagination.total
    };
  },

  getCampaignById: async (id: string): Promise<Campaign> => {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  },

  createCampaign: async (data: CreateCampaignData): Promise<Campaign> => {
    const response = await api.post('/campaigns', data);
    return response.data;
  },

  updateCampaign: async (id: string, data: Partial<Campaign>): Promise<Campaign> => {
    const response = await api.patch(`/campaigns/${id}`, data);
    return response.data;
  },

  deleteCampaign: async (id: string): Promise<void> => {
    await api.delete(`/campaigns/${id}`);
  },

  createVariant: async (campaignId: string, data: Partial<CampaignVariant>): Promise<CampaignVariant> => {
    const response = await api.post(`/campaigns/${campaignId}/variants`, data);
    return response.data;
  }
};
