import { openai } from "@ai-sdk/openai";
import { streamText, stepCountIs, convertToModelMessages, UIMessage } from "ai";
import { ResultsTool } from "@tranmere-web/tools/src/ResultsTool";
import { MatchTool } from "@tranmere-web/tools/src/MatchTool";
import { PlayerStatsTool } from "@tranmere-web/tools/src/PlayerStatsTool";
import { TeamLookupTool } from "@tranmere-web/tools/src/TeamLookupTool";
import { PlayerProfileTool } from "@tranmere-web/tools/src/PlayerProfileTool";
import { ManagerTool } from "@tranmere-web/tools/src/ManagerTool";
import { FixturesTool } from "@tranmere-web/tools/src/FixturesTool";
import { LeagueTableTool } from "@tranmere-web/tools/src/LeagueTableTool";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: UIMessage[] };

  const result = streamText({
    model: openai("gpt-4o") as any,
    system: getSystemPrompt("Aldo"),
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      ManagerTool,
      PlayerProfileTool,
      TeamLookupTool,
      PlayerStatsTool,
      MatchTool,
      ResultsTool,
      FixturesTool,
      LeagueTableTool,
    },
  });

  return result.toUIMessageStreamResponse();
}

const getSystemPrompt = function (avatar: string | null) {
  let personality = "";

  switch (avatar) {
    case "Aldo":
      personality =
        "You have the personality of former Liverpool & Tranmere player John Aldridge - and should speak with a thick aggressive scouse accent and make frequent references to Liverpool Football Club";
      break;
    case "Yates":
      personality =
        "You have the personality of former Tranmere player Steve Yates and should speak with a thick west country accent";
      break;
    case "Goodison":
      personality =
        "You have the personality of former Tranmere and Jamaica captain Ian Goodison - you should peak with a laid back Jamaican accent";
      break;
    case "Nors":
      personality =
        "You have the personality of former Tranmere player James Norwood and should speak with a cheeky hampshire accent";
      break;
    case "Muir":
      personality =
        "You have the personality of former Tranmere player Ian Muir and should speak with a thick Brummie accent";
      break;
    case "Generic":
      personality =
        "Your personality is a person from the Wirral with a slightly posh scouse accent!";
  }

  const AGENT_SYSTEM_TEMPLATE = `You are a chatbot for fans of Tranmere Rovers Football Club.
    ${personality}
    You should only use the knowledge provided as context and should stick to questions about Tranmere Rovers. 
    This season is 2024/25 and the current date is ${new Date()}. ALways use YYYY-MM-DD date formats. Return text only - don't try and show images.
    If you do not know the answer do not try and guess.
    `;

  return AGENT_SYSTEM_TEMPLATE;
};
