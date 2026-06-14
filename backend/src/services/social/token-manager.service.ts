/**
 * Token Manager Service
 * Manages OAuth token lifecycle: storage, refresh rotation, expiry monitoring.
 * Ensures tokens are always valid before making API calls.
 */
import prisma from '../../db/prisma.js';
import { Platform } from '@prisma/client';
import { OAuthService } from './oauth.service.js';
import { getPlatformConfig } from './platforms/config.js';
import type { PlatformName } from './platforms/types.js';
import { encrypt, decrypt } from '../../utils/encryption.js';

export class TokenManagerService {
  private oauthService: OAuthService;

  /** Buffer time (in ms) before expiry to proactively refresh tokens */
  private readonly REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

  /** Maximum retry attempts for token refresh */
  private readonly MAX_REFRESH_RETRIES = 3;

  constructor() {
    this.oauthService = new OAuthService();
  }

  /**
   * Store tokens from a successful OAuth exchange.
   */
  async storeTokens(
    userId: string,
    platform: PlatformName,
    platformAccountId: string,
    tokenInfo: {
      accessToken: string;
      refreshToken?: string;
      expiresAt?: Date;
      tokenType?: string;
      scope?: string;
    },
    profileMetadata?: Record<string, unknown>
  ) {
    const platformEnum = this.toPlatformEnum(platform);

    const encryptedAccessToken = encrypt(tokenInfo.accessToken);
    const encryptedRefreshToken = tokenInfo.refreshToken ? encrypt(tokenInfo.refreshToken) : null;

    return prisma.socialAccount.upsert({
      where: {
        user_id_platform: {
          user_id: userId,
          platform: platformEnum,
        },
      },
      update: {
        platform_account_id: platformAccountId,
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        token_expires_at: tokenInfo.expiresAt,
        token_type: tokenInfo.tokenType || 'bearer',
        token_scope: tokenInfo.scope,
        profile_metadata_json: profileMetadata ? JSON.parse(JSON.stringify(profileMetadata)) : undefined,
        is_active: true,
      },
      create: {
        user_id: userId,
        platform: platformEnum,
        platform_account_id: platformAccountId,
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        token_expires_at: tokenInfo.expiresAt,
        token_type: tokenInfo.tokenType || 'bearer',
        token_scope: tokenInfo.scope,
        profile_metadata_json: profileMetadata ? JSON.parse(JSON.stringify(profileMetadata)) : undefined,
        is_active: true,
      },
    });
  }

  /**
   * Get a valid access token, refreshing if needed.
   * This is the main method to call before making platform API requests.
   */
  async getValidAccessToken(userId: string, platform: PlatformName): Promise<string> {
    const account = await prisma.socialAccount.findUnique({
      where: {
        user_id_platform: {
          user_id: userId,
          platform: this.toPlatformEnum(platform),
        },
      },
    });

    if (!account) {
      throw new Error(`No connected ${platform} account found. Please connect your ${platform} account first.`);
    }

    if (!account.is_active) {
      throw new Error(`Your ${platform} connection is deactivated. Reconnect to continue.`);
    }

    // Check if token needs refresh
    if (this.needsRefresh(account.token_expires_at)) {
      return this.refreshAndStore(account.id, account.refresh_token, platform);
    }

    return decrypt(account.access_token);
  }

  /**
   * Get a valid access token by social account ID.
   */
  async getValidAccessTokenById(accountId: string): Promise<{ accessToken: string; platform: string; userId: string }> {
    const account = await prisma.socialAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error('Social account not found');
    }

    const platform = account.platform as PlatformName;

    if (!account.is_active) {
      throw new Error(`Social account ${account.platform_account_id} is deactivated`);
    }

    if (this.needsRefresh(account.token_expires_at)) {
      const newToken = await this.refreshAndStore(account.id, account.refresh_token, platform);
      return { accessToken: newToken, platform, userId: account.user_id };
    }

    return { accessToken: decrypt(account.access_token), platform, userId: account.user_id };
  }

  /**
   * Check and refresh all expiring tokens across all users.
   * Called periodically by a scheduled job.
   */
  async refreshAllExpiringTokens(): Promise<{ refreshed: number; failed: number }> {
    const bufferTime = new Date(Date.now() + this.REFRESH_BUFFER_MS);

    const expiringAccounts = await prisma.socialAccount.findMany({
      where: {
        is_active: true,
        refresh_token: { not: null },
        token_expires_at: { lte: bufferTime },
      },
    });

    let refreshed = 0;
    let failed = 0;

    for (const account of expiringAccounts) {
      try {
        await this.refreshAndStore(
          account.id,
          decrypt(account.refresh_token!),
          account.platform as PlatformName
        );
        refreshed++;
      } catch (error) {
        failed++;
        console.error(`Failed to refresh token for account ${account.id}:`, error);
      }
    }

    return { refreshed, failed };
  }

  /**
   * Deactivate all tokens for a user's platform account.
   */
  async deactivateAccount(accountId: string): Promise<void> {
    await prisma.socialAccount.update({
      where: { id: accountId },
      data: { is_active: false },
    });
  }

  /**
   * Remove stored tokens (for disconnect/revoke).
   */
  async clearTokens(accountId: string): Promise<void> {
    await prisma.socialAccount.update({
      where: { id: accountId },
      data: {
        access_token: '',
        refresh_token: null,
        token_expires_at: null,
        is_active: false,
      },
    });
  }

  /**
   * Check if a token needs refresh based on expiry.
   */
  private needsRefresh(expiresAt: Date | null | undefined): boolean {
    if (!expiresAt) return true;
    return Date.now() + this.REFRESH_BUFFER_MS >= expiresAt.getTime();
  }

  /**
   * Refresh a token and store the new one.
   * Implements retry logic for transient failures.
   */
  private async refreshAndStore(
    accountId: string,
    refreshToken: string | null,
    platform: PlatformName
  ): Promise<string> {
    if (!refreshToken) {
      throw new Error(`No refresh token available for ${platform} account ${accountId}. Reconnect the account.`);
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_REFRESH_RETRIES; attempt++) {
      try {
        const tokenInfo = await this.oauthService.refreshAccessToken(platform, refreshToken);

        const config = getPlatformConfig(platform);
        const newRefreshToken = config.supportsTokenRotation
          ? tokenInfo.refreshToken
          : refreshToken;

        const encryptedAccessToken = encrypt(tokenInfo.accessToken);
        const encryptedRefreshToken = newRefreshToken ? encrypt(newRefreshToken) : null;

        await prisma.socialAccount.update({
          where: { id: accountId },
          data: {
            access_token: encryptedAccessToken,
            refresh_token: encryptedRefreshToken,
            token_expires_at: tokenInfo.expiresAt,
            token_scope: tokenInfo.scope,
          },
        });

        return tokenInfo.accessToken;
      } catch (error: any) {
        lastError = error;
        // Wait before retry (exponential backoff)
        if (attempt < this.MAX_REFRESH_RETRIES) {
          await new Promise(r => setTimeout(r, attempt * 1000));
        }
      }
    }

    // If all retries failed, deactivate the account
    await prisma.socialAccount.update({
      where: { id: accountId },
      data: { is_active: false },
    });

    throw lastError || new Error(`Token refresh failed after ${this.MAX_REFRESH_RETRIES} attempts`);
  }

  /**
   * Convert platform name string to Prisma Platform enum.
   */
  private toPlatformEnum(platform: PlatformName): Platform {
    return platform as Platform;
  }
}