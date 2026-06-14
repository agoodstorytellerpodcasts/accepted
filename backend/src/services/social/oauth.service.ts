/**
 * OAuth 2.0 Service
 * Handles OAuth 2.0 authorization code flows for all 5 social platforms.
 * Manages state validation, token exchange, and redirect handling.
 */
import crypto from 'crypto';
import axios from 'axios';
import { getPlatformConfig } from './platforms/config.js';
import type { PlatformName, TokenInfo } from './platforms/types.js';

export class OAuthService {
  /**
   * Generate the OAuth 2.0 authorization URL for a platform.
   * Users are redirected to this URL to grant permissions.
   */
  generateAuthUrl(
    platform: PlatformName,
    userId: string,
    redirectUri: string
  ): { url: string; state: string; codeVerifier?: string } {
    const config = getPlatformConfig(platform);
    const state = this.generateState(userId, platform);

    const params = new URLSearchParams({
      client_id: this.getClientId(platform),
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      state,
    });

    let codeVerifier: string | undefined;

    if (config.supportsPKCE) {
      codeVerifier = this.generateCodeVerifier();
      const codeChallenge = this.generateCodeChallenge(codeVerifier);
      params.set('code_challenge_method', 'S256');
      params.set('code_challenge', codeChallenge);
    }

    return {
      url: `${config.authorizeUrl}?${params.toString()}`,
      state,
      codeVerifier,
    };
  }

  /**
   * Exchange an authorization code for an access token.
   */
  async exchangeCodeForToken(
    platform: PlatformName,
    code: string,
    redirectUri: string,
    codeVerifier?: string
  ): Promise<TokenInfo> {
    const config = getPlatformConfig(platform);

    const body = new URLSearchParams({
      client_id: this.getClientId(platform),
      client_secret: this.getClientSecret(platform),
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    if (codeVerifier && config.supportsPKCE) {
      body.set('code_verifier', codeVerifier);
    }

    try {
      const resp = await axios.post(config.tokenUrl, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const data = resp.data;
      const expiresIn = data.expires_in || data.expires_in_seconds || 3600;

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
        tokenType: data.token_type || 'bearer',
        scope: data.scope,
        raw: data,
      };
    } catch (error: any) {
      const detail = error.response?.data?.error_description || error.response?.data?.error || error.message;
      throw new Error(`OAuth token exchange failed for ${platform}: ${detail}`);
    }
  }

  /**
   * Refresh an access token.
   */
  async refreshAccessToken(platform: PlatformName, refreshToken: string): Promise<TokenInfo> {
    const config = getPlatformConfig(platform);

    const body = new URLSearchParams({
      client_id: this.getClientId(platform),
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    // Some platforms (Google, Facebook) need client_secret for refresh
    if (!config.supportsPKCE) {
      body.set('client_secret', this.getClientSecret(platform));
    }

    try {
      const resp = await axios.post(config.tokenUrl, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const data = resp.data;
      const expiresIn = data.expires_in || data.expires_in_seconds || 3600;

      return {
        accessToken: data.access_token,
        // Some platforms rotate refresh tokens (return new one)
        refreshToken: data.refresh_token || refreshToken,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
        tokenType: data.token_type || 'bearer',
        scope: data.scope,
        raw: data,
      };
    } catch (error: any) {
      const detail = error.response?.data?.error_description || error.response?.data?.error || error.message;
      throw new Error(`Token refresh failed for ${platform}: ${detail}`);
    }
  }

  /**
   * Revoke an access/refresh token.
   */
  async revokeToken(platform: PlatformName, token: string): Promise<void> {
    const config = getPlatformConfig(platform);
    if (!config.revokeUrl) return;

    try {
      await axios.post(config.revokeUrl, null, {
        params: { token },
      });
    } catch {
      // Token revocation is best-effort
    }
  }

  /**
   * Validate OAuth state parameter to prevent CSRF attacks.
   */
  validateState(state: string, storedState: string): boolean {
    if (!state || !storedState) return false;
    return crypto.timingSafeEqual(Buffer.from(state), Buffer.from(storedState));
  }

  /**
   * Generate a cryptographically secure state parameter.
   */
  private generateState(userId: string, platform: string): string {
    const raw = `${userId}:${platform}:${Date.now()}:${crypto.randomBytes(16).toString('hex')}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  /**
   * Generate a PKCE code verifier.
   */
  private generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Generate a PKCE code challenge (S256).
   */
  private generateCodeChallenge(verifier: string): string {
    return crypto.createHash('sha256').update(verifier).digest('base64url');
  }

  /**
   * Get the OAuth client ID for a platform from environment variables.
   */
  private getClientId(platform: PlatformName): string {
    const envKey = `${platform.toUpperCase()}_CLIENT_ID`;
    const value = process.env[envKey];
    if (!value) {
      throw new Error(`Missing environment variable: ${envKey}`);
    }
    return value;
  }

  /**
   * Get the OAuth client secret for a platform from environment variables.
   */
  private getClientSecret(platform: PlatformName): string {
    const envKey = `${platform.toUpperCase()}_CLIENT_SECRET`;
    const value = process.env[envKey];
    if (!value) {
      throw new Error(`Missing environment variable: ${envKey}`);
    }
    return value;
  }
}