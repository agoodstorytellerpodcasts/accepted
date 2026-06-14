/**
 * Social Account Management Service
 * Handles CRUD operations for social accounts and integrates with
 * the social media integration modules for OAuth and token management.
 */
import prisma from '../db/prisma.js';
import { Platform } from '@prisma/client';
import { TokenManagerService } from './social/token-manager.service.js';
import type { PlatformName } from './social/platforms/types.js';

export class SocialAccountService {
  private tokenManager: TokenManagerService;

  constructor() {
    this.tokenManager = new TokenManagerService();
  }

  async listAccounts(userId: string) {
    return prisma.socialAccount.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        platform: true,
        platform_account_id: true,
        platform_username: true,
        profile_metadata_json: true,
        is_active: true,
        last_synced_at: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async getAccount(userId: string, id: string) {
    return prisma.socialAccount.findFirst({
      where: { id, user_id: userId },
    });
  }

  async deleteAccount(userId: string, id: string) {
    const account = await prisma.socialAccount.findFirst({
      where: { id, user_id: userId },
    });

    if (!account) {
      throw new Error('Social account not found');
    }

    // Revoke tokens before deleting
    try {
      const { OAuthService } = await import('./social/oauth.service.js');
      const oauth = new OAuthService();
      if (account.access_token) {
        await oauth.revokeToken(account.platform as PlatformName, account.access_token);
      }
    } catch {
      // Token revocation is best-effort
    }

    return prisma.socialAccount.delete({
      where: { id },
    });
  }

  /**
   * Store or update tokens after successful OAuth flow.
   */
  async upsertAccount(
    userId: string,
    data: {
      platform: Platform;
      platform_account_id: string;
      platform_username?: string;
      access_token: string;
      refresh_token?: string;
      token_expires_at?: Date;
      token_type?: string;
      token_scope?: string;
      profile_metadata_json?: any;
    }
  ) {
    return this.tokenManager.storeTokens(
      userId,
      data.platform as PlatformName,
      data.platform_account_id,
      {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.token_expires_at,
        tokenType: data.token_type,
        scope: data.token_scope,
      },
      data.profile_metadata_json
    );
  }

  /**
   * Refresh tokens for a specific account.
   */
  async refreshAccountTokens(accountId: string) {
    const result = await this.tokenManager.getValidAccessTokenById(accountId);
    return result;
  }

  /**
   * Get a valid access token for a user's platform account.
   */
  async getValidToken(userId: string, platform: PlatformName): Promise<string> {
    return this.tokenManager.getValidAccessToken(userId, platform);
  }
}