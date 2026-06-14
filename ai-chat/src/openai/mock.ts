export class MockOpenAI {
  chat = {
    completions: {
      create: async (params: any) => {
        if (params.stream) {
          return (async function* () {
            yield { choices: [{ delta: { content: 'This is a ' } }] };
            yield { choices: [{ delta: { content: 'mocked ' } }] };
            yield { choices: [{ delta: { content: 'response.' } }] };
            if (params.messages[params.messages.length - 1].content.toLowerCase().includes('instagram')) {
               yield { choices: [{ delta: { tool_calls: [{ index: 0, id: 'call_123', function: { name: 'get_campaign_stats', arguments: '{"campaign_id": "insta-001"}' } }] } }] };
            }
          })();
        } else {
          return {
            choices: [{
              message: {
                content: 'Based on the stats, your Instagram campaign is doing great!'
              }
            }]
          };
        }
      }
    }
  };
}
