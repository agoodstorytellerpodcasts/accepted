/**
 * TikTok for Developers Integration
 * Handles TikTok API v2 operations (user info, videos, analytics).
 */
import axios, { AxiosInstance } from 'axios';
import type { PlatformProfile, PlatformMetrics } from './types.js';
import { tiktokConfig } from './config.js';

export class TikTokHandler {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: tiktokConfig.apiBaseUrl,
      timeout: 15_000,
    });
  }

  /**
   * Fetch TikTok user profile info using the access token.
   * Requires user.info.basic and user.info.profile scopes.
   */
  async fetchProfile(accessToken: string): Promise<PlatformProfile> {
    const resp = await this.api.get('/user/info/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        fields: 'open_id,union_id,avatar_url,avatar_url_100,avatar_url_200,avatar_large_url,display_name,bio_description,profile_deep_link,follower_count,following_count,likes_count,video_count',
      },
    });

    const user = resp.data?.data?.user;
    if (!user) {
      throw new Error('Failed to fetch TikTok user profile');
    }

    return {
      platformAccountId: user.open_id,
      username: user.display_name || user.open_id,
      displayName: user.display_name || 'TikTok User',
      avatarUrl: user.avatar_large_url || user.avatar_url_200 || user.avatar_url_100,
      bio: user.bio_description,
      followerCount: user.follower_count,
      followingCount: user.following_count,
      postCount: user.video_count,
      rawMetadata: user,
    };
  }

  /**
   * Fetch TikTok metrics including likes, followers, video count.
   */
  async fetchMetrics(accessToken: string): Promise<PlatformMetrics> {
    const profile = await this.fetchProfile(accessToken);

    // Fetch user stats for additional metrics
    const statsResp = await this.api.get('/user/stats/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        fields: 'follower_count,following_count,likes_count,video_count,comment_count,share_count',
      },
    });

    const stats = statsResp.data?.data?.user || {};

    return {
      followerCount: stats.follower_count || profile.followerCount || 0,
      followingCount: stats.following_count || profile.followingCount || 0,
      postCount: stats.video_count || profile.postCount || 0,
      likeCount: stats.likes_count || 0,
      commentCount: stats.comment_count || 0,
      viewCount: 0, // Not directly available from user stats API
      engagement_rate: stats.follower_count
        ? ((stats.likes_count || 0) / stats.follower_count) * 100
        : 0,
    };
  }

  /**
   * List videos for the authenticated user.
   */
  async listVideos(accessToken: string, maxCount = 20) {
    const resp = await this.api.get('/video/list/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        fields: 'id,title,create_time,cover_image_url,share_url,video_description,duration,height,width',
        max_count: Math.min(maxCount, 100),
      },
    });

    return resp.data?.data?.videos || [];
  }

  /**
   * Post a video to TikTok (requires video.upload + video.publish scopes).
   */
  async uploadVideo(
    accessToken: string,
    videoUrl: string,
    caption: string,
    privacyLevel: 'PUBLIC' | 'FRIENDS' | 'PRIVATE' = 'PUBLIC'
  ) {
    // Step 1: Initialize upload
    const initResp = await this.api.post(
      '/video/upload/init/',
      {
        source_info: {
          source: 'PULL_FROM_URL',
          video_url: videoUrl,
        },
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const publishId = initResp.data?.data?.publish_id;
    if (!publishId) {
      throw new Error('Failed to initialize TikTok video upload');
    }

    // Step 2: Publish the video
    const publishResp = await this.api.post(
      '/video/publish/',
      {
        publish_id: publishId,
        post_info: {
          privacy_level: privacyLevel,
          title: caption,
          disable_duet: false,
          disable_stitch: false,
          disable_comment: false,
        },
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return publishResp.data?.data;
  }
}