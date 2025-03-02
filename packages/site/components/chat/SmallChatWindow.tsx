"use client";

import "react-toastify/dist/ReactToastify.css";
import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { ChatMessageBubble } from "@/components/chat/ChatMessageBubble";

import { SubmitButton } from "@/components/forms/SubmitButton";

export function SmallChatWindow(props: {
  endpoint: string;
  placeholder?: string;
}) {
  const { placeholder } = props;

  const [chatopen, setChatopen] = useState(false);
  const toggle = () => {
    setChatopen(!chatopen);
  };

  const { messages, input, setInput, handleInputChange, handleSubmit } = useChat({});

  const chatEndpointIsLoading = false;
  const intermediateStepsLoading = false;

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const end = messagesEndRef.current!;
    const container = messagesContainerRef.current!;
    container.scrollTo({
      behavior: "smooth",
      top: container.scrollHeight - 100,
    });
    end.scrollTo({ behavior: "smooth", top: 0 });
  }, [messages]);


  const butttonClass =
    "rounded-md bg-sky-500 dark:bg-sky-500 px-2 py-2 text-xs font-semibold text-white shadow-sm hover:bg-green-600 dark:hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mb-4";

  return (
    <form onSubmit={handleSubmit}>
      <div className="fixed bottom-10 right-1 md:right-12 text-blue-500 w-full max-w-96 z-50">
        <div
          className={`bg-indigo-900 rounded-lg relative right-0 bottom-14  ${chatopen ? "block" : "hidden"}`}
        >
          <div
            className="overflow-auto relative bottom-16 max-h-128 bg-indigo-900 scrollbar scrollbar-thumb-indigo-600 scrollbar-track-gray-200"
            ref={messagesContainerRef}
          >
            <div
              className={`flex flex-col items-center p-4 grow overflow-hidden max-w-96`}
            >
              <div className="relative right-0 top-0">
                <Image
                  src="/assets/logos/roverbot.png"
                  alt="TranmereWeb.com Logo"
                  width={80}
                  height={80}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 ml-2 mr-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setInput("How many goals did Eugene Dadi score?");
                  }}
                  className={butttonClass}
                >
                  How many goals did Eugene Dadi score?
                </button>
                <button
                  type="button"
                  onClick={() => setInput("Who did we sign Pat Nevin from?")}
                  className={butttonClass}
                >
                  Who did we sign Pat Nevin from?
                </button>
              </div>
              <div className="flex flex-col-reverse w-full mb-4 overflow-auto transition-[flex-grow] ease-in-out mt-2">
                {messages.length > 0
                  ? [...messages].reverse().map((m) => {
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
                <div ref={messagesEndRef} className="relative" />
              </div>
            </div>
          </div>
          <div className="w-full relative">
            <div className="flex w-full flex-col absolute right-0 bottom-0">
              <div className="grid grid-cols-6 gap-3  ml-3 mr-2 mb-4">
                <div className="flex col-span-5">
                  <input
                    className="px-3 py-2 text-xs w-full dark:text-slate-800"
                    value={input}
                    placeholder={placeholder ?? ""}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex">
                  <SubmitButton>
                    <div
                      role="status"
                      className={`${chatEndpointIsLoading || intermediateStepsLoading ? "" : "hidden"} flex justify-center`}
                    >
                      <svg
                        aria-hidden="true"
                        className="w-6 h-6 text-white animate-spin dark:text-white fill-sky-800"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                          fill="currentColor"
                        />
                        <path
                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                          fill="currentFill"
                        />
                      </svg>
                      <span className="sr-only">Loading...</span>
                    </div>
                    <span
                      className={
                        chatEndpointIsLoading || intermediateStepsLoading
                          ? "hidden"
                          : ""
                      }
                    >
                      Go
                    </span>
                  </SubmitButton>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="cursor-pointer w-full relative">
          <Image
            src="/assets/logos/roverbot.png"
            alt="RoverBot"
            className="h-12 w-12  text-indigo-600 absolute right-0 bottom-0"
            width={100}
            height={100}
            onClick={toggle}
          />
        </div>
      </div>
    </form>
  );
}
