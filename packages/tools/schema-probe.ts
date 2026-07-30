import type { FlexibleSchema } from "@ai-sdk/provider-utils";
import { tool } from "ai";
import { z } from "zod";

const base = z.object({
  opposition: z.string(),
});

const withOptional = z.object({
  season: z.number().optional(),
  opposition: z.string(),
});

const withSort = z.object({
  season: z.number().optional(),
  sort: z.enum(["Oldest", "Most Recent", "Top Attendance"]).default("Most Recent"),
  opposition: z.string(),
});

const withAllFields = z.object({
  season: z.number().optional(),
  sort: z.enum(["Oldest", "Most Recent", "Top Attendance"]).default("Most Recent"),
  venue: z.enum(["Prenton Park", "Wembley Stadium", "Any"]),
  opposition: z.string(),
  limit: z.number().default(100),
});

const checks: FlexibleSchema[] = [base, withOptional, withSort, withAllFields];
void checks;

tool({
  inputSchema: withAllFields,
  execute: async ({ season, sort, venue, opposition, limit }) =>
    JSON.stringify({ season, sort, venue, opposition, limit }),
});
