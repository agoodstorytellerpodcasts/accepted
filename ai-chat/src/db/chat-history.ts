export async function saveMessage(sessionId: string, userId: string, role: string, content: string, toolCalls?: any) {
  console.log(`Saving message to DB: [${role}] ${content.substring(0, 50)}...`);
  // Mock saving to PostgreSQL
  return { id: Math.random().toString(36).substring(7), sessionId, userId, role, content, toolCalls, timestamp: new Date() };
}

export async function getSessionHistory(sessionId: string) {
  console.log(`Retrieving history for session ${sessionId}`);
  // Mock retrieving from PostgreSQL
  return [];
}
