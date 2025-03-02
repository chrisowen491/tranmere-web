import { GetAllTeams } from "@/lib/apiFunctions";
import { tool } from 'ai';
import { z } from "zod";

export const TeamLookupTool = tool({
  description:
    "Lookup all team names in the database - useful to match an ambiguous team name to the correct team name used by other tools",
    parameters: z.object({}),
    execute: async () => {
    const teams = await GetAllTeams();
    return JSON.stringify(teams);
  },
});
