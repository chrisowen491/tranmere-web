import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { createClient } from 'contentful-management';
import { richTextFromMarkdown } from '@contentful/rich-text-from-markdown';
import { ChatOpenAI } from '@langchain/openai';
import type { ChatPromptTemplate } from '@langchain/core/prompts';
import { createOpenAIFunctionsAgent, AgentExecutor } from 'langchain/agents';
import { pull } from 'langchain/hub';
import { TranmereWebUtils } from '../lib/tranmere-web-utils';
import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';

const llm = new ChatOpenAI({
  model: 'gpt-4-1106-preview',
  verbose: false,
  temperature: 0
});

const client = createClient({
  accessToken: process.env.CF_MANANGEMENT_KEY!
});

let utils = new TranmereWebUtils();

const tools = [
  new DynamicStructuredTool({
    name: 'player-biography',
    description:
      'gets biographical information about Tranmere Rovers footballers',
    schema: z.object({
      name: z.string().describe('The name of the player')
    }),
    func: async ({ name }) => {
      const request = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query: `Write a profile about footballer ${name}, especially focussing on their career with Tranmere Rovers and biographical information.`,
          search_depth: 'basic',
          include_answer: true,
          include_images: false,
          include_raw_content: false,
          max_results: 10
        })
      });

      const response = await request.json();
      return response.answer;
    }
  }),
  new DynamicStructuredTool({
    name: 'tranmere-web-player-creator',
    description: 'Create a TranmereWeb profile for a footballer',
    schema: z.object({
      biography: z.string().describe('A biography of the player'),
      playerName: z.string().describe('The name of  the player'),
      placeOfBirth: z
        .string()
        .nullable()
        .describe('The birth place of this player'),
      dateOfBirth: z
        .string()
        .nullable()
        .describe('The date of birth of the player in ISO 8601 format'),
      height: z.string().nullable().describe('The height of the player'),
      position: z
        .enum([
          'Goalkeeper',
          'Striker',
          'Midfielder',
          'Winger',
          'Full Back',
          'Central Defender',
          'Central Midfielder'
        ])
        .nullable()
        .describe('The position the players as a footballer')
    }),
    func: async ({
      biography,
      placeOfBirth,
      dateOfBirth,
      position,
      height,
      playerName
    }) => {
      const space = await client.getSpace(process.env.CF_SPACE!);
      const environment = await space.getEnvironment('master');

      const document = await richTextFromMarkdown(biography);
      let entry = await environment.createEntry('player', {
        fields: {
          name: {
            'en-GB': playerName
          },
          biography: {
            'en-GB': document
          },
          picLink: {
            'en-GB':
              'https://www.tranmere-web.com/builder/2023/simple/cccccc/none/cccccc/cccccc/none/cccccc'
          },
          placeOfBirth: {
            'en-GB': placeOfBirth
          },
          position: {
            'en-GB': position
          },
          height: {
            'en-GB': height
          },
          dateOfBirth: {
            'en-GB': dateOfBirth
          }
        }
      });

      entry = await entry.publish();
      console.log(entry.sys.id);
      return `${playerName} created`;
    }
  })
];

exports.handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const playerName = event.pathParameters!.playerName;
  console.log('Received event:', event);
  const prompt = await pull<ChatPromptTemplate>(
    'hwchase17/openai-functions-agent'
  );

  const agent = await createOpenAIFunctionsAgent({
    llm,
    tools,
    prompt
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: false
  });
  const result2 = await agentExecutor.invoke({
    input: `Create a TranmereWeb profile for ${playerName} filling as much information as possible.`
  });

  return utils.sendResponse(200, result2.output);
};
