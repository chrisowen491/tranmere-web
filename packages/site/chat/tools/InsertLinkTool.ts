import { DynamicStructuredTool } from "@langchain/core/tools";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export const InsertLinkTool = new DynamicStructuredTool({
  name: "tranmere-web-insert-link-tool",
  description: "Add related links to our player database",
  schema: z.object({
    player: z.string().describe("The name of the player the link is about"),
    link: z.string().describe("The url of the link"),
    description: z.string().describe("The display text of the link"),
  }),
  func: async ({ player, link, description }) => {
    const body = {
      query: `mutation MyMutation { addTranmereWebPlayerLinks(description: "${description}", id: "${uuidv4()}", link: "${link}", name: "${player}") { id } }`,
      variables: null,
      operationName: "MyMutation",
    };

    const query = await fetch(`https://api.tranmere-web.com/graphql`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(query.status);
    console.log(JSON.stringify(body));
    console.log(await query.text());
    if (query.status !== 200) {
      return "Link not added";
    } else {
      return "Link added";
    }
  },
});
