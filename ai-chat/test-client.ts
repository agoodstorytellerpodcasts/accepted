import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3000/ws/chat');

ws.on('open', () => {
  console.log('Connected to server');
  ws.send(JSON.stringify({
    content: 'How is my Instagram campaign doing?',
    sessionId: 'session-123',
    userId: 'user-456'
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString());
  console.log('Received:', message);
  if (message.type === 'final') {
    ws.close();
  }
});

ws.on('close', () => {
  console.log('Disconnected from server');
});

ws.on('error', (err) => {
  console.error('WebSocket error:', err);
});
