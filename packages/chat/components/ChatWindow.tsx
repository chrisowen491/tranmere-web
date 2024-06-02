"use client";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useChat } from "ai/react";
import { useRef, useState, ReactElement } from "react";
import type { FormEvent } from "react";

import { ChatMessageBubble } from "@/components/ChatMessageBubble";

export function ChatWindow(props: {
  endpoint: string,
  emptyStateComponent: ReactElement,
  placeholder?: string,
  titleText?: string,
  showIngestForm?: boolean,
}) {
  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  const { endpoint, emptyStateComponent, placeholder, titleText = "An LLM", showIngestForm } = props;

  const avatarMap = new Map();
  avatarMap.set('Generic', "/images/1989a.png")
  avatarMap.set('Aldo', "https://www.tranmere-web.com/builder/1991/side-parting/ffd3b3/thick-tache/7f3f00/fcb98b/none/bc8a00")
  avatarMap.set('Nors', "https://www.tranmere-web.com/builder/2018/balding/ffd3b3/small-beard/512904/fcb98b/none/8e740c")
  avatarMap.set('Goodison', "https://www.tranmere-web.com/builder/2010/dreads/7f3f00/none/000000/5b2d01/none/8e740c")
  avatarMap.set('Yates',"https://www.tranmere-web.com/builder/2000/mousse/ffd3b3/none/efef64/fcb98b/none/bc8a00")
  avatarMap.set('Muir',"https://www.tranmere-web.com/builder/1989/side-parting-left-small/ffd3b3/none/bc9d00/fcb98b/none/bc8a00")
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
    handleSubmit(e);
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
                  <div role="status" className={`${(chatEndpointIsLoading) ? "" : "hidden"} flex justify-center`}>
                    <div className="spinner-border text-light">
                      <span className="sr-only">Loading...</span>
                    </div>
                  </div>
                  <span className={(chatEndpointIsLoading) ? "hidden" : ""}>Send</span>
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
                console.log(m)
                const robotAvatar = avatarMap.get(avatar)
                return (<ChatMessageBubble key={m.id} message={m} botAvatar={robotAvatar}></ChatMessageBubble>)
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
