/**
 * Social Media Integration - Main barrel export.
 * All social platform integration services are exported from here.
 */

// Platform configs & types
export { platformConfigs, supportedPlatforms, isValidPlatform, getPlatformConfig } from './platforms/config.js';
export type { 
  PlatformName, 
  OAuthConfig, 
  PlatformProfile, 
  PlatformMetrics, 
  TokenInfo,
  EngagementAction,
  RateLimitStatus,
  WebhookEvent,
  SyncResult,
} from './platforms/types.js';

// Platform handlers
export { InstagramHandler } from './platforms/instagram.js';
export { TikTokHandler } from './platforms/tiktok.js';
export { YouTubeHandler } from './platforms/youtube.js';
export { XHandler } from './platforms/x.js';
export { FacebookHandler } from './platforms/facebook.js';

// Core services
export { OAuthService } from './oauth.service.js';
export { TokenManagerService } from './token-manager.service.js';
export { WebhookService } from './webhook.service.js';
export { SyncService } from './sync.service.js';
export { EngagementDeliveryService } from './engagement-delivery.service.js';
export { RateLimiterService } from './rate-limiter.service.js';

// Error handling
export { classifyError, withRetry, needsReconnect } from './error-handler.js';
export type { RetryConfig, ErrorCategory, ClassifiedError } from './error-handler.js';

// Mock/Simulation
export { MockPlatformService, mockPlatformService } from './mock-platform.service.js';

// Real-time sync & metrics
export { RealTimeSyncOrchestrator } from './realtime-sync.service.js';
export type { SyncSchedule, SyncSnapshot } from './realtime-sync.service.js';

// Metrics tracking
export { MetricsTrackerService } from './metrics-tracker.service.js';
export type { FollowerHistory, GrowthTrend, MetricsSummary } from './metrics-tracker.service.js';

// Engagement types
export type { EngagementCampaignRecord } from './engagement-delivery.service.js';
export type { WebhookRegistrationResult, StoredWebhookEvent } from './webhook.service.js';