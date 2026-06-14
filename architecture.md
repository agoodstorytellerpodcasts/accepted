# OmniReach Platform Architecture Blueprint

## 1. System Architecture Overview

OmniReach is built as a modern, scalable web application using a decoupled frontend and backend architecture.

### High-Level Components
- **Frontend Dashboard**: A responsive React application providing the user interface for campaign management, analytics, and AI chat.
- **API Server**: A Node.js/TypeScript backend (Fastify) handling business logic, authentication, and communication with the database and external services.
- **Worker Engine**: A background task processor for handling long-running social media campaign operations and data synchronization.
- **Real-time Chat Service**: A WebSocket-based service for low-latency AI assistant interactions.
- **Primary Database**: PostgreSQL for persistent storage of user data, campaigns, and analytics.
- **Cache & Message Queue**: Redis for session storage, rate limiting, and inter-service communication.

---

## 2. Database Schema Design (PostgreSQL)

### Users & Auth
- `users`: `id`, `email`, `password_hash`, `full_name`, `subscription_tier_id`, `created_at`, `updated_at`
- `subscription_tiers`: `id`, `name`, `monthly_price`, `max_campaigns`, `max_reach`, `features_json`

### Social Media Integrations
- `social_accounts`: `id`, `user_id`, `platform` (enum: 'instagram', 'tiktok', 'youtube', 'x', 'facebook'), `platform_account_id`, `access_token`, `refresh_token`, `token_expires_at`, `profile_metadata_json`

### Campaigns & A/B Testing
- `campaigns`: `id`, `user_id`, `name`, `type`, `status`, `budget`, `created_at`
- `campaign_variants`: `id`, `campaign_id`, `name`, `target_parameters_json`, `content_metadata_json`, `is_baseline` (boolean), `performance_score`
- `campaign_events`: `id`, `variant_id`, `event_type`, `platform`, `metadata_json`, `timestamp`

### Content & Scheduling
- `scheduled_content`: `id`, `user_id`, `platform`, `content_json`, `scheduled_at`, `published_at`, `status` (enum: 'pending', 'published', 'failed')

### AI Chat & Intelligence
- `chat_sessions`: `id`, `user_id`, `title`, `created_at`
- `chat_messages`: `id`, `session_id`, `role`, `content`, `tool_calls_json`, `timestamp`
- `competitor_trackers`: `id`, `user_id`, `platform`, `handle`, `last_scraped_at`, `insights_json`

### Analytics & Payments
- `daily_metrics`: `id`, `user_id`, `platform`, `metric_name`, `value`, `date`
- `payments`: `id`, `user_id`, `stripe_session_id`, `amount`, `currency`, `status`, `created_at`

---

## 3. API Design

### RESTful Endpoints (Base URL: `/api/v1`)

#### Authentication
- `POST /auth/register`: Create a new account
- `POST /auth/login`: Authenticate and receive JWT
- `GET /auth/me`: Get current user profile

#### Campaigns
- `GET /campaigns`: List all user campaigns
- `POST /campaigns`: Create a new campaign
- `GET /campaigns/:id`: Get detailed campaign status
- `PATCH /campaigns/:id`: Update campaign settings

#### Social Accounts
- `GET /social-accounts`: List connected accounts
- `POST /social-accounts/connect/:platform`: Initiate OAuth flow
- `DELETE /social-accounts/:id`: Disconnect account

#### Analytics
- `GET /analytics/overview`: Aggregated stats for the dashboard
- `GET /analytics/campaign/:id`: Detailed performance for a specific campaign

### WebSocket (Real-time Chat)
- `WS /ws/chat`: Persistent connection for AI assistant interactions. Supports streaming responses and tool-call updates.

---

## 4. Social Media Integration Patterns

OmniReach interacts with social platforms via:
1. **Official APIs**: Using OAuth 2.0 for account connection and metadata retrieval (e.g., Instagram Graph API, TikTok for Developers, YouTube Data API).
2. **Engagement Delivery Network**: A proprietary internal service that routes follower/like requests to verified global participants.
3. **Webhooks**: Listening for platform events (mentions, comments) where supported.
4. **Polling Workers**: Regularly fetching updated engagement stats for analytics.

---

## 5. Search Engine Visibility Architecture

- **Google Indexing API**: Programmatic submission of URLs for faster crawling and indexing.
- **Local SEO Manager**: Integration with Google Business Profile API to manage local listings.
- **SEO Landing Pages**: Dynamically generated, SEO-optimized landing pages for customer campaigns, hosted on OmniReach subdomains.
- **Sitemap Automation**: Automatic generation and submission of sitemaps for client-managed assets.

---

## 6. AI Chat Assistant Architecture

The AI Assistant is powered by a Large Language Model (LLM) integrated with internal tools:
- **Streaming Response**: Using Server-Sent Events (SSE) or WebSockets to deliver real-time feedback.
- **Tool Use (Function Calling)**:
    - `get_campaign_stats(campaign_id)`
    - `create_marketing_plan(goals)`
    - `schedule_content(platform, content, time)`
    - `analyze_competitor(handle)`
- **Context Management**: Storing recent conversation history in Redis for fast retrieval during a session.

---

## 7. Authentication & Authorization

- **JWT (JSON Web Tokens)**: Issued upon login, stored in HTTP-only cookies on the frontend.
- **Role-Based Access Control (RBAC)**: Distinguishing between 'user' and 'admin' (OmniReach staff) roles.
- **OAuth 2.0**: For third-party social media integrations.
- **Secure Storage**: Sensitive tokens (refresh tokens) encrypted at rest in the database.

---

## 8. Payment & Subscription System

- **Stripe Integration**:
    - **Checkout**: For subscription signups and one-time campaign boosts.
    - **Customer Portal**: For users to manage billing and upgrades.
    - **Webhooks**: To handle subscription renewals, cancellations, and payment failures.
- **Tier Enforcement**: Middleware on the API server checks `user.subscription_tier` against requested actions (e.g., max active campaigns).

---

## 9. Deployment & Scaling Strategy

- **Infrastructure**: Containerized using Docker.
- **Orchestration**: Managed Kubernetes (EKS/GKE) or a PaaS like Render/Railway.
- **Scaling**:
    - **API Server**: Horizontal scaling based on CPU/Memory usage.
    - **Workers**: Scaled based on message queue depth (Redis/BullMQ).
    - **Database**: Managed PostgreSQL with read replicas for analytics-heavy workloads.
- **CDN**: Cloudflare for static asset delivery and DDoS protection.

---

## 10. Frontend Dashboard Component Tree

- `App`
    - `AuthContext.Provider`
    - `QueryClientProvider` (React Query)
    - `Router`
        - `Layout` (Sidebar + Header + Content Area)
            - `DashboardOverview` (Stat Cards, Trend Charts)
            - `CampaignsList`
                - `CampaignCard`
                - `CreateCampaignModal`
            - `SocialAccountsGrid`
                - `PlatformConnector`
            - `AnalyticsDashboard`
                - `PlatformFilter`
                - `MetricsGraph`
            - `AIChatInterface`
                - `MessageList`
                - `ChatInput`
                - `SuggestedActions`
            ---

## 11. Advanced Marketing Features

### A/B Testing Framework
- **Variants**: Every campaign can support multiple variants (content, headlines, targeting).
- **Traffic Splitting**: The Worker Engine handles routing engagement drops or ad placements across variants.
- **Winner Selection**: Automated conversion tracking identifies the high-performing variant based on KPI (e.g., follower retention or click-through rate).

### Content Scheduling & Automation
- **Multi-Platform Publisher**: Users can draft content once and schedule it across all 5 social platforms with platform-specific optimizations.
- **AI Content Calendar**: The AI assistant proactively suggests the best times to post based on audience activity data.

### Competitive Intelligence
- **Platform Monitoring**: Periodic scraping of public data from competitor handles to track growth and engagement trends.
- **Sentiment Analysis**: Using LLMs to analyze comments on competitor posts for market sentiment.
- **Benchmarking**: Users can compare their own retention and growth rates against industry standards.

### Browser Visibility (Beyond Search)
- **Browser-Specific Listings**: Ensuring local businesses appear in Firefox "new tab" suggestions and specialized browser directories.
- **Manifest V3 Extensions**: Design for a future companion browser extension that allows users to manage campaigns directly while browsing social media sites.
