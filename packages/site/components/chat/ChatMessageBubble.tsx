import { PlayerBubble } from "@/components/chat/PlayerBubble";
import { ExtendedMessage } from "@/lib/types";
import Image from "next/image";

export function ChatMessageBubble(props: { message: ExtendedMessage }) {
  const userAvatar = props.message.role === "user" ? "/images/2023.png"  : "builder/2010/dreads/7f3f00/none/000000/5b2d01/none/8e740c";
  const message = props.message;
  const colorClassName =
    props.message.role === "user"
      ? "bg-blue-600 text-gray-50"
      : "bg-green-600 text-gray-50";
  const avatar =
    props.message.role === "user" ? userAvatar : props.message.avatar;
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
        <div className="flex flex-col text-sm">
          <div key={message.id}>
            {message.parts!.map(part => {
              switch (part.type) {
                // render text parts as simple text:
                case 'text':
                  return part.text;

                // for tool invocations, distinguish between the tools and the state:
                case 'tool-invocation': {
                  const callId = part.toolInvocation.toolCallId;

                  switch (part.toolInvocation.toolName) {

                    case 'PlayerStatsTool': {
                      switch (part.toolInvocation.state) {
                        case 'result':
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

                    default: {
                      return "" //part.toolInvocation.toolName + ' ' + JSON.stringify(part.toolInvocation.args);
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
