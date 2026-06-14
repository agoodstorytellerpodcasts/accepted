import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'error';
  tool_calls?: any[];
}

export function useChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<string>('');
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9));
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws/chat';
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      setIsConnected(true);
      console.log('Chat WebSocket connected');
    };

    socket.onclose = () => {
      setIsConnected(false);
      console.log('Chat WebSocket disconnected');
      // Attempt reconnect after 3 seconds
      setTimeout(connect, 3000);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'chunk') {
        setCurrentStreamingMessage((prev) => prev + data.content);
      } else if (data.type === 'final') {
        const newMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          role: 'assistant',
          content: data.content,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newMessage]);
        setCurrentStreamingMessage('');
        setIsTyping(false);
      } else if (data.type === 'tool_call') {
        // Handle tool call indication if needed
        console.log('AI Tool Call:', data.content);
      }
    };

    socketRef.current = socket;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      socketRef.current?.close();
    };
  }, [connect]);

  const sendMessage = useCallback((content: string) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    setMessages((prev) => [...prev, userMessage]);
    socketRef.current.send(JSON.stringify({ 
      type: 'message', 
      content,
      userId: user?.id,
      sessionId
    }));
    setIsTyping(true);
  }, [user, sessionId]);

  return {
    messages,
    isConnected,
    isTyping,
    currentStreamingMessage,
    sendMessage,
  };
}
