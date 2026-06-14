import api from './api';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  current?: boolean;
}

export interface Invoice {
  id: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  created_at: string;
}

export interface SocialAccount {
  id: string;
  platform: string;
  platform_username: string;
  is_active: boolean;
}

export interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
}

export const settingsService = {
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data.user as UserProfile;
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    const response = await api.patch('/auth/me', data);
    return response.data.user as UserProfile;
  },

  getPlans: async () => {
    // Since there's no backend endpoint for plans yet, we return hardcoded ones
    // that would typically be fetched.
    return [
      { id: 'free', name: 'Starter', price: 0, interval: 'month', features: ['3 Campaigns', '1k Reach'], current: true },
      { id: 'pro', name: 'Professional', price: 49, interval: 'month', features: ['Unlimited Campaigns', '50k Reach'] },
      { id: 'ent', name: 'Enterprise', price: 199, interval: 'month', features: ['White-glove setup', 'Custom targeting'] },
    ] as SubscriptionPlan[];
  },

  getInvoices: async () => {
    const response = await api.get('/payments');
    return response.data as Invoice[];
  },

  getSocialAccounts: async () => {
    const response = await api.get('/social-accounts');
    return response.data as SocialAccount[];
  },

  disconnectSocialAccount: async (id: string) => {
    await api.delete(`/social-accounts/${id}`);
  },

  getApiKeys: async (): Promise<ApiKey[]> => {
    return []; // Not supported by backend yet
  },

  createApiKey: async (name: string): Promise<ApiKey> => {
    return { id: 'mock-' + Math.random(), name, key_prefix: 'sk_test_', created_at: new Date().toISOString() };
  },

  revokeApiKey: async (id: string): Promise<void> => {
    console.log('Revoking API key:', id);
    // Mock
  },

  getNotificationSettings: async () => {
    return { email: true, push: false };
  },

  updateNotificationSettings: async (data: any) => {
    return data;
  },
};
