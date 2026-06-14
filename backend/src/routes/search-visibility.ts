import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { SearchVisibilityService } from '../services/search-visibility.service.js';
import { z } from 'zod';

const indexingRequestSchema = z.object({
  url: z.string().url(),
  type: z.enum(['URL_UPDATED', 'URL_DELETED']).optional(),
});

const connectGbpSchema = z.object({
  location_id: z.string().min(1),
  account_id: z.string().min(1),
  business_name: z.string().min(1),
  metadata: z.any().optional(),
});

const createLandingPageSchema = z.object({
  campaign_id: z.string().uuid().optional(),
  slug: z.string().min(1),
  title: z.string().min(1),
  content: z.any(),
  seo_metadata: z.any().optional(),
  variants: z.array(z.object({
    name: z.string().min(1),
    content: z.any(),
    seo_metadata: z.any().optional(),
    weight: z.number().optional(),
  })).optional(),
});

const sitemapRequestSchema = z.object({
  urls: z.array(z.string().url()),
});

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  const searchService = new SearchVisibilityService();

  // 1. Google Indexing API
  fastify.post('/search-visibility/indexing', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const { url, type } = indexingRequestSchema.parse(request.body);
      
      const result = await searchService.submitIndexingRequest(userId, url, type);
      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: error.issues });
      }
      throw error;
    }
  });

  // 2. Google Business Profile
  fastify.post('/search-visibility/gbp/connect', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const data = connectGbpSchema.parse(request.body);
      
      const profile = await searchService.connectGbpAccount(userId, data);
      return profile;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: error.issues });
      }
      throw error;
    }
  });

  fastify.get('/search-visibility/gbp/stats/:locationId', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { locationId } = request.params as any;
    
    return searchService.getGbpStats(userId, locationId);
  });

  fastify.post('/search-visibility/gbp/posts', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const { location_id, content, media_urls } = z.object({
        location_id: z.string().min(1),
        content: z.string().min(1),
        media_urls: z.array(z.string().url()).optional(),
      }).parse(request.body);
      
      return searchService.createGbpPost(userId, location_id, content, media_urls);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: error.issues });
      }
      throw error;
    }
  });

  fastify.get('/search-visibility/gbp/reviews/:locationId', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { locationId } = request.params as any;
    
    return searchService.listGbpReviews(userId, locationId);
  });

  fastify.post('/search-visibility/gbp/reviews/:locationId/reply', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const { locationId } = request.params as any;
      const { review_id, reply_content } = z.object({
        review_id: z.string().min(1),
        reply_content: z.string().min(1),
      }).parse(request.body);
      
      return searchService.replyToGbpReview(userId, locationId, review_id, reply_content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: error.issues });
      }
      throw error;
    }
  });

  // 4. Landing Pages
  fastify.post('/search-visibility/landing-pages', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const data = createLandingPageSchema.parse(request.body);
      
      const page = await searchService.createLandingPage(userId, data);
      return reply.status(201).send(page);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: error.issues });
      }
      throw error;
    }
  });

  fastify.get('/search-visibility/landing-pages', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    return searchService.listLandingPages(userId);
  });

  // 5. Sitemaps
  fastify.post('/search-visibility/sitemaps', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const { urls } = sitemapRequestSchema.parse(request.body);
      
      const sitemap = await searchService.generateAndSubmitSitemap(userId, urls);
      return sitemap;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: error.issues });
      }
      throw error;
    }
  });

  // 7. Search Analytics
  fastify.get('/search-visibility/analytics', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { start_date, end_date } = request.query as any;
    
    const start = start_date ? new Date(start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = end_date ? new Date(end_date) : new Date();
    
    return searchService.getSearchAnalytics(userId, start, end);
  });

  // 6. Browser Visibility Tracking
  fastify.post('/search-visibility/track', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      const { keyword } = z.object({ keyword: z.string().min(1) }).parse(request.body);
      
      const result = await searchService.trackBrowserVisibility(userId, keyword);
      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'VALIDATION_ERROR', details: error.issues });
      }
      throw error;
    }
  });

  // 8. Competitive Intelligence
  fastify.get('/search-visibility/competitors/:handle', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { handle } = request.params as any;
    const { keywords } = request.query as any;
    
    const kws = keywords ? (keywords as string).split(',') : ['marketing', 'social media'];
    
    return searchService.getCompetitorSearchRankings(userId, handle, kws);
  });

  // 9. Public Landing Pages
  fastify.get('/lp/:slug', async (request, reply) => {
    try {
      const { slug } = (request.params as any);
      const html = await searchService.getLandingPageHtml(slug);
      return reply.type('text/html').send(html);
    } catch (error: any) {
      return reply.status(404).send({ error: 'NOT_FOUND', message: error.message });
    }
  });
}
