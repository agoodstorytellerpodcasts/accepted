import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { AuthService } from '../services/auth.service.js';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshSchema = z.object({
  refresh_token: z.string(),
});

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  const authService = new AuthService(fastify);

  // Apply stricter rate limiting for auth endpoints
  fastify.addHook('preHandler', async (request, reply) => {
    if ((request as any).routerPath?.startsWith('/api/v1/auth')) {
      // You could configure specific rate limits here if needed
    }
  });

  fastify.post('/auth/register', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    try {
      const { email, password, full_name } = registerSchema.parse(request.body);

      const existingUser = await authService.findUserByEmail(email);
      if (existingUser) {
        return reply.status(400).send({ 
          error: 'BAD_REQUEST',
          message: 'User already exists',
          statusCode: 400
        });
      }

      const password_hash = await authService.hashPassword(password);
      const user = await authService.createUser({ email, password_hash, full_name });

      const payload = { id: user.id, email: user.email };
      const access_token = authService.generateToken(payload);
      const refresh_token = authService.generateRefreshToken(payload);

      return reply.status(201).send({ 
        user: { id: user.id, email: user.email, full_name: user.full_name }, 
        access_token,
        refresh_token
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          error: 'VALIDATION_ERROR', 
          message: 'Input validation failed',
          details: (error as any).errors,
          statusCode: 400
        });
      }
      throw error;
    }
  });

  fastify.post('/auth/login', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    try {
      const { email, password } = loginSchema.parse(request.body);

      const user = await authService.findUserByEmail(email);
      if (!user) {
        return reply.status(401).send({ 
          error: 'UNAUTHORIZED',
          message: 'Invalid credentials',
          statusCode: 401
        });
      }

      const isPasswordValid = await authService.comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        return reply.status(401).send({ 
          error: 'UNAUTHORIZED',
          message: 'Invalid credentials',
          statusCode: 401
        });
      }

      // Determine if user is superadmin by email
      const role = email === 'superadmin@omnireach.com' ? 'superadmin' : undefined;

      const payload = { id: user.id, email: user.email };
      const access_token = authService.generateToken(payload);
      const refresh_token = authService.generateRefreshToken(payload);

      return { 
        user: { id: user.id, email: user.email, full_name: user.full_name, role },
        access_token,
        refresh_token
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          error: 'VALIDATION_ERROR', 
          message: 'Input validation failed',
          details: (error as any).errors,
          statusCode: 400
        });
      }
      throw error;
    }
  });

  fastify.post('/auth/refresh', async (request, reply) => {
    try {
      const { refresh_token } = refreshSchema.parse(request.body);
      const decoded: any = await fastify.jwt.verify(refresh_token);
      
      const user = await authService.findUserByEmail(decoded.email);
      if (!user) {
        return reply.status(401).send({ message: 'Invalid refresh token' });
      }

      const access_token = authService.generateToken({ id: user.id, email: user.email });
      return { access_token };
    } catch (error) {
      return reply.status(401).send({ message: 'Invalid refresh token' });
    }
  });

  fastify.post('/auth/logout', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const token = request.headers.authorization?.split(' ')[1];
    if (token) {
      // Invalidate for 1 hour (matching access token expiry)
      await authService.blacklistToken(token, 3600);
    }
    return { message: 'Logged out successfully' };
  });

  fastify.get('/auth/me', {
    preHandler: [fastify.authenticate]
  }, async (request) => {
    const userId = (request.user as any).id;
    const user = await authService.findUserById(userId);
    return { user };
  });

  fastify.patch('/auth/me', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { full_name } = z.object({ full_name: z.string().min(1) }).parse(request.body);
    
    const user = await authService.updateUser(userId, { full_name });
    return { user };
  });
}
