/**
 * X (Twitter) API v2 Integration
 * Handles Twitter API v2 operations: user info, tweets, followers, engagement.
 */
import axios, { AxiosInstance } from 'axios';
import type { PlatformProfile, PlatformMetrics } from './types.js';
import { xConfig } from './config.js';

export class XHandler {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: xConfig.apiBaseUrl,
      timeout: 15_000,
    });
  }

  /**
   * Fetch the authenticated user's X profile using OAuth 2.0 Bearer token.
   * Requires users.read and tweet.read scopes.
   */
  async fetchProfile(accessToken: string): Promise<PlatformProfile> {
    const resp = await this.api.get('/users/me', {
      params: {
        'user.fields': 'id,name,username,profile_image_url,description,public_metrics,created_at,location,url,verified',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const user = resp.data?.data;
    if (!user) {
      throw new Error('Failed to fetch X/Twitter user profile');
    }

    const metrics = user.public_metrics || {};

    return {
      platformAccountId: user.id,
      username: user.username,
      displayName: user.name,
      avatarUrl: user.profile_image_url,
      bio: user.description,
      followerCount: metrics.followers_count,
      followingCount: metrics.following_count,
      postCount: metrics.tweet_count,
      rawMetadata: user,
    };
  }

  /**
   * Fetch tweet engagement metrics for the user's recent tweets.
   */
  async fetchMetrics(accessToken: string): Promise<PlatformMetrics> {
    const profile = await this.fetchProfile(accessToken);

    // Fetch recent tweets for engagement data
    const tweetsResp = await this.api.get(`/users/${profile.platformAccountId}/tweets`, {
      params: {
        max_results: 25,
        'tweet.fields': 'public_metrics,created_at',
        exclude: 'retweets,replies',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const tweets = tweetsResp.data?.data || [];
    let totalLikes = 0;
    let totalRetweets = 0;
    let totalReplies = 0;
    let totalQuotes = 0;
    let totalImpressions = 0;

    for (const tweet of tweets) {
      const m = tweet.public_metrics || {};
      totalLikes += m.like_count || 0;
      totalRetweets += m.retweet_count || 0;
      totalReplies += m.reply_count || 0;
      totalQuotes += m.quote_count || 0;
      totalImpressions += m.impression_count || 0;
    }

    return {
      followerCount: profile.followerCount || 0,
      followingCount: profile.followingCount || 0,
      postCount: profile.postCount || 0,
      likeCount: totalLikes,
      commentCount: totalReplies + totalQuotes,
      viewCount: totalImpressions,
      engagement_rate: profile.followerCount
        ? ((totalLikes + totalRetweets + totalReplies) / profile.followerCount) * 100
        : 0,
    };
  }

  /**
   * Post a tweet to X.
   * Requires tweet.write scope.
   */
  async postTweet(accessToken: string, text: string) {
    const resp = await this.api.post(
      '/tweets',
      { text },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return resp.data?.data;
  }

  /**
   * Delete a tweet.
   */
  async deleteTweet(accessToken: string, tweetId: string) {
    await this.api.delete(`/tweets/${tweetId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return { deleted: true };
  }

  /**
   * Fetch followers list for the user.
   */
  async fetchFollowers(accessToken: string, userId: string, maxResults = 100) {
    const resp = await this.api.get(`/users/${userId}/followers`, {
      params: {
        max_results: Math.min(maxResults, 1000),
        'user.fields': 'id,name,username,profile_image_url,public_metrics',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return resp.data?.data || [];
  }

  /**
   * Fetch following list for the user.
   */
  async fetchFollowing(accessToken: string, userId: string, maxResults = 100) {
    const resp = await this.api.get(`/users/${userId}/following`, {
      params: {
        max_results: Math.min(maxResults, 1000),
        'user.fields': 'id,name,username,profile_image_url,public_metrics',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return resp.data?.data || [];
  }

  /**
   * Like a tweet.
   */
  async likeTweet(accessToken: string, userId: string, tweetId: string) {
    await this.api.post(
      `/users/${userId}/likes`,
      { tweet_id: tweetId },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return { liked: true };
  }

  /**
   * Retweet a tweet.
   */
  async retweet(accessToken: string, userId: string, tweetId: string) {
    await this.api.post(
      `/users/${userId}/retweets`,
      { tweet_id: tweetId },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return { retweeted: true };
  }

  /**
   * Follow a user on X.
   */
  async follow(accessToken: string, userId: string, targetUserId: string) {
    await this.api.post(
      `/users/${userId}/following`,
      { target_user_id: targetUserId },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return { followed: true };
  }
}
