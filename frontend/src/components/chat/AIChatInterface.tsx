import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useChat } from '../../hooks/useChat';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { clsx } from 'clsx';

export default function AIChatInterface() {
  const { messages, isConnected, isTyping, currentStreamingMessage, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && isConnected) {
      sendMessage(input);
      setInput('');
    }
  };

  const suggestions = [
    { label: "📊 Show my campaign stats", text: "Show me the latest statistics for my active campaigns." },
    { label: "📝 Create a marketing plan", text: "Help me create a marketing plan for a new Instagram campaign." },
    { label: "🔍 Analyze competitor", text: "Analyze the top competitor in the fashion niche on TikTok." }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">AI Marketing Strategist</h2>
            <div className="flex items-center gap-1.5">
              <div className={clsx("w-2 h-2 rounded-full", isConnected ? "bg-green-500" : "bg-red-500 animate-pulse")} />
              <span className="text-xs text-gray-500">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && !currentStreamingMessage && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-6">
            <div className="p-4 bg-blue-50 rounded-2xl">
              <Sparkles className="w-12 h-12 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">How can I help you today?</h3>
              <p className="text-gray-500 mt-2">I can analyze your campaigns, suggest new strategies, or help you understand your audience better.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 w-full">
              {suggestions.map((s, i) => (
                <button 
                  key={i}
                  onClick={() => sendMessage(s.text)}
                  className="px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-blue-300 transition-all text-left flex items-center justify-between group"
                >
                  {s.label}
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500" />
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={clsx("flex gap-4", m.role === 'user' ? "flex-row-reverse" : "flex-row")}>
            <div className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
              m.role === 'user' ? "bg-gray-100 text-gray-600" : "bg-blue-100 text-blue-600"
            )}>
              {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div className={clsx(
              "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
              m.role === 'user' ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-800"
            )}>
              <div className="prose prose-sm max-w-none prose-p:leading-relaxed">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
              
              {m.tool_calls && m.tool_calls.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  {m.tool_calls.map((tc: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      <RefreshCw size={12} className="animate-spin" />
                      Executing: {tc.function.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {currentStreamingMessage && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-1">
              <Bot size={18} />
            </div>
            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-50 text-gray-800 shadow-sm">
              <div className="prose prose-sm max-w-none prose-p:leading-relaxed">
                <ReactMarkdown>{currentStreamingMessage}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {isTyping && !currentStreamingMessage && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-1">
              <Bot size={18} />
            </div>
            <div className="bg-gray-50 rounded-2xl px-4 py-3 flex gap-1 items-center shadow-sm">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-50 bg-gray-50/50">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            placeholder={isConnected ? "Ask anything..." : "Connecting to strategist..."}
            disabled={!isConnected}
            className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={!input.trim() || !isConnected}
            className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors shadow-md"
          >
            <Send size={20} />
          </button>
        </form>
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          AI can make mistakes. Verify important marketing decisions.
        </p>
      </div>
    </div>
  );
}
