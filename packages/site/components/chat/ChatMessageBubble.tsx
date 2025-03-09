import { PlayerBubble } from "@/components/chat/PlayerBubble";
import { ExtendedMessage } from "@/lib/types";
import Image from "next/image";
import { MatchMessageBubble } from "./MatchMessageBubble";
import { ResultsBubble } from "./ResultsBubble";

export function ChatMessageBubble(props: { message: ExtendedMessage }) {
  const userAvatar =
    props.message.role === "user"
      ? "/images/2023.png"
      : "builder/1991/side-parting/ffd3b3/thick-tache/7f3f00/fcb98b/none/bc8a00";
  const message = props.message;
  const colorClassName =
    props.message.role === "user"
      ? "bg-blue-600 text-gray-50"
      : "bg-green-600 text-gray-50";

  return (
    <>
      <div
        className={`${colorClassName} rounded px-4 py-2 max-w-full mb-2 flex`}
      >
        <div className="mr-2 flex flex-col shrink-0">
          <Image
            alt="Avatar"
            width={200}
            height={200}
            src={userAvatar}
            unoptimized={true}
            className="h-12 w-12 rounded-full"
          />
        </div>
        <div className="text-sm w-full">
          <div key={message.id}>
            {message.parts!.map((part) => {
              switch (part.type) {
                // render text parts as simple text:
                case "text":
                  return part.text;

                // for tool invocations, distinguish between the tools and the state:
                case "tool-invocation": {
                  const callId = part.toolInvocation.toolCallId;

                  switch (part.toolInvocation.toolName) {
                    case "PlayerStatsTool": {
                      switch (part.toolInvocation.state) {
                        case "result":
                          return (
                            <div key={callId}>
                              <PlayerBubble
                                key={props.message.id}
                                message={part.toolInvocation.result}
                              ></PlayerBubble>
                            </div>
                          );
                      }
                      break;
                    }

                    case "MatchTool": {
                      switch (part.toolInvocation.state) {
                        case "result":
                          return (
                            <div key={callId}>
                              <MatchMessageBubble
                                key={props.message.id}
                                message={part.toolInvocation.result}
                              ></MatchMessageBubble>
                            </div>
                          );
                      }
                      break;
                    }

                    case "ResultsTool": {
                      switch (part.toolInvocation.state) {
                        case "result":
                          return (
                            <div key={callId}>
                              <ResultsBubble
                                key={props.message.id}
                                message={part.toolInvocation.result}
                              ></ResultsBubble>
                            </div>
                          );
                      }
                      break;
                    }

                    default: {
                      return ""; //part.toolInvocation.toolName + ' ' + JSON.stringify(part.toolInvocation.args);
                    }
                  }
                }
              }
            })}
            <br />
          </div>
        </div>
      </div>
    </>
  );
}
