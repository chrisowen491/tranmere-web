import { DynamicTool } from "@langchain/core/tools";
import { PlayerSeasonSummary } from "./types";

export const tools = [
  new DynamicTool({
    name: "player-info",
    description:
      "gets Tranmere Rovers player information. Input should be a player name",
    func: async (input) => {
      const search = await fetch(
        "https://api.prod.tranmere-web.com/player-search/?season=2023&sort=&filter=",
        { method: "GET" },
      );

      const results = (await search.json()) as unknown as {
        players: PlayerSeasonSummary[];
      };

      const player = results.players.find(
        (p) => p.Player.toLowerCase() === input.toLowerCase(),
      );

      return JSON.stringify(player);
    },
  }),
];
