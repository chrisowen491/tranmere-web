import { GetAllTeams } from "@/lib/apiFunctions";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export const TeamLookupTool = new DynamicStructuredTool({
  name: "tranmere-web-team-lookup-tool",
  description:
    "Lookup all team names in the database - useful to match an ambiguous team name to the correct team name used by other tools",
  schema: z.object({}),
  func: async () => {
    const teams = await GetAllTeams();
    return JSON.stringify(teams);
  },
});
