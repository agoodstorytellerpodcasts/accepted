# OmniReach Deployment Guide

## Prerequisites

- GitHub account with access to the repository.
- Vercel account for frontend deployment.
- Railway account for backend, AI chat, and marketing website.
- Stripe account for payments.
- OpenAI API key for AI chat.
- Redis instance (managed by Railway or elsewhere).
- PostgreSQL database (managed by Railway or elsewhere).

## Frontend Deployment (Vercel)

1. Connect your GitHub account to Vercel.
2. Import the `frontend/` directory.
3. Configure the following environment variables:
   - `VITE_API_URL`: The URL of your deployed backend API.
4. Deploy.

## Backend & Services Deployment (Railway)

### 1. Database (PostgreSQL)

Railway provides a managed PostgreSQL instance.
1. Add a PostgreSQL service to your Railway project.
2. The `DATABASE_URL` will be automatically injected.
3. Run migrations if applicable (e.g., `npx prisma migrate deploy`).

### 2. Backend API (`backend/`)

1. Connect the `backend/` directory to a Railway service.
2. Configure the following environment variables:
   - `PORT`: 8080
   - `JWT_SECRET`: A secure random string.
   - `STRIPE_SECRET_KEY`: From your Stripe dashboard.
   - `STRIPE_WEBHOOK_SECRET`: From your Stripe dashboard after configuring webhooks.
   - `REDIS_URL`: URL of your Redis instance.
   - `AI_CHAT_SERVICE_URL`: URL of your deployed AI chat service.
   - `DATABASE_URL`: Injected by Railway.
3. Deploy.

### 3. AI Chat Service (`ai-chat/`)

1. Connect the `ai-chat/` directory to a Railway service.
2. Configure the following environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key.
   - `REDIS_URL`: Same as above.
   - `PORT`: 8081
4. Deploy.

### 4. Marketing Website (`website/`)

1. Connect the `website/` directory to a Railway service.
2. Configure the following environment variables:
   - `PORT`: 3000.
3. Deploy.

## Search Engine Visibility

1. Set up a Google Cloud Project and enable the Indexing API.
2. Create a Service Account and download the JSON key.
3. Provide the Service Account credentials to the backend via environment variables or a configuration file.
