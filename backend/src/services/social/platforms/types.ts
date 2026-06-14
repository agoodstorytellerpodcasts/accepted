/**
 * Shared types for social media platform integrations.
 */

export type PlatformName = 'instagram' | 'tiktok' | 'youtube' | 'x' | 'facebook';

export interface OAuthConfig {
  /** Platform name identifier */
  name: PlatformName;
  /** Display name for UI */
  displayName: string;
  /** OAuth authorize URL */
  authorizeUrl: string;
  /** OAuth token exchange URL */
  tokenUrl: string;
  /** OAuth revoke URL (optional) */
  revokeUrl?: string;
  /** Default scopes to request */
  scopes: string[];
  /** Whether the platform supports PKCE */
  supportsPKCE: boolean;
  /** Base API URL for platform requests */
  apiBaseUrl: string;
  /** API version string */
  apiVersion: string;
  /** Platform's rate limit info (requests per window) */
  rateLimit: {
    requests: number;
    windowMs: number; // window in milliseconds
  };
  /** Whether webhooks/subscriptions are supported */
  supportsWebhooks: boolean;
  /** Whether refresh token rotation is supported */
  supportsTokenRotation: boolean;
  /** Extra headers needed for API requests */
  defaultHeaders: Record<string, string>;
}

export interface PlatformProfile {
  platformAccountId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
  rawMetadata: Record<string, unknown>;
}

export interface PlatformMetrics {
  followerCount: number;
  followingCount: number;
  postCount: number;
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
  engagement_rate?: number;
  reach?: number;
}

export interface TokenInfo {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  tokenType: string;
  scope?: string;
  raw: Record<string, unknown>;
}

export interface EngagementAction {
  type: 'follow' | 'like' | 'comment' | 'share' | 'view';
  targetId: string;
  platform: PlatformName;
  quantity: number;
  metadata?: Record<string, unknown>;
}

export interface RateLimitStatus {
  remaining: number;
  resetAt: Date;
  limit: number;
  platform: PlatformName;
}

export interface WebhookEvent {
  platform: PlatformName;
  eventType: string;
  eventId: string;
  accountId: string;
  payload: Record<string, unknown>;
  receivedAt: Date;
}

export interface SyncResult {
  platform: PlatformName;
  accountId: string;
  metrics: Partial<PlatformMetrics>;
  fetchedAt: Date;
  success: boolean;
  error?: string;
}