import { FastifyInstance, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

const SYSTEM_PROMPT = `You are the OmniReach AI Marketing Strategist. 
You act as a 24/7 marketing strategist, campaign manager, and performance analyst for OmniReach users.
Your goal is to help users grow their social proof and search presence using OmniReach's tools.
You have access to tools for getting campaign stats, creating marketing plans, scheduling content, and analyzing competitors.
Be professional, proactive, and data-driven.`;

export default fp(async (fastify: FastifyInstance) => {
  fastify.get('/ws/chat', { websocket: true }, (connection: any, req: FastifyRequest) => {
    console.log('AI Chat client connected');
    const socket = connection.socket || connection;

    // Send welcome
    socket.send(JSON.stringify({ type: 'message_complete', fullContent: `Hello! I'm your OmniReach AI Marketing Strategist. How can I help you grow your social presence today?`, messageId: 'welcome' }));

    socket.on('message', async (message: any) => {
      try {
        const data = JSON.parse(message.toString());
        const { content } = data;
        if (!content) return;

        // Simulate AI response with marketing tools
        socket.send(JSON.stringify({ type: 'typing_start' }));

        let response = '';
        if (content.toLowerCase().includes('campaign') || content.toLowerCase().includes('stats')) {
          response = `I can help you with your campaign analytics! Here's a quick tip:\n\n**Pro Tip:** To maximize engagement, try A/B testing your content across different platforms. Our analytics show that video content gets **3x more engagement** than static images on Instagram and TikTok.\n\nWant me to pull up your specific campaign stats?`;
        } else if (content.toLowerCase().includes('competitor') || content.toLowerCase().includes('analyze')) {
          response = `Great question about competitive analysis! Here's what I recommend:\n\n1. **Track key metrics**: Follower growth rate, engagement rate, and posting frequency\n2. **Analyze top content**: What type of posts get the most engagement for them?\n3. **Find gaps**: What topics are they missing that your audience would love?\n\nI can run a full competitive analysis for you if you'd like!`;
        } else if (content.toLowerCase().includes('content') || content.toLowerCase().includes('schedule')) {
          response = `Content strategy is key! Here's what works best right now:\n\n📱 **Instagram**: Reels and carousel posts\n🎵 **TikTok**: Short-form educational content\n▶️ **YouTube**: Tutorials and behind-the-scenes\n🐦 **X**: Threads and real-time engagement\n\nI recommend posting **3-5 times per week** per platform for optimal growth.`;
        } else if (content.toLowerCase().includes('follower') || content.toLowerCase().includes('grow') || content.toLowerCase().includes('boost')) {
          response = `Growing your followers requires a multi-channel approach:\n\n1. **Consistent posting** - At least 4x/week per platform\n2. **Engage with your audience** - Reply to comments within 1 hour\n3. **Cross-promote** - Share your content across all platforms\n4. **Use trending sounds/hashtags** - Especially on TikTok and Instagram\n\nOur OmniReach platform can automate and amplify all of this! 🚀`;
        } else {
          response = `Thanks for your question! As your OmniReach AI Marketing Strategist, I can help you with:\n\n📊 **Campaign analytics** - Track performance\n📝 **Content strategy** - Plan your posts\n🔍 **Competitor analysis** - Stay ahead\n📈 **Growth strategies** - Expand your reach\n\nWhat would you like to dive into?`;
        }

        // Simulate streaming
        const words = response.split(' ');
        for (let i = 0; i < words.length; i++) {
          socket.send(JSON.stringify({ type: 'chunk', content: words[i] + ' ' }));
          await new Promise(r => setTimeout(r, 30));
        }

        socket.send(JSON.stringify({ type: 'message_complete', fullContent: response, messageId: `msg_${Date.now()}` }));
      } catch (err) {
        console.error('Chat error:', err);
        socket.send(JSON.stringify({ error: 'Failed to process message' }));
      }
    });

    socket.on('close', () => console.log('AI Chat client disconnected'));
  });
});