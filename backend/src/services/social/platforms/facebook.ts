/**
 * Facebook Graph API Integration
 * Handles Facebook Page operations: page management, posts, insights, engagement.
 */
import axios, { AxiosInstance } from 'axios';
import type { PlatformProfile, PlatformMetrics } from './types.js';
import { facebookConfig } from './config.js';

export class FacebookHandler {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: facebookConfig.apiBaseUrl,
      timeout: 15_000,
    });
  }

  /**
   * Fetch Facebook Pages owned/managed by the authenticated user.
   */
  async fetchPages(accessToken: string) {
    const resp = await this.api.get('/me/accounts', {
      params: {
        access_token: accessToken,
        fields: 'id,name,about,description,link,cover,profile_picture_url,followers_count,likes,tasks',
      },
    });

    return resp.data?.data || [];
  }

  /**
   * Fetch a Facebook Page profile and its metrics.
   */
  async fetchProfile(accessToken: string, pageId?: string): Promise<PlatformProfile> {
    let targetPageId = pageId;

    if (!targetPageId) {
      // Get the first accessible page
      const pages = await this.fetchPages(accessToken);
      if (pages.length === 0) {
        throw new Error('No Facebook Pages found. Create or get access to a Facebook Page first.');
      }
      targetPageId = pages[0].id;
    }

    const resp = await this.api.get(`/${targetPageId}`, {
      params: {
        access_token: accessToken,
        fields: 'id,name,about,description,link,picture{url},fan_count,followers_count,talking_about_count',
      },
    });

    const data = resp.data;

    return {
      platformAccountId: data.id,
      username: data.name,
      displayName: data.name,
      avatarUrl: data.picture?.data?.url,
      bio: data.about || data.description,
      followerCount: data.fan_count || data.followers_count || 0,
      followingCount: 0, // Facebook Graph API doesn't expose following for pages
      postCount: 0, // Would need /posts endpoint
      rawMetadata: data,
    };
  }

  /**
   * Fetch Facebook Page metrics and recent post engagement.
   */
  async fetchMetrics(accessToken: string, pageId?: string): Promise<PlatformMetrics> {
    const profile = await this.fetchProfile(accessToken, pageId);
    const targetPageId = profile.platformAccountId;

    // Fetch recent posts
    const postsResp = await this.api.get(`/${targetPageId}/posts`, {
      params: {
        access_token: accessToken,
        fields: 'id,message,created_time,shares,insights.metric(post_impressions,post_engaged_users)',
        limit: 25,
      },
    });

    const posts = postsResp.data?.data || [];
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalImpressions = 0;

    // Fetch individual post reactions (likes) and comments counts
    for (const post of posts.slice(0, 10)) {
      try {
        const postMetrics = await this.api.get(`/${post.id}`, {
          params: {
            access_token: accessToken,
            fields: 'reactions.summary(total_count),comments.summary(true),shares',
          },
        });

        totalLikes += postMetrics.data?.reactions?.summary?.total_count || 0;
        totalComments += postMetrics.data?.comments?.summary?.total_count || 0;
        totalShares += postMetrics.data?.shares?.count || 0;

        if (post.insights?.data) {
          for (const insight of post.insights.data) {
            if (insight.name === 'post_impressions') {
              totalImpressions += insight.values?.[0]?.value || 0;
            }
          }
        }
      } catch {
        // Skip failed post metric fetches
      }
    }

    return {
      followerCount: profile.followerCount || 0,
      followingCount: 0,
      postCount: posts.length,
      likeCount: totalLikes,
      commentCount: totalComments,
      viewCount: totalImpressions,
      engagement_rate: profile.followerCount
        ? ((totalLikes + totalComments + totalShares) / profile.followerCount) * 100
        : 0,
    };
  }

  /**
   * Create a Facebook Page post.
   */
  async createPost(
    accessToken: string,
    pageId: string,
    content: {
      message: string;
      link?: string;
      published?: boolean;
    }
  ) {
    const resp = await this.api.post(
      `/${pageId}/feed`,
      {
        message: content.message,
        link: content.link,
        published: content.published !== false,
        access_token: accessToken,
      }
    );

    return resp.data;
  }

  /**
   * Get Facebook Page Insights.
   */
  async getPageInsights(accessToken: string, pageId: string, metrics: string[] = ['page_impressions', 'page_engaged_users']) {
    const resp = await this.api.get(`/${pageId}/insights`, {
      params: {
        access_token: accessToken,
        metric: metrics.join(','),
        period: 'day',
      },
    });

    return resp.data?.data || [];
  }

  /**
   * Exchange short-lived token for long-lived page token.
   */
  async getLongLivedPageToken(pageAccessToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    const resp = await this.api.get('/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: process.env.FACEBOOK_CLIENT_ID,
        client_secret: process.env.FACEBOOK_CLIENT_SECRET,
        fb_exchange_token: pageAccessToken,
      },
    });

    return {
      accessToken: resp.data.access_token,
      expiresIn: resp.data.expires_in,
    };
  }
}