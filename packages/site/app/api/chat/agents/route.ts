import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage } from "ai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, ChatMessage, HumanMessage } from "@langchain/core/messages";
import { ResultsTool } from "@/chat/tools/ResultsTool";
import { MatchTool } from "@/chat/tools/MatchTool";

import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { TransferTool } from "@/chat/tools/TransferTool";
import { getSystemPrompt } from "@/chat/prompts/system";
import { PlayerStatsTool } from "@/chat/tools/PlayerStatsTool";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { InsertLinkTool } from "@/chat/tools/InsertLinkTool";
import { InsertTransferTool } from "@/chat/tools/InsertTransferTool";
import { TeamLookupTool } from "@/chat/tools/TeamLookupTool";
import { PlayerProfileTool } from "@/chat/tools/PlayerProfileTool";

export const runtime = "edge";

const convertVercelMessageToLangChainMessage = (message: VercelChatMessage) => {
  if (message.role === "user") {
    return new HumanMessage(message.content);
  } else if (message.role === "assistant") {
    return new AIMessage(message.content);
  } else {
    return new ChatMessage(message.content, message.role);
  }
};

const avatarMap = new Map();
avatarMap.set("Generic", "/images/1989a.png");
avatarMap.set(
  "Aldo",
  "/builder/1991/side-parting/ffd3b3/thick-tache/7f3f00/fcb98b/none/bc8a00",
);
avatarMap.set(
  "Nors",
  "/builder/2018/balding/ffd3b3/small-beard/512904/fcb98b/none/8e740c",
);
avatarMap.set(
  "Goodison",
  "builder/2010/dreads/7f3f00/none/000000/5b2d01/none/8e740c",
);
avatarMap.set(
  "Yates",
  "/builder/2000/mousse/ffd3b3/none/efef64/fcb98b/none/bc8a00",
);
avatarMap.set(
  "Muir",
  "/builder/1989/side-parting-left-small/ffd3b3/none/bc9d00/fcb98b/none/bc8a00",
);

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      messages: VercelChatMessage[];
    };

    const avatar = req.headers.get("x-avatar")
      ? req.headers.get("x-avatar")
      : "Generic";

    const messages = (body.messages ?? []).filter(
      (message: VercelChatMessage) =>
        message.role === "user" || message.role === "assistant",
    );

    const previousMessages = messages
      .slice(0, -1)
      .map(convertVercelMessageToLangChainMessage);
    const currentMessageContent = messages[messages.length - 1].content;

    const model = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0,
      // IMPORTANT: Must "streaming: true" on OpenAI to enable final output streaming below.
      streaming: true,
      verbose: false,
      configuration: {
        baseURL:
          "https://gateway.ai.cloudflare.com/v1/5411bb1d842d66317f9306513b9d0093/tranmereweb/openai",
      },
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", getSystemPrompt(avatar)],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    const tools = [
      ResultsTool,
      TeamLookupTool,
      MatchTool,
      TransferTool,
      PlayerProfileTool,
      PlayerStatsTool,
      InsertLinkTool,
      InsertTransferTool,
    ];

    const agent = createToolCallingAgent({
      llm: model as unknown as BaseChatModel,
      tools,
      prompt,
    });

    const agentExecutor = new AgentExecutor({
      agent,
      tools,
      returnIntermediateSteps: true,
      maxIterations: 3,
    });

    const result = await agentExecutor.invoke({
      input: currentMessageContent,
      chat_history: previousMessages,
    });

    //console.log(result.intermediateSteps);

    return NextResponse.json(
      {
        output: result.output,
        intermediate_steps: result.intermediateSteps,
        avatar: avatarMap.get(avatar),
      },
      { status: 200 },
    );
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
