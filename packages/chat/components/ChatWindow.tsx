"use client";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useChat } from "ai/react";
import { useRef, useState, ReactElement } from "react";
import type { FormEvent } from "react";

import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import { ComplexChatResponse, ExtendedMessage, MatchToolResponse } from './Types';
import { PlayerSeasonSummary } from '@tranmere-web/lib/src/tranmere-web-types';

export function ChatWindow(props: {
  endpoint: string,
  emptyStateComponent: ReactElement,
  placeholder?: string,
  titleText?: string,
  showIngestForm?: boolean,
}) {
  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  const { endpoint, emptyStateComponent, placeholder, titleText = "An LLM" } = props;
  const [intermediateStepsLoading, setIntermediateStepsLoading] = useState(false);

  const [avatar, setAvatar] = useState<string>("Generic");

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAvatar(e.target.value);
  };

  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading: chatEndpointIsLoading, setMessages } =
    useChat({
      api: endpoint,
      headers: {
        'x-avatar': avatar
      },
      streamMode: "text",
      onError: (e) => {
        toast(e.message, {
          theme: "dark"
        });
      }
    });

  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (messageContainerRef.current) {
      messageContainerRef.current.classList.add("grow");
    }
    if (!messages.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
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
      const messagesWithUserReply = messages.concat({ id: messages.length.toString(), content: input, role: "user" });
      setMessages(messagesWithUserReply);
      const response = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
          messages: messagesWithUserReply.map(m => {
            return {
              content: m.content,
              id: m.content,
              role: m.role
            }
          }),
        }),
        headers: {
          "x-avatar": avatar
        }
      });
      setIntermediateStepsLoading(false);
      const json = await response.json() as ComplexChatResponse;

      if (response.status === 200) {

        const newMessages = messagesWithUserReply;
        const basereply : ExtendedMessage = { id: `${newMessages.length}`, content: json.output, role: "assistant", avatar: json.avatar };
        const extraMesages : ExtendedMessage[] = [];        

        if(json.intermediate_steps.filter( step => step.action.tool === "tranmere-web-match-tool").length > 0) {
          const steps = json.intermediate_steps.filter( step => step.action.tool === "tranmere-web-match-tool");
          if(steps.length > 0 && steps[0].observation !== "") {
            const game = JSON.parse(steps[0].observation) as MatchToolResponse

            const match : ExtendedMessage = { id: `${newMessages.length}`, content: basereply.content, match: game , role: "assistant", avatar: json.avatar, type: "match" };
            extraMesages.push(match)
          }
        } else if(json.intermediate_steps.filter( step => step.action.tool === "tranmere-web-player-stats-tool").length > 0) {
          const steps = json.intermediate_steps.filter( step => step.action.tool === "tranmere-web-player-stats-tool");
          if(steps.length > 0 && steps[0].observation !== "") {
            const players = JSON.parse(steps[0].observation) as PlayerSeasonSummary[]
            if(players.length == 1) {
              const message : ExtendedMessage = { id: `${newMessages.length}`, content: basereply.content, player: players[0] , role: "assistant", avatar: json.avatar, type: "player" };
              extraMesages.push(message)
            } else {
              extraMesages.push(basereply)
            }
          }
        } else {
          extraMesages.push(basereply)
        }
        setMessages([...newMessages, ...extraMesages]);

      } else {
        if (json.error) {
          toast(json.error, {
            theme: "dark"
          });
          throw new Error(json.error);
        }
      }
    }
  }

  return (
    <section>
      <div className='container'>
        <h3 className={`font-weight-normal mb-2`} style={{ color: "#001489"}}>{titleText}</h3>
          <form onSubmit={sendMessage}>
            <div className="form-group row">
              <div className="col-sm-8">
                <input
                  className="form-control form-control"
                  value={input}
                  placeholder={placeholder ?? ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-2">
                <select
                  className="form-control form-control"
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
              <div className="col-md-2">
                <button type="submit" className="btn btn-primary">
                  <div role="status" className={`${(chatEndpointIsLoading || intermediateStepsLoading) ? "" : "hidden"} flex justify-center`}>
                    <div className="spinner-border text-light">
                      <span className="sr-only">Loading...</span>
                    </div>
                  </div>
                  <span className={(chatEndpointIsLoading || intermediateStepsLoading) ? "hidden" : ""}>Send</span>
                </button>
              </div>
            </div>
          </form>
        <ToastContainer/>
        {messages.length === 0 ? emptyStateComponent : ""}
        <div
          className="flex flex-col-reverse w-full mb-4 overflow-auto transition-[flex-grow] ease-in-out"
          ref={messageContainerRef}
        >
          {messages.length > 0 ? (
            [...messages]
              .reverse()
              .map((m) => {
                if(m.role === "system") {
                  return ""
                } else {
                  return <ChatMessageBubble key={m.id} message={m}></ChatMessageBubble>
                }
              })
          ) : (
            ""
          )}
        </div>

      {messages.length === 0}

      </div>
    </section>
  );
}

