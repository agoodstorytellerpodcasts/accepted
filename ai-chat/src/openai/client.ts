import OpenAI from 'openai';
import { marketingTools } from '../tools/marketing-tools.js';
import { saveMessage, getSessionHistory } from '../db/chat-history.js';
import { cacheContext, getCachedContext } from '../cache/redis-context.js';
import { MockOpenAI } from './mock.js';

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : new MockOpenAI() as unknown as OpenAI;

const SYSTEM_PROMPT = `You are the OmniReach AI Marketing Strategist. 
You act as a 24/7 marketing strategist, campaign manager, and performance analyst for OmniReach users.
Your goal is to help users grow their social proof and search presence using OmniReach's tools.
You have access to tools for getting campaign stats, creating marketing plans, scheduling content, and analyzing competitors.
Be professional, proactive, and data-driven.`;

const MAX_HISTORY_MESSAGES = 10;

export async function processChatMessage(
  content: string,
  sessionId: string,
  userId: string,
  onChunk: (chunk: string) => void,
  onFinal: (final: string) => void,
  onToolCall: (toolCall: any) => void
) {
  // Try to get context from cache, then DB
  let messages: any[] = await getCachedContext(sessionId) || await getSessionHistory(sessionId);
  
  if (messages.length === 0) {
    messages.push({ role: 'system', content: SYSTEM_PROMPT });
  }

  // Conversation history management: truncation
  if (messages.length > MAX_HISTORY_MESSAGES) {
    const systemMessage = messages.find(m => m.role === 'system');
    const recentMessages = messages.slice(-MAX_HISTORY_MESSAGES);
    messages = systemMessage ? [systemMessage, ...recentMessages] : recentMessages;
    console.log(`Truncated history for session ${sessionId} to ${messages.length} messages`);
  }
  
  messages.push({ role: 'user', content });

  // Save user message to DB
  await saveMessage(sessionId, userId, 'user', content);

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o', // or gpt-3.5-turbo
      messages,
      tools: marketingTools,
      stream: true,
    });

    let fullResponse = '';
    let currentToolCalls: any[] = [];

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;

      if (delta?.content) {
        fullResponse += delta.content;
        onChunk(delta.content);
      }

      if (delta?.tool_calls) {
        // Handle tool calls in streaming
        for (const toolCall of delta.tool_calls) {
          if (!currentToolCalls[toolCall.index!]) {
            currentToolCalls[toolCall.index!] = {
              id: toolCall.id,
              type: 'function',
              function: { name: '', arguments: '' }
            };
          }
          if (toolCall.function?.name) {
            currentToolCalls[toolCall.index!].function.name += toolCall.function.name;
          }
          if (toolCall.function?.arguments) {
            currentToolCalls[toolCall.index!].function.arguments += toolCall.function.arguments;
          }
        }
      }
    }

    if (currentToolCalls.length > 0) {
      for (const toolCall of currentToolCalls) {
        onToolCall(toolCall);
        // In a real implementation, we would execute the tool and send the result back to the LLM
        // For now, we'll just simulate the tool execution result
        const toolResult = await executeTool(toolCall.function.name, JSON.parse(toolCall.function.arguments));
        
        // Push tool result to messages and get a final response from LLM
        messages.push({ role: 'assistant', content: fullResponse, tool_calls: currentToolCalls });
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult)
        });

        const finalResponse = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages,
        });

        const finalContent = finalResponse.choices[0].message.content;
        if (finalContent) {
           onFinal(finalContent);
           await saveMessage(sessionId, userId, 'assistant', finalContent, currentToolCalls);
           messages.push({ role: 'assistant', content: finalContent });
        }
      }
    } else {
      onFinal(fullResponse);
      await saveMessage(sessionId, userId, 'assistant', fullResponse);
      messages.push({ role: 'assistant', content: fullResponse });
    }

    // Cache the updated conversation context
    await cacheContext(sessionId, messages);

  } catch (err) {
    console.error('OpenAI API Error:', err);
    throw err;
  }
}

async function executeTool(name: string, args: any) {
  console.log(`Executing tool ${name} with args:`, args);
  // Simulate tool execution
  switch (name) {
    case 'get_campaign_stats':
      return { status: 'success', stats: { impressions: 1200, clicks: 45, conversions: 5 } };
    case 'create_marketing_plan':
      return { status: 'success', plan: `Marketing plan for ${args.goals} created.` };
    case 'schedule_content':
      return { status: 'success', message: `Content scheduled on ${args.platform} for ${args.time}.` };
    case 'analyze_competitor':
      return { status: 'success', analysis: `Competitor ${args.handle} is growing fast on TikTok.` };
    default:
      return { status: 'error', message: 'Tool not found' };
  }
}
