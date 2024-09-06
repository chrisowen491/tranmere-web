import { DynamicStructuredTool } from "@langchain/core/tools";
import { v4 as uuidv4 } from 'uuid';
import { z } from "zod";

export const InsertLinkTool = new DynamicStructuredTool({
    name: 'tranmere-web-insert-transfers-tool',
    description: 'Add related links to our player database',
    schema: z.object({
        player: z
        .string()
        .describe(
          'The name of the player the link is about'
        ),
        link: z
        .string()
        .describe(
          'The url of the link'
        ),
        description: z
        .string()
        .describe(
          'The display text of the link'
        )
    }),
    func: async ({
      player,
      link,
      description
    }) => {
      const querystring = encodeURIComponent(
        `{addTranmereWebPlayerLinks(id:"${uuidv4()}" name:"${player}" link:"${link}" description:"${description}"){id name link description}}`,
      );
      const query = await fetch(`https://api.prod.tranmere-web.com/graphql?mutation=${querystring}`)

      const results = await query.json()
      return JSON.stringify(results);
    }
  })