import { OpenAI } from 'openai';

export const marketingTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_campaign_stats',
      description: 'Get statistics for a specific marketing campaign',
      parameters: {
        type: 'object',
        properties: {
          campaign_id: { type: 'string', description: 'The ID of the campaign' },
        },
        required: ['campaign_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_marketing_plan',
      description: 'Create a customized marketing plan based on business goals',
      parameters: {
        type: 'object',
        properties: {
          goals: { type: 'string', description: 'The goals of the marketing plan' },
        },
        required: ['goals'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'schedule_content',
      description: 'Schedule a social media post',
      parameters: {
        type: 'object',
        properties: {
          platform: { type: 'string', enum: ['instagram', 'tiktok', 'youtube', 'x', 'facebook'] },
          content: { type: 'string', description: 'The content of the post' },
          time: { type: 'string', description: 'The scheduled time (ISO 8601)' },
        },
        required: ['platform', 'content', 'time'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'analyze_competitor',
      description: 'Analyze a competitor social media handle',
      parameters: {
        type: 'object',
        properties: {
          handle: { type: 'string', description: 'The social media handle of the competitor' },
        },
        required: ['handle'],
      },
    },
  },
];
