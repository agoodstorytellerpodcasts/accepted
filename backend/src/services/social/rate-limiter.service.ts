/**
 * Platform Rate Limiter Service
 * Tracks and enforces API rate limits per platform per user account.
 * Uses in-memory tracking with optional Redis for distributed environments.
 */
import { getPlatformConfig } from './platforms/config.js';
import type { PlatformName, RateLimitStatus } from './platforms/types.js';

interface RateLimitBucket {
  remaining: number;
  limit: number;
  resetAt: Date;
  windowMs: number;
}

export class RateLimiterService {
  /** In-memory rate limit buckets keyed by platform:userId */
  private buckets: Map<string, RateLimitBucket> = new Map();

  /** Cooldown tracking to prevent rapid retries */
  private cooldowns: Map<string, number> = new Map();

  /**
   * Check if a request can be made for the given platform and user.
   * Throws if rate limited.
   */
  async checkRateLimit(platform: PlatformName, userId: string): Promise<RateLimitStatus> {
    const key = `${platform}:${userId}`;
    const config = getPlatformConfig(platform);
    const now = Date.now();

    // Check cooldown
    const cooldownUntil = this.cooldowns.get(key);
    if (cooldownUntil && now < cooldownUntil) {
      const waitMs = cooldownUntil - now;
      throw new Error(
        `Rate limited on ${platform}. Retry in ${Math.ceil(waitMs / 1000)}s`
      );
    }

    // Get or create bucket
    let bucket = this.buckets.get(key);
    if (!bucket || now >= bucket.resetAt.getTime()) {
      bucket = {
        remaining: config.rateLimit.requests,
        limit: config.rateLimit.requests,
        resetAt: new Date(now + config.rateLimit.windowMs),
        windowMs: config.rateLimit.windowMs,
      };
      this.buckets.set(key, bucket);
    }

    if (bucket.remaining <= 0) {
      const waitMs = bucket.resetAt.getTime() - now;
      this.cooldowns.set(key, bucket.resetAt.getTime());
      throw new Error(
        `Rate limit exhausted for ${platform}. Resets at ${bucket.resetAt.toISOString()} (in ${Math.ceil(waitMs / 1000)}s)`
      );
    }

    return {
      remaining: bucket.remaining,
      resetAt: bucket.resetAt,
      limit: bucket.limit,
      platform,
    };
  }

  /**
   * Consume one unit from the rate limit bucket.
   */
  consume(platform: PlatformName, userId: string): void {
    const key = `${platform}:${userId}`;
    const bucket = this.buckets.get(key);
    if (bucket) {
      bucket.remaining = Math.max(0, bucket.remaining - 1);
    }
  }

  /**
   * Update rate limit info from API response headers.
   */
  updateFromHeaders(
    platform: PlatformName,
    userId: string,
    headers: Record<string, string | string[] | undefined>
  ): void {
    const key = `${platform}:${userId}`;

    // Try to parse rate limit headers (platform-specific naming)
    const remaining = this.getHeaderValue(headers, [
      'x-ratelimit-remaining',
      'x-app-ratelimit-remaining',
      'ratelimit-remaining',
    ]);

    const reset = this.getHeaderValue(headers, [
      'x-ratelimit-reset',
      'x-app-ratelimit-reset',
      'ratelimit-reset',
    ]);

    if (remaining !== undefined || reset !== undefined) {
      const bucket = this.buckets.get(key);
      if (bucket) {
        if (remaining !== undefined) bucket.remaining = parseInt(remaining);
        if (reset !== undefined) bucket.resetAt = new Date(parseInt(reset) * 1000);
      }
    }
  }

  /**
   * Parse rate limit information from API error responses.
   */
  handleRateLimitError(platform: PlatformName, userId: string, retryAfter?: number): void {
    const key = `${platform}:${userId}`;
    const retryMs = (retryAfter || 60) * 1000;

    this.cooldowns.set(key, Date.now() + retryMs);

    // Reset bucket
    const config = getPlatformConfig(platform);
    this.buckets.set(key, {
      remaining: 0,
      limit: config.rateLimit.requests,
      resetAt: new Date(Date.now() + retryMs),
      windowMs: config.rateLimit.windowMs,
    });
  }

  /**
   * Reset rate limit tracking for a platform/user.
   */
  reset(platform: PlatformName, userId: string): void {
    const key = `${platform}:${userId}`;
    this.buckets.delete(key);
    this.cooldowns.delete(key);
  }

  /**
   * Get first matching header value from a list of possible header names.
   */
  private getHeaderValue(
    headers: Record<string, string | string[] | undefined>,
    names: string[]
  ): string | undefined {
    for (const name of names) {
      const value = headers[name] || headers[name.toLowerCase()];
      if (value !== undefined) {
        return Array.isArray(value) ? value[0] : value;
      }
    }
    return undefined;
  }
}