/**
 * Platform-specific error handling and retry logic.
 * Handles common API errors: rate limits, auth failures, network errors, etc.
 */
import type { PlatformName } from './platforms/types.js';

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export type ErrorCategory = 'rate_limit' | 'auth' | 'network' | 'api' | 'validation' | 'unknown';

export interface ClassifiedError {
  category: ErrorCategory;
  retryable: boolean;
  retryAfter?: number;
  message: string;
  platform: PlatformName;
  originalError: Error;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30_000,
};

/** Platform-specific retry configurations */
const PLATFORM_RETRY_CONFIGS: Record<string, Partial<RetryConfig>> = {
  instagram: { maxRetries: 3, baseDelayMs: 2000 },
  tiktok: { maxRetries: 3, baseDelayMs: 1000 },
  youtube: { maxRetries: 5, baseDelayMs: 500, maxDelayMs: 60_000 },
  x: { maxRetries: 3, baseDelayMs: 2000 },
  facebook: { maxRetries: 3, baseDelayMs: 2000 },
};

/**
 * Classify an error from a platform API call.
 */
export function classifyError(
  error: any,
  platform: PlatformName
): ClassifiedError {
  const status = error?.response?.status;
  const errorCode = error?.response?.data?.error?.code || error?.code;
  const errorSubcode = error?.response?.data?.error?.error_subcode;
  const message = error?.response?.data?.error?.message || error?.response?.data?.error_description || error?.message || 'Unknown error';

  // Rate limit errors
  if (status === 429 || errorCode === 4 || errorCode === 17 || errorCode === 88 || errorSubcode === 2321001) {
    const retryAfter = parseInt(error?.response?.headers?.['retry-after'] || '60');
    return {
      category: 'rate_limit',
      retryable: true,
      retryAfter: retryAfter || 60,
      message: `Rate limited on ${platform}. Try again in ${retryAfter}s. ${message}`,
      platform,
      originalError: error instanceof Error ? error : new Error(String(error)),
    };
  }

  // Auth errors (token expired, invalid, revoked)
  if (status === 401 || status === 403 || errorCode === 190 || errorCode === 89 || errorCode === 32) {
    return {
      category: 'auth',
      retryable: errorCode !== 190, // 190 = token invalid, non-retryable
      retryAfter: undefined,
      message: `Authentication error on ${platform}: ${message}`,
      platform,
      originalError: error instanceof Error ? error : new Error(String(error)),
    };
  }

  // Network/connection errors
  if (!status || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
    return {
      category: 'network',
      retryable: true,
      message: `Network error on ${platform}: ${message}`,
      platform,
      originalError: error instanceof Error ? error : new Error(String(error)),
    };
  }

  // API/server errors
  if (status && status >= 500) {
    return {
      category: 'api',
      retryable: status >= 500,
      message: `API error on ${platform} (${status}): ${message}`,
      platform,
      originalError: error instanceof Error ? error : new Error(String(error)),
    };
  }

  // Validation errors
  if (status === 400 || status === 404) {
    return {
      category: 'validation',
      retryable: false,
      message: `Request error on ${platform}: ${message}`,
      platform,
      originalError: error instanceof Error ? error : new Error(String(error)),
    };
  }

  return {
    category: 'unknown',
    retryable: true,
    message: `Unknown error on ${platform}: ${message}`,
    platform,
    originalError: error instanceof Error ? error : new Error(String(error)),
  };
}

/**
 * Execute a platform API call with automatic retry logic.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  platform: PlatformName,
  retryConfig?: Partial<RetryConfig>
): Promise<T> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...PLATFORM_RETRY_CONFIGS[platform], ...retryConfig };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const classified = classifyError(error, platform);

      if (!classified.retryable || attempt === config.maxRetries) {
        throw classified;
      }

      // Calculate delay with exponential backoff + jitter
      const delay = Math.min(
        config.baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 1000,
        config.maxDelayMs
      );

      console.warn(
        `[${platform}] Attempt ${attempt}/${config.maxRetries} failed. ` +
        `Retrying in ${Math.round(delay / 1000)}s. Reason: ${classified.message}`
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error(`Operation failed on ${platform} after ${config.maxRetries} retries`);
}

/**
 * Determine if a user needs to reconnect their account based on auth errors.
 */
export function needsReconnect(classified: ClassifiedError): boolean {
  if (classified.category !== 'auth') return false;
  return !classified.retryable;
}