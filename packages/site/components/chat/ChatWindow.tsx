"use client";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useChat } from "ai/react";
import { useRef, useState } from "react";
import type { FormEvent } from "react";

import { ChatMessageBubble } from "@/components/chat/ChatMessageBubble";
import {
  ComplexChatResponse,
  ExtendedMessage,
  MatchPageData,
} from "../../lib/types";
import { PlayerSeasonSummary } from "@tranmere-web/lib/src/tranmere-web-types";
import { SubmitButton } from "@/components/forms/SubmitButton";

export function ChatWindow(props: {
  endpoint: string;
  placeholder?: string;
  showIngestForm?: boolean;
}) {
  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  const {
    endpoint,
    placeholder,
  } = props;
  const [intermediateStepsLoading, setIntermediateStepsLoading] =
    useState(false);

  const [avatar, setAvatar] = useState<string>("Generic");

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAvatar(e.target.value);
  };

  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading: chatEndpointIsLoading,
    setMessages,
  } = useChat({
    api: endpoint,
    headers: {
      "x-avatar": avatar,
    },
    streamMode: "text",
    onError: (e) => {
      toast(e.message, {
        theme: "dark",
      });
    },
  });

  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (messageContainerRef.current) {
      messageContainerRef.current.classList.add("grow");
    }
    if (!messages.length) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    if (chatEndpointIsLoading) {
      return;
    }
    const showIntermediateSteps = true;
    if (!showIntermediateSteps) {
      handleSubmit(e);
      // Some extra work to show intermediate steps properly
    } else {
      setIntermediateStepsLoading(true);
      setInput("");
      const messagesWithUserReply = messages.concat({
        id: messages.length.toString(),
        content: input,
        role: "user",
      });
      setMessages(messagesWithUserReply);
      const response = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
          messages: messagesWithUserReply.map((m) => {
            return {
              content: m.content,
              id: m.content,
              role: m.role,
            };
          }),
        }),
        headers: {
          "x-avatar": avatar,
        },
      });
      setIntermediateStepsLoading(false);
      const json = (await response.json()) as ComplexChatResponse;

      if (response.status === 200) {
        const newMessages = messagesWithUserReply;
        const basereply: ExtendedMessage = {
          id: `${newMessages.length}`,
          content: json.output,
          role: "assistant",
          avatar: json.avatar,
        };
        const extraMesages: ExtendedMessage[] = [];

        /*
        if (
          json.intermediate_steps.filter(
            (step) => step.action.tool === "tranmere-web-match-tool",
          ).length > 0
        ) {
          const steps = json.intermediate_steps.filter(
            (step) => step.action.tool === "tranmere-web-match-tool",
          );
          if (steps.length > 0 && steps[0].observation !== "") {
            const game = JSON.parse(steps[0].observation) as MatchPageData;

            const match: ExtendedMessage = {
              id: `${newMessages.length}`,
              content: basereply.content,
              match: game,
              role: "assistant",
              avatar: json.avatar,
              type: "match",
            };
            extraMesages.push(match);
          }
        } else if (
          json.intermediate_steps.filter(
            (step) => step.action.tool === "tranmere-web-player-stats-tool",
          ).length > 0
        ) {
          const steps = json.intermediate_steps.filter(
            (step) => step.action.tool === "tranmere-web-player-stats-tool",
          );
          if (steps.length > 0 && steps[0].observation !== "") {
            const players = JSON.parse(
              steps[0].observation,
            ) as PlayerSeasonSummary[];
            if (players.length == 1) {
              const message: ExtendedMessage = {
                id: `${newMessages.length}`,
                content: basereply.content,
                player: players[0],
                role: "assistant",
                avatar: json.avatar,
                type: "player",
              };
              extraMesages.push(message);
            } else {
              extraMesages.push(basereply);
            }
          }
        } else {
          */
          extraMesages.push(basereply);
        //}
        setMessages([...newMessages, ...extraMesages]);
      } else {
        if (json.error) {
          toast(json.error, {
            theme: "dark",
          });
          throw new Error(json.error);
        }
      }
    }
  }

  return (
    <div className={`flex flex-col items-center p-4 md:p-8 rounded grow overflow-hidden ${(messages.length > 0 ? "border" : "")}`}>
    

        <form onSubmit={sendMessage} className="flex w-full flex-col">
          <div className="grid grid-cols-5 gap-4">
            <div className="flex col-span-3">
              <input
                className="px-3 py-2 text-sm w-full"
                value={input}
                placeholder={placeholder ?? ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex">
              <select
                className="px-3 py-2 text-sm w-full"
                value={avatar}
                onChange={handleSelectionChange}
              >
                <option value={"Generic"}>Generic</option>
                <option value={"Aldo"}>Aldo</option>
                <option value={"Goodison"}>Goodison</option>
                <option value={"Nors"}>Nors</option>
                <option value={"Yates"}>Yates</option>
                <option value={"Muir"}>Muir</option>
              </select>
            </div>
            <div className="flex">
              <SubmitButton>
                <div role="status" className={`${(chatEndpointIsLoading || intermediateStepsLoading) ? "" : "hidden"} flex justify-center`}>
                  <svg aria-hidden="true" className="w-6 h-6 text-white animate-spin dark:text-white fill-sky-800" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
                <span className={(chatEndpointIsLoading || intermediateStepsLoading) ? "hidden" : ""}>Send</span>                
              </SubmitButton>

            </div>
          </div>
        </form>
        <ToastContainer />
        {messages.length === 0 ? "" : ""}
        <div
          className="flex flex-col-reverse w-full mb-4 overflow-auto transition-[flex-grow] ease-in-out mt-6"
          ref={messageContainerRef}
        >
          {messages.length > 0
            ? [...messages].map((m) => {
                if (m.role === "system") {
                  return "";
                } else {
                  return (
                    <ChatMessageBubble
                      key={m.id}
                      message={m}
                    ></ChatMessageBubble>
                  );
                }
              })
            : ""}
        </div>

        {messages.length === 0}
      </div>
  );
}
