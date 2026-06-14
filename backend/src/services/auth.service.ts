import bcrypt from 'bcryptjs';
import prisma from '../db/prisma.js';
import { FastifyInstance } from 'fastify';

export class AuthService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(payload: any): string {
    return this.fastify.jwt.sign(payload, { expiresIn: '1h' });
  }

  generateRefreshToken(payload: any): string {
    return this.fastify.jwt.sign(payload, { expiresIn: '7d' });
  }

  async blacklistToken(token: string, expiresIn: number): Promise<void> {
    if (this.fastify.redis) {
      await this.fastify.redis.set(`blacklist:${token}`, 'true', 'EX', expiresIn);
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    if (this.fastify.redis) {
      const result = await this.fastify.redis.get(`blacklist:${token}`);
      return result === 'true';
    }
    return false;
  }

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { subscription_tier: true }
    });
  }

  async updateUser(id: string, data: { full_name?: string }) {
    return prisma.user.update({
      where: { id },
      data
    });
  }

  async createUser(data: { email: string; password_hash: string; full_name: string }) {
    return prisma.user.create({
      data,
    });
  }
}
