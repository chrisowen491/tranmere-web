import { TranmereWebUtils } from './tranmere-web-utils';
import contentful from 'contentful-management';
import { richTextFromMarkdown } from '@contentful/rich-text-from-markdown';
import { ChatOpenAI } from '@langchain/openai';
import type { ChatPromptTemplate } from '@langchain/core/prompts';
import { createOpenAIFunctionsAgent, AgentExecutor } from 'langchain/agents';
import { pull } from 'langchain/hub';

import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';

const llm = new ChatOpenAI({
  model: 'gpt-4-1106-preview',
  verbose: false,
  temperature: 0
});

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
          query: `Write a profile about footballer ${name}, especially focussing on their career with Tranmere Rovers and biographical information. `,
          search_depth: 'basic',
          include_answer: true,
          include_images: false,
          include_raw_content: false,
          max_results: 10
        })
      });

      const response = await request.json();
      //console.log(response.answer)
      return response.answer;
    }
  }),
  new DynamicStructuredTool({
    name: 'tranmere-web-player-updater',
    description: 'Update the TranmereWeb profile of a footballer',
    schema: z.object({
      biography: z.string().describe('A biography of the player'),
      playerName: z.string().describe('The name of  the player'),
      tranmereWebId: z
        .string()
        .describe('The TranmereWeb identifier for the player'),
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
      tranmereWebId,
      placeOfBirth,
      dateOfBirth,
      position,
      height,
      playerName
    }) => {
      const entry = await environment.getEntry(tranmereWebId);
      const document = await richTextFromMarkdown(biography);
      entry.fields.biography = { 'en-GB': document };

      if (placeOfBirth) {
        entry.fields.placeOfBirth = { 'en-GB': placeOfBirth };
      }
      if (position) {
        entry.fields.position = { 'en-GB': position };
      }
      if (height) {
        entry.fields.height = { 'en-GB': height };
      }
      if (dateOfBirth) {
        entry.fields.dateOfBirth = { 'en-GB': dateOfBirth };
      }
      await entry!.update();
      return `${playerName} updated`;
    }
  })
];

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

// With scoped space and environment
const scopedPlainClient = contentful.createClient(
  {
    accessToken: process.env.CF_MANANGEMENT_KEY!
  },
  {
    type: 'plain',
    defaults: {
      spaceId: process.env.CF_SPACE!,
      environmentId: 'master'
    }
  }
);

// entries from '<space_id>' & '<environment_id>'
const entries = await scopedPlainClient.entry.getMany({
  query: {
    skip: 10,
    limit: 600,
    content_type: 'player',
    order: 'sys.updatedAt'
  }
});

const client = contentful.createClient({
  accessToken: process.env.CF_MANANGEMENT_KEY!
});
const space = await client.getSpace(process.env.CF_SPACE!);
const environment = await space.getEnvironment('master');

const utils = new TranmereWebUtils();

export class ProfileBuilder {
  async buildProfiles() {
    let players = await utils.findAllPlayers();

    for (var i = 0; i < players.length; i++) {
      try {
        const cm_entry = entries.items.find(
          (p) => p.fields.name && p.fields.name['en-GB'] === players[i].name
        );
        if (cm_entry && !cm_entry.fields.biography) {
          console.log(players[i].name);
          const result2 = await agentExecutor.invoke({
            input: `Update the TranmereWeb profile for ${players[i].name} who has the tranmereWebId of ${cm_entry.sys.id}`
          });

          console.log(`Got output ${result2.output}`);
        }
      } catch (e) {
        console.log(players[i].name);
      }
    }
  }
}
