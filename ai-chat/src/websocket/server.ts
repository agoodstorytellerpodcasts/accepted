import { FastifyRequest } from 'fastify';
import { processChatMessage } from '../openai/client.js';

export function handleConnection(connection: any, req: FastifyRequest) {
  console.log('New client connected');
  const socket = connection.socket || connection;

  socket.on('message', async (message: any) => {
    try {
      const data = JSON.parse(message.toString());
      const { content, sessionId, userId } = data;

      if (!content) {
        socket.send(JSON.stringify({ error: 'Message content is required' }));
        return;
      }

      // TODO: Authenticate user via JWT from request or token in message

      console.log(`Received message from user ${userId}: ${content}`);

      // Process message with LLM
      await processChatMessage(content, sessionId, userId, (chunk) => {
        socket.send(JSON.stringify({ type: 'chunk', content: chunk }));
      }, (finalResponse) => {
        socket.send(JSON.stringify({ type: 'final', content: finalResponse }));
      }, (toolCall) => {
        socket.send(JSON.stringify({ type: 'tool_call', content: toolCall }));
      });

    } catch (err) {
      console.error('Error handling message:', err);
      socket.send(JSON.stringify({ error: 'Failed to process message' }));
    }
  });

  socket.on('close', () => {
    console.log('Client disconnected');
  });
}
