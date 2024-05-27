"use client";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useChat } from "ai/react";
import { useRef, useState, ReactElement } from "react";
import type { FormEvent } from "react";

import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import { UploadDocumentsForm } from "@/components/UploadDocumentsForm";
import { IntermediateStep } from "./IntermediateStep";
import type { AgentStep } from 'langchain/agents';

export function ChatWindow(props: {
  endpoint: string,
  emptyStateComponent: ReactElement,
  placeholder?: string,
  titleText?: string,
  emoji?: string;
  showIngestForm?: boolean,
}) {
  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  const { endpoint, emptyStateComponent, placeholder, titleText = "An LLM", showIngestForm, emoji } = props;

  const [intermediateStepsLoading, setIntermediateStepsLoading] = useState(false);
  const ingestForm = showIngestForm && <UploadDocumentsForm></UploadDocumentsForm>;

  const [sourcesForMessages, setSourcesForMessages] = useState<Record<string, any>>({});

  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading: chatEndpointIsLoading, setMessages } =
    useChat({
      api: endpoint,
      onResponse(response) {
        const sourcesHeader = response.headers.get("x-sources");
        const sources = sourcesHeader ? JSON.parse((Buffer.from(sourcesHeader, 'base64')).toString('utf8')) : [];
        const messageIndexHeader = response.headers.get("x-message-index");
        if (sources.length && messageIndexHeader !== null) {
          setSourcesForMessages({...sourcesForMessages, [messageIndexHeader]: sources});
        }
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
    if (chatEndpointIsLoading ?? intermediateStepsLoading) {
      return;
    }

    setIntermediateStepsLoading(true);
    setInput("");
    const messagesWithUserReply = messages.concat({ id: messages.length.toString(), content: input, role: "user" });
    setMessages(messagesWithUserReply);
    const response = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({
        messages: messagesWithUserReply,
        show_intermediate_steps: true
      })
    });
    const json = await response.json();
    setIntermediateStepsLoading(false);
    if (response.status === 200) {
      // Represent intermediate steps as system messages for display purposes
      const intermediateStepMessages = (json.intermediate_steps ?? []).map((intermediateStep: AgentStep, i: number) => {
        return {id: (messagesWithUserReply.length + i).toString(), content: JSON.stringify(intermediateStep), role: "system"};
      });
      const newMessages = messagesWithUserReply;
      for (const message of intermediateStepMessages) {
        newMessages.push(message);
        setMessages([...newMessages]);
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      }
      setMessages([...newMessages, { id: (newMessages.length + intermediateStepMessages.length).toString(), content: json.output, role: "assistant" }]);
    } else {
      if (json.error) {
        toast(json.error, {
          theme: "dark"
        });
        throw new Error(json.error);
      }
    }
  }

  return (
    <section>
      <div className='container'>
        <h2 className={`${messages.length > 0 ? "" : "hidden"} text-2xl`}>{emoji} {titleText}</h2>
          <form onSubmit={sendMessage}>
            <div className="form-group row">
              <div className="col-sm-10">
                <input
                  className="form-control form-control-lg"
                  value={input}
                  placeholder={placeholder ?? "What's it like to be a pirate?"}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-primary">
                  Send
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
              .map((m, i) => {
                const sourceKey = (messages.length - 1 - i).toString();
                return (m.role === "system" ? <IntermediateStep key={m.id} message={m} aiEmoji={emoji} sources={sourcesForMessages[sourceKey]}></IntermediateStep> : <ChatMessageBubble key={m.id} message={m} aiEmoji={emoji} sources={sourcesForMessages[sourceKey]}></ChatMessageBubble>)
              })
          ) : (
            ""
          )}
        </div>

      {messages.length === 0 && ingestForm}

      </div>
    </section>
  );
}
