import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";

import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, ChatMessage, HumanMessage } from "@langchain/core/messages";
import { createRetrieverTool } from "langchain/tools/retriever";
import { getRequestContext } from "@cloudflare/next-on-pages";
import {
  CloudflareVectorizeStore,
  CloudflareWorkersAIEmbeddings,
} from "@langchain/cloudflare";
import type {
  Fetcher,
} from '@cloudflare/workers-types';
import { BaseRetrieverInterface } from "@langchain/core/retrievers";
import { ResultsTool } from "@/tools/ResultsTool"
import { MatchTool } from "@/tools/MatchTool"



import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { TransferTool } from "@/tools/TransferTool";
import { getSystemPrompt } from "@/prompts/system";

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      messages: VercelChatMessage[]
    };

    const avatar = req.headers.get("x-avatar") ? req.headers.get("x-avatar") : "Generic";

    const messages = (body.messages ?? []).filter(
      (message: VercelChatMessage) =>
        message.role === "user" || message.role === "assistant",
    );
    const returnIntermediateSteps = false;
    const previousMessages = messages
      .slice(0, -1)
      .map(convertVercelMessageToLangChainMessage);
    const currentMessageContent = messages[messages.length - 1].content;

    const chat = new ChatOpenAI({
      modelName: "gpt-4-1106-preview",
      temperature: 0,
      // IMPORTANT: Must "streaming: true" on OpenAI to enable final output streaming below.
      streaming: true,
      configuration: {
        baseURL: "https://gateway.ai.cloudflare.com/v1/5411bb1d842d66317f9306513b9d0093/tranmereweb/openai"
      }
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", getSystemPrompt(avatar)],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    const embeddings = new CloudflareWorkersAIEmbeddings({
      binding: getRequestContext().env.AI as unknown as Fetcher,
      model: "@cf/baai/bge-base-en-v1.5",
    });
    
    
    const db = new CloudflareVectorizeStore(embeddings, {
      index: getRequestContext().env.VECTORIZE_INDEX,
    });
    
    const tools = [
      ResultsTool,
      MatchTool,
      TransferTool,
      createRetrieverTool(db.asRetriever() as unknown as BaseRetrieverInterface, {
        name: "tranmere-player-qa",
        description:
          "Answers questions about Tranmere Rovers players.",
      }),
    ];

    const agent = await createToolCallingAgent({
      llm: chat,
      tools,
      prompt,
    });

    const agentExecutor = new AgentExecutor({
      agent,
      tools,
      // Set this if you want to receive all intermediate steps in the output of .invoke().
      returnIntermediateSteps,
    });

    if (!returnIntermediateSteps) {
      const logStream = await agentExecutor.streamLog({
        input: currentMessageContent,
        chat_history: previousMessages,
      });

      const textEncoder = new TextEncoder();
      const transformStream = new ReadableStream({
        async start(controller) {
          for await (const chunk of logStream) {
            if (chunk.ops?.length > 0 && chunk.ops[0].op === "add") {
              const addOp = chunk.ops[0];
              if (
                addOp.path.startsWith("/logs/ChatOpenAI") &&
                typeof addOp.value === "string" &&
                addOp.value.length
              ) {
                controller.enqueue(textEncoder.encode(addOp.value));
              }
            }
          }
          controller.close();
        },
      });

      return new StreamingTextResponse(transformStream, { headers: {"x-avatar": avatar!} });
    } else {
      const result = await agentExecutor.invoke({
        input: currentMessageContent,
        chat_history: previousMessages,
      });
      return NextResponse.json(
        { output: result.output, intermediate_steps: result.intermediateSteps },
        { status: 200 },
      );
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
