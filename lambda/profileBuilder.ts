import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createClient } from 'contentful-management';
import { richTextFromMarkdown } from '@contentful/rich-text-from-markdown';
import { ChatOpenAI } from '@langchain/openai';
import type { ChatPromptTemplate } from '@langchain/core/prompts';
import { createOpenAIFunctionsAgent, AgentExecutor } from 'langchain/agents';
import { pull } from 'langchain/hub';
import { TranmereWebUtils, DataTables } from '../lib/tranmere-web-utils';
import { z } from 'zod';
import { DynamicStructuredTool, DynamicTool } from '@langchain/core/tools';
import { TavilyResponse } from '../lib/tranmere-web-types';
import { v4 as uuidv4 } from 'uuid';

const llm = new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 0.5,
  configuration: {
    baseURL:
      'https://gateway.ai.cloudflare.com/v1/5411bb1d842d66317f9306513b9d0093/tranmereweb/openai'
  }
});

const client = createClient({
  accessToken: process.env.CF_MANANGEMENT_KEY!
});

const utils = new TranmereWebUtils();

const tools = [
  new DynamicTool({
    name: 'player-research',
    description:
      'gets research information about a Tranmere Rovers footballer. Input should be a player name',
    func: async (input) => {
      const request = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_key: process.env.TAVILY_API_KEY,
          query: `Write a profile about footballer ${input}, especially focussing on their career with Tranmere Rovers and other relevant biographical information.`,
          search_depth: 'basic',
          include_answer: true,
          include_images: false,
          include_raw_content: true,
          max_results: 10
        })
      });

      const response = (await request.json()) as TavilyResponse;
      return JSON.stringify({
        research: response.answer,
        links: response.results.forEach((link) => {
          return { link: link.url, title: link.title };
        })
      });
    }
  }),
  new DynamicTool({
    name: 'player-statistics',
    description:
      'gets Tranmere Rovers appearance information a footballer. Input should be a player name',
    func: async (input) => {
      const summary = await utils.getPlayerSummaryForSeason(input, 'TOTAL');
      return `Apearance Data: ${input} made ${summary!.Apps} appearances for Tranmere Rovers, including ${summary!.starts} starts, ${summary!.subs} substitute appearnces. They scored ${summary!.goals}.`;
    }
  }),
  new DynamicTool({
    name: 'player-transfers',
    description:
      'gets Tranmere Rovers transfer information a footballer. Input should be a player name',
    func: async (input) => {
      const transfers = await utils.getPlayerTransfers(input);
      let output = `Tranmere Transfer History:\n`;
      for (const transfer of transfers!) {
        output += `From: ${transfer.from}, To: ${transfer.to}, Date: ${transfer.season}, Value: ${transfer.value} \n`;
      }
      return output;
    }
  }),
  new DynamicTool({
    name: 'player-debut',
    description:
      'gets debut information about a Tranmere Rovers footballer. Input should be a player name',
    func: async (input) => {
      const appearances = await utils.getAppsByPlayer(input);
      return `Debut Data: ${input} made their Tranmere debut v ${appearances[0].Opposition} on ${appearances[0].Date}. They scored ${appearances[0].Goals} goals`;
    }
  }),
  new DynamicStructuredTool({
    name: 'tranmere-web-player-creator',
    description: 'Create a TranmereWeb profile for a footballer',
    schema: z.object({
      biography: z
        .string()
        .describe(
          'A brief biography of the player - should be sourced using a combination of research, statistical, transfer and debut information'
        ),
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
          'Winger',
          'Full Back',
          'Central Defender',
          'Central Midfielder',
          'Midfielder'
        ])
        .nullable()
        .describe('The position the players as a footballer'),
      links: z
        .object({
          url: z.string().describe('The hyperlink url'),
          sitename: z.string().describe('The name of the website')
        })
        .array()
        .describe('A list of hyperlinks with information about this player')
    }),
    func: async ({
      biography,
      placeOfBirth,
      dateOfBirth,
      position,
      height,
      playerName,
      links
    }) => {
      const space = await client.getSpace(process.env.CF_SPACE!);
      const environment = await space.getEnvironment('master');

      const player = await utils.getPlayer(playerName!);
      const document = await richTextFromMarkdown(biography);

      const new_position =
        position === 'Midfielder' ? 'Central Midfielder' : position;

      if (player) {
        let entry = await environment.getEntry(player.id!);
        (entry.fields.biography = {
          'en-GB': document
        }),
          (entry.fields.placeOfBirth = {
            'en-GB': placeOfBirth
          }),
          (entry.fields.position = {
            'en-GB': new_position
          }),
          (entry.fields.height = {
            'en-GB': height
          }),
          (entry.fields.dateOfBirth = {
            'en-GB': dateOfBirth
          });

        entry = await entry.update();
        entry = await entry.publish();
      } else {
        const pic =
          position === 'Goalkeeper'
            ? 'https://www.tranmere-web.com/builder/1981gk/simple/cccccc/none/cccccc/cccccc/none/cccccc'
            : 'https://www.tranmere-web.com/builder/2023/simple/cccccc/none/cccccc/cccccc/none/cccccc';

        const entry = await environment.createEntry('player', {
          fields: {
            name: {
              'en-GB': playerName
            },
            biography: {
              'en-GB': document
            },
            picLink: {
              'en-GB': pic
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

        await entry.publish();
      }

      const db_links = await utils.getPlayerLinks(playerName!);

      for (const link of links) {
        if (!db_links.find((db_link) => db_link.link == link.url)) {
          const item = {
            id: uuidv4(),
            name: playerName,
            link: link.url,
            description: link.sitename
          };

          await utils.insertUpdateItem(item, DataTables.LINKS_TABLE);
        }
      }
      return `${playerName} created`;
    }
  })
];

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const playerName = event.pathParameters!.playerName;
  console.log('Received event:', event);

  const prompt = await pull<ChatPromptTemplate>(
    'hwchase17/openai-functions-agent'
  );

  const agent = await createOpenAIFunctionsAgent({
    llm,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: false,
    returnIntermediateSteps: true,
  });

  const result2 = await agentExecutor.invoke({
    input: `Create a TranmereWeb profile for ${decodeURIComponent(playerName!)} filling as much information as possible. If no research infomration can be found, use the provided debut, appearance and transfer data to build a biograohy.`
  });

  return utils.sendResponse(200, result2.output);
};
