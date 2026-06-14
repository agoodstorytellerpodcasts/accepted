import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding analytics data...');
  
  const users = await prisma.user.findMany();
  let count = 0;
  
  for (const user of users) {
    const accounts = await prisma.socialAccount.findMany({ where: { user_id: user.id } });
    
    // Generate 30 days of historical data
    for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      date.setHours(0, 0, 0, 0);
      
      for (const account of accounts) {
        const baseFollowers = Math.floor(Math.random() * 5000) + 500;
        const followerCount = baseFollowers + Math.floor(Math.random() * 200);
        
        await prisma.dailyMetric.create({
          data: {
            id: randomUUID(),
            user_id: user.id,
            platform: account.platform,
            metric_name: 'follower_count',
            value: followerCount,
            date,
          },
        }).catch(() => {}); // Skip if exists
        count++;
        
        if (daysAgo % 3 === 0) {
          await prisma.dailyMetric.create({
            data: {
              id: randomUUID(),
              user_id: user.id,
              platform: account.platform,
              metric_name: 'engagement_rate',
              value: parseFloat((Math.random() * 8 + 1).toFixed(1)),
              date,
            },
          }).catch(() => {});
          count++;
        }
        
        if (daysAgo % 2 === 0) {
          await prisma.dailyMetric.create({
            data: {
              id: randomUUID(),
              user_id: user.id,
              platform: account.platform,
              metric_name: 'reach',
              value: Math.floor(Math.random() * 10000) + 500,
              date,
            },
          }).catch(() => {});
          count++;
        }
      }
    }
    
    // Campaign events
    const campaigns = await prisma.campaign.findMany({ 
      where: { user_id: user.id }, 
      include: { variants: true } 
    });
    
    for (const campaign of campaigns) {
      for (const variant of campaign.variants) {
        const existing = await prisma.campaignEvent.count({ where: { variant_id: variant.id } });
        if (existing === 0) {
          for (let i = 0; i < 8; i++) {
            const eventDate = new Date();
            eventDate.setDate(eventDate.getDate() - Math.floor(Math.random() * 14));
            
            await prisma.campaignEvent.create({
              data: {
                variant_id: variant.id,
                event_type: ['like', 'comment', 'share', 'impression'][Math.floor(Math.random() * 4)],
                platform: ['instagram', 'tiktok', 'youtube', 'x', 'facebook'][Math.floor(Math.random() * 5)],
                metadata_json: JSON.stringify({ source: 'seed' }),
                timestamp: eventDate,
              },
            });
          }
        }
      }
    }
  }
  
  console.log(`✓ Analytics data seeded: ${count} metrics created`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());