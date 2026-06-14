import prisma from '../db/prisma.js';

export class ChatService {
  async listSessions(userId: string) {
    return prisma.chatSession.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
  }

  async getSessionMessages(userId: string, sessionId: string) {
    // Verify ownership
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, user_id: userId }
    });
    
    if (!session) return null;

    return prisma.chatMessage.findMany({
      where: { session_id: sessionId },
      orderBy: { timestamp: 'asc' }
    });
  }

  async createSession(userId: string, title?: string) {
    return prisma.chatSession.create({
      data: {
        user_id: userId,
        title
      }
    });
  }

  async deleteSession(userId: string, sessionId: string) {
    return prisma.chatSession.delete({
      where: { id: sessionId, user_id: userId }
    });
  }

  async addMessage(sessionId: string, data: { role: string; content: string; tool_calls_json?: any }) {
    return prisma.chatMessage.create({
      data: {
        session_id: sessionId,
        ...data
      }
    });
  }
}
