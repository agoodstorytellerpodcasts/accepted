import prisma from '../db/prisma.js';

export class CompetitorService {
  async listTrackers(userId: string) {
    return prisma.competitorTracker.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
  }

  async createTracker(userId: string, data: { platform: string; handle: string }) {
    return prisma.competitorTracker.create({
      data: {
        user_id: userId,
        ...data
      }
    });
  }

  async deleteTracker(userId: string, id: string) {
    return prisma.competitorTracker.delete({
      where: { id, user_id: userId }
    });
  }
}
