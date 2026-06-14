/**
 * Instagram Graph API Integration
 * Handles Instagram Business/Creator account operations via the Instagram Graph API.
 */
import axios, { AxiosInstance } from 'axios';
import type { PlatformProfile, PlatformMetrics } from './types.js';
import { instagramConfig } from './config.js';

export class InstagramHandler {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: instagramConfig.apiBaseUrl,
      timeout: 15_000,
    });
  }

  /**
   * Fetch Instagram user profile using the IG User ID and access token.
   * The Instagram Graph API requires an Instagram Business or Creator account
   * connected to a Facebook Page.
   */
  async fetchProfile(accessToken: string, igUserId?: string): Promise<PlatformProfile> {
    // First get Facebook Pages, then find the Instagram account
    const accountsResp = await this.api.get('/me/accounts', {
      params: { access_token: accessToken, fields: 'id,name,instagram_business_account' },
    });

    const pages = accountsResp.data?.data || [];
    let igBusinessAccountId: string | null = null;
    let pageId: string | null = null;

    if (igUserId) {
      // Use the provided IG user ID directly
      igBusinessAccountId = igUserId;
    } else {
      // Find the first page with an Instagram business account
      for (const page of pages) {
        if (page.instagram_business_account?.id) {
          igBusinessAccountId = page.instagram_business_account.id;
          pageId = page.id;
          break;
        }
      }
      if (!igBusinessAccountId) {
        throw new Error('No Instagram Business account found. Connect a Facebook Page with an Instagram Business account.');
      }
    }

    // Fetch Instagram profile fields
    const profileResp = await this.api.get(`/${igBusinessAccountId}`, {
      params: {
        access_token: accessToken,
        fields: 'id,username,name,profile_picture_url,biography,followers_count,follows_count,media_count',
      },
    });

    const data = profileResp.data;

    return {
      platformAccountId: data.id,
      username: data.username,
      displayName: data.name || data.username,
      avatarUrl: data.profile_picture_url,
      bio: data.biography,
      followerCount: data.followers_count,
      followingCount: data.follows_count,
      postCount: data.media_count,
      rawMetadata: data,
    };
  }

  /**
   * Fetch Instagram media and engagement metrics.
   */
  async fetchMetrics(accessToken: string, igUserId: string): Promise<PlatformMetrics> {
    const profile = await this.fetchProfile(accessToken, igUserId);

    // Get recent media engagement
    const mediaResp = await this.api.get(`/${igUserId}/media`, {
      params: {
        access_token: accessToken,
        fields: 'id,like_count,comments_count,reach',
        limit: 25,
      },
    });

    const media = mediaResp.data?.data || [];
    let totalLikes = 0;
    let totalComments = 0;
    let totalReach = 0;

    for (const item of media) {
      totalLikes += item.like_count || 0;
      totalComments += item.comments_count || 0;
      totalReach += item.reach || 0;
    }

    return {
      followerCount: profile.followerCount || 0,
      followingCount: profile.followingCount || 0,
      postCount: profile.postCount || 0,
      likeCount: totalLikes,
      commentCount: totalComments,
      viewCount: totalReach,
      engagement_rate: profile.followerCount
        ? ((totalLikes + totalComments) / profile.followerCount) * 100
        : 0,
    };
  }

  /**
   * Exchange short-lived token for long-lived token.
   * Instagram/Facebook tokens can be extended from 1h to 60 days.
   */
  async exchangeForLongLivedToken(shortLivedToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    const resp = await this.api.get('/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: process.env.INSTAGRAM_CLIENT_ID,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
        fb_exchange_token: shortLivedToken,
      },
    });

    return {
      accessToken: resp.data.access_token,
      expiresIn: resp.data.expires_in,
    };
  }

  /**
   * Refresh an expiring token before it expires.
   */
  async refreshToken(accessToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    // For Instagram/Facebook, you can refresh by calling the token endpoint with
    // the current token to get a new one with extended expiry
    const resp = await this.api.get('/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        fb_exchange_token: accessToken,
        client_id: process.env.INSTAGRAM_CLIENT_ID,
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
      },
    });

    return {
      accessToken: resp.data.access_token,
      expiresIn: resp.data.expires_in,
    };
  }
}