/**
 * Platform-specific OAuth 2.0 configurations for all 5 social media platforms.
 * Each config defines the endpoints, scopes, and API details needed
 * for the OAuth 2.0 authorization code flow and subsequent API calls.
 */
import type { OAuthConfig } from './types.js';

/**
 * Instagram Graph API (IG User API)
 * - Uses Facebook Login with Instagram permissions
 * - OAuth 2.0 Authorization Code flow
 * - Long-lived tokens via token exchange
 */
export const instagramConfig: OAuthConfig = {
  name: 'instagram',
  displayName: 'Instagram',
  authorizeUrl: 'https://www.facebook.com/v22.0/dialog/oauth',
  tokenUrl: 'https://graph.facebook.com/v22.0/oauth/access_token',
  revokeUrl: 'https://graph.facebook.com/v22.0/me/permissions',
  scopes: [
    'instagram_basic',
    'instagram_content_publish',
    'instagram_manage_comments',
    'instagram_manage_messages',
    'pages_read_engagement',
    'pages_show_list',
  ],
  supportsPKCE: false,
  apiBaseUrl: 'https://graph.facebook.com/v22.0',
  apiVersion: 'v22.0',
  rateLimit: {
    requests: 200,
    windowMs: 3600_000, // per hour
  },
  supportsWebhooks: true,
  supportsTokenRotation: true,
  defaultHeaders: {
    'Accept': 'application/json',
  },
};

/**
 * TikTok for Developers
 * - OAuth 2.0 Authorization Code flow with PKCE
 * - Uses v2 API endpoints
 * - Access tokens valid for 24h, refresh tokens for 1 year
 */
export const tiktokConfig: OAuthConfig = {
  name: 'tiktok',
  displayName: 'TikTok',
  authorizeUrl: 'https://www.tiktok.com/v2/auth/authorize/',
  tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token/',
  revokeUrl: 'https://open.tiktokapis.com/v2/oauth/revoke/',
  scopes: [
    'user.info.basic',
    'user.info.profile',
    'user.info.stats',
    'video.publish',
    'video.upload',
    'video.list',
    'comment.list',
    'comment.view_replies',
  ],
  supportsPKCE: true,
  apiBaseUrl: 'https://open.tiktokapis.com/v2',
  apiVersion: 'v2',
  rateLimit: {
    requests: 1000,
    windowMs: 86_400_000, // per day
  },
  supportsWebhooks: true,
  supportsTokenRotation: true,
  defaultHeaders: {
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
  },
};

/**
 * YouTube Data API v3
 * - OAuth 2.0 Authorization Code flow
 * - Uses Google's OAuth 2.0 endpoints
 * - Access tokens valid for 1h, refresh tokens persist
 */
export const youtubeConfig: OAuthConfig = {
  name: 'youtube',
  displayName: 'YouTube',
  authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  revokeUrl: 'https://oauth2.googleapis.com/revoke',
  scopes: [
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtubepartner',
  ],
  supportsPKCE: true,
  apiBaseUrl: 'https://www.googleapis.com/youtube/v3',
  apiVersion: 'v3',
  rateLimit: {
    requests: 10_000,
    windowMs: 86_400_000, // per day
  },
  supportsWebhooks: true,
  supportsTokenRotation: false, // Google uses long-lived refresh tokens
  defaultHeaders: {
    'Accept': 'application/json',
  },
};

/**
 * X/Twitter API v2
 * - OAuth 2.0 Authorization Code flow with PKCE
 * - Uses Twitter API v2 endpoints
 * - Access tokens valid for 2h, refresh tokens provided
 */
export const xConfig: OAuthConfig = {
  name: 'x',
  displayName: 'X (Twitter)',
  authorizeUrl: 'https://twitter.com/i/oauth2/authorize',
  tokenUrl: 'https://api.twitter.com/2/oauth2/token',
  revokeUrl: 'https://api.twitter.com/2/oauth2/revoke',
  scopes: [
    'tweet.read',
    'tweet.write',
    'users.read',
    'offline.access',
    'follows.read',
    'follows.write',
    'like.read',
    'like.write',
    'dm.read',
    'dm.write',
  ],
  supportsPKCE: true,
  apiBaseUrl: 'https://api.twitter.com/2',
  apiVersion: '2',
  rateLimit: {
    requests: 450,
    windowMs: 900_000, // per 15 min (user context)
  },
  supportsWebhooks: false, // X requires enterprise for webhooks
  supportsTokenRotation: true,
  defaultHeaders: {
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
  },
};

/**
 * Facebook Graph API
 * - OAuth 2.0 Authorization Code flow
 * - Uses Facebook Login
 * - Long-lived tokens, page tokens, app tokens
 */
export const facebookConfig: OAuthConfig = {
  name: 'facebook',
  displayName: 'Facebook',
  authorizeUrl: 'https://www.facebook.com/v22.0/dialog/oauth',
  tokenUrl: 'https://graph.facebook.com/v22.0/oauth/access_token',
  revokeUrl: 'https://graph.facebook.com/v22.0/me/permissions',
  scopes: [
    'pages_show_list',
    'pages_read_engagement',
    'pages_manage_posts',
    'pages_manage_metadata',
    'pages_read_user_content',
    'pages_manage_engagement',
    'public_profile',
  ],
  supportsPKCE: false,
  apiBaseUrl: 'https://graph.facebook.com/v22.0',
  apiVersion: 'v22.0',
  rateLimit: {
    requests: 200,
    windowMs: 3600_000, // per hour (per app+user pair)
  },
  supportsWebhooks: true,
  supportsTokenRotation: true,
  defaultHeaders: {
    'Accept': 'application/json',
  },
};

/** Map of all platform configs keyed by platform name */
export const platformConfigs: Record<string, OAuthConfig> = {
  instagram: instagramConfig,
  tiktok: tiktokConfig,
  youtube: youtubeConfig,
  x: xConfig,
  facebook: facebookConfig,
};

/** List of all supported platform names */
export const supportedPlatforms: string[] = Object.keys(platformConfigs);

/** Validate that a platform name is supported */
export function isValidPlatform(platform: string): platform is keyof typeof platformConfigs {
  return platform in platformConfigs;
}

/** Get config for a platform, throwing if unsupported */
export function getPlatformConfig(platform: string): OAuthConfig {
  if (!isValidPlatform(platform)) {
    throw new Error(`Unsupported platform: ${platform}. Supported platforms: ${supportedPlatforms.join(', ')}`);
  }
  return platformConfigs[platform];
}