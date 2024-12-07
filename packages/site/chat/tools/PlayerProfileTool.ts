import { PlayerProfile } from "@/lib/types";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export const PlayerProfileTool = new DynamicStructuredTool({
  name: "tranmere-web-player-profile-tool",
  description:
    "Get a full biogropahy of a tranmere rovers player including appearances and goals.",
  schema: z.object({
    player: z.string().describe("The player name "),
  }),
  func: async ({ player }) => {
    const query = await fetch(
      `https://api.tranmere-web.com/page/player/${player}`,
    );

    const profile = (await query.json()) as PlayerProfile;
    delete profile.appearances;

    return JSON.stringify(profile);
  },
});
