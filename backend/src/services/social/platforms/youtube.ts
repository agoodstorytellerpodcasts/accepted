/**
 * YouTube Data API v3 Integration
 * Handles YouTube channel/channel operations, video management, and analytics.
 */
import axios, { AxiosInstance } from 'axios';
import type { PlatformProfile, PlatformMetrics } from './types.js';
import { youtubeConfig } from './config.js';

export class YouTubeHandler {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: youtubeConfig.apiBaseUrl,
      timeout: 15_000,
    });
  }

  /**
   * Fetch the authenticated user's YouTube channel info.
   * Requires the youtube.readonly scope.
   */
  async fetchProfile(accessToken: string): Promise<PlatformProfile> {
    const resp = await this.api.get('/channels', {
      params: {
        part: 'snippet,statistics,brandingSettings',
        mine: true,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const channel = resp.data?.items?.[0];
    if (!channel) {
      throw new Error('No YouTube channel found for this account');
    }

    return {
      platformAccountId: channel.id,
      username: channel.snippet?.customUrl || channel.id,
      displayName: channel.snippet?.title || 'YouTube Channel',
      avatarUrl: channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.default?.url,
      bio: channel.snippet?.description,
      followerCount: channel.statistics?.subscriberCount ? parseInt(channel.statistics.subscriberCount) : 0,
      followingCount: 0, // YouTube doesn't expose following count via API
      postCount: channel.statistics?.videoCount ? parseInt(channel.statistics.videoCount) : 0,
      rawMetadata: channel,
    };
  }

  /**
   * Fetch detailed YouTube analytics metrics.
   */
  async fetchMetrics(accessToken: string, channelId?: string): Promise<PlatformMetrics> {
    const profile = await this.fetchProfile(accessToken);
    const targetId = channelId || profile.platformAccountId;

    // Fetch recent videos for engagement metrics
    const videosResp = await this.api.get('/search', {
      params: {
        part: 'snippet',
        channelId: targetId,
        order: 'date',
        maxResults: 25,
        type: 'video',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const videoIds = (videosResp.data?.items || [])
      .map((item: any) => item.id?.videoId)
      .filter(Boolean);

    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;

    if (videoIds.length > 0) {
      // Fetch video statistics in batch
      const statsResp = await this.api.get('/videos', {
        params: {
          part: 'statistics',
          id: videoIds.join(','),
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      for (const video of statsResp.data?.items || []) {
        const s = video.statistics || {};
        totalViews += parseInt(s.viewCount || '0');
        totalLikes += parseInt(s.likeCount || '0');
        totalComments += parseInt(s.commentCount || '0');
      }
    }

    return {
      followerCount: profile.followerCount || 0,
      followingCount: 0,
      postCount: profile.postCount || 0,
      likeCount: totalLikes,
      commentCount: totalComments,
      viewCount: totalViews,
      engagement_rate: profile.followerCount
        ? ((totalLikes + totalComments) / profile.followerCount) * 100
        : 0,
    };
  }

  /**
   * Upload a video to YouTube.
   * Requires the youtube.upload scope.
   */
  async uploadVideo(
    accessToken: string,
    videoMetadata: {
      title: string;
      description: string;
      tags?: string[];
      privacyStatus: 'public' | 'unlisted' | 'private';
    }
  ) {
    // Step 1: Create a resumable upload session
    const resp = await this.api.post(
      '/videos?part=snippet,status',
      {
        snippet: {
          title: videoMetadata.title,
          description: videoMetadata.description,
          tags: videoMetadata.tags || [],
        },
        status: {
          privacyStatus: videoMetadata.privacyStatus,
          selfDeclaredMadeForKids: false,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': 'video/*',
        },
      }
    );

    return resp.data;
  }

  /**
   * List playlists for the channel.
   */
  async listPlaylists(accessToken: string) {
    const resp = await this.api.get('/playlists', {
      params: {
        part: 'snippet,contentDetails',
        mine: true,
        maxResults: 50,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return resp.data?.items || [];
  }
}