import 'react';
import AIChatInterface from '../components/chat/AIChatInterface';

export default function Chat() {
  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Chat Assistant</h1>
        <p className="text-gray-500">Your 24/7 real-time marketing strategist and analyst.</p>
      </div>
      <AIChatInterface />
    </div>
  );
}
