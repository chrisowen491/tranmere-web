import { TranmereWebUtils } from './tranmere-web-utils';
import contentful from 'contentful-management';
import { richTextFromMarkdown } from '@contentful/rich-text-from-markdown';

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
    order: '-sys.createdAt'
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

    for (var i = 0; i < 100; i++) {
      try {
        const cm_entry = entries.items.find(
          (p) => p.fields.name && p.fields.name['en-GB'] === players[i].name
        );
        if (cm_entry && !cm_entry.fields.biography) {
          const request = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              api_key: process.env.TAVILY_API_KEY,
              query: `Write a profile about footballer ${players[i].name}, especially focussing on their career with Tranmere Rovers. `,
              search_depth: 'basic',
              include_answer: true,
              include_images: false,
              include_raw_content: false,
              max_results: 10
            })
          });

          const response = await request.json();

          //await cm_entry!.update();
          const entry = await environment.getEntry(cm_entry.sys.id);
          const document = await richTextFromMarkdown(response.answer);
          entry.fields.biography = { 'en-GB': document };
          await entry!.update();
          //await entry!.publish();
          console.log(players[i].name);
        }
      } catch (e) {
        console.log(players[i].name);
      }
    }
  }
}
