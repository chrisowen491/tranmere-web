export const runtime = "edge";

import { openai } from '@ai-sdk/openai';
import { CoreMessage, streamText } from 'ai';
import { getSystemPrompt } from "@/chat/prompts/system";
import { ResultsTool } from "@/chat/tools/ResultsTool";
import { MatchTool } from "@/chat/tools/MatchTool";
import { PlayerStatsTool } from "@/chat/tools/PlayerStatsTool";
import { InsertLinkTool } from "@/chat/tools/InsertLinkTool";
import { InsertTransferTool } from "@/chat/tools/InsertTransferTool";
import { TeamLookupTool } from "@/chat/tools/TeamLookupTool";
import { PlayerProfileTool } from "@/chat/tools/PlayerProfileTool";
import { ManagerTool } from "@/chat/tools/ManagerTool";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: CoreMessage[] };



  const result = streamText({
    model: openai('gpt-4o'),
    system: getSystemPrompt("Goodison"),
    messages,
    maxSteps: 10,
    tools: {
      ManagerTool,
      PlayerProfileTool,
      TeamLookupTool,
      PlayerStatsTool,
      MatchTool,
      ResultsTool
    }
  });

  return result.toDataStreamResponse();
}