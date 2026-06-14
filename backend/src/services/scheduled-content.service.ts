import prisma from '../db/prisma.js';
import { ScheduledStatus } from '@prisma/client';

export class ScheduledContentService {
  async listScheduled(userId: string, filters: { platform?: string; status?: ScheduledStatus }) {
    return prisma.scheduledContent.findMany({
      where: {
        user_id: userId,
        ...(filters.platform && { platform: filters.platform }),
        ...(filters.status && { status: filters.status })
      },
      orderBy: { scheduled_at: 'asc' }
    });
  }

  async createScheduled(userId: string, data: { platform: string; content_json: any; scheduled_at: Date }) {
    return prisma.scheduledContent.create({
      data: {
        user_id: userId,
        ...data,
        status: 'pending'
      }
    });
  }

  async getScheduled(userId: string, id: string) {
    return prisma.scheduledContent.findFirst({
      where: { id, user_id: userId }
    });
  }

  async updateScheduled(userId: string, id: string, data: any) {
    return prisma.scheduledContent.update({
      where: { id, user_id: userId },
      data
    });
  }

  async deleteScheduled(userId: string, id: string) {
    return prisma.scheduledContent.delete({
      where: { id, user_id: userId }
    });
  }
}
