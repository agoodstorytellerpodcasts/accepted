import prisma from '../db/prisma.js';

export class CampaignService {
  async listCampaigns(userId: string, filters: { status?: string; type?: string; platform?: string }, pagination: { skip: number; take: number }) {
    const campaigns = await prisma.campaign.findMany({
      where: {
        user_id: userId,
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
      },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        variants: {
          include: {
            _count: {
              select: { events: true }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return campaigns.map(c => {
      const engagement = c.variants.reduce((acc, v) => acc + v._count.events, 0);
      return {
        ...c,
        reach: engagement * 12, // Mock reach based on engagement
        engagement,
        platform: c.type === 'search_visibility' ? 'Google' : 'Social'
      };
    });
  }

  async countCampaigns(userId: string, filters: { status?: string; type?: string }) {
    return prisma.campaign.count({
      where: {
        user_id: userId,
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
      }
    });
  }

  async createCampaign(userId: string, data: { name: string; type: string; budget: number; target_parameters?: any }) {
    return prisma.campaign.create({
      data: {
        user_id: userId,
        name: data.name,
        type: data.type,
        budget: data.budget,
        status: 'draft',
        // variants can be created separately or here
      }
    });
  }

  async getCampaign(userId: string, id: string) {
    return prisma.campaign.findFirst({
      where: { id, user_id: userId },
      include: {
        variants: {
          include: {
            events: {
              take: 10,
              orderBy: { timestamp: 'desc' }
            }
          }
        }
      }
    });
  }

  async updateCampaign(userId: string, id: string, data: any) {
    return prisma.campaign.update({
      where: { id, user_id: userId },
      data
    });
  }

  async deleteCampaign(userId: string, id: string) {
    return prisma.campaign.delete({
      where: { id, user_id: userId }
    });
  }

  async createVariant(campaignId: string, data: { name: string; target_parameters_json?: any; content_metadata_json?: any; is_baseline?: boolean }) {
    return prisma.campaignVariant.create({
      data: {
        campaign_id: campaignId,
        ...data
      }
    });
  }
}
