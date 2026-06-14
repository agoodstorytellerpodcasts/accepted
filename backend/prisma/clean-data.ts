import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning all sample/seed data...');
  
  // Delete in order to respect foreign key constraints
  const delEvents = await prisma.campaignEvent.deleteMany({});
  console.log(`  Deleted ${delEvents.count} campaign events`);
  
  const delVariants = await prisma.campaignVariant.deleteMany({});
  console.log(`  Deleted ${delVariants.count} campaign variants`);
  
  const delCampaigns = await prisma.campaign.deleteMany({});
  console.log(`  Deleted ${delCampaigns.count} campaigns`);
  
  const delMetrics = await prisma.dailyMetric.deleteMany({});
  console.log(`  Deleted ${delMetrics.count} daily metrics`);
  
  const delMessages = await prisma.chatMessage.deleteMany({});
  console.log(`  Deleted ${delMessages.count} chat messages`);
  
  const delSessions = await prisma.chatSession.deleteMany({});
  console.log(`  Deleted ${delSessions.count} chat sessions`);
  
  const delTrackers = await prisma.competitorTracker.deleteMany({});
  console.log(`  Deleted ${delTrackers.count} competitor trackers`);
  
  const delScheduled = await prisma.scheduledContent.deleteMany({});
  console.log(`  Deleted ${delScheduled.count} scheduled content`);
  
  const delPayments = await prisma.payment.deleteMany({});
  console.log(`  Deleted ${delPayments.count} payments`);
  
  const delSocial = await prisma.socialAccount.deleteMany({});
  console.log(`  Deleted ${delSocial.count} social accounts`);
  
  const delIndexing = await prisma.indexingRequest.deleteMany({});
  console.log(`  Deleted ${delIndexing.count} indexing requests`);
  
  const delProfiles = await prisma.googleBusinessProfile.deleteMany({});
  console.log(`  Deleted ${delProfiles.count} business profiles`);
  
  const delPages = await prisma.landingPage.deleteMany({});
  console.log(`  Deleted ${delPages.count} landing pages`);
  
  const delSitemaps = await prisma.sitemap.deleteMany({});
  console.log(`  Deleted ${delSitemaps.count} sitemaps`);
  
  console.log('\n✅ All sample data cleaned. Users and subscription tiers preserved.');
  console.log('System is ready for real platform connections.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());