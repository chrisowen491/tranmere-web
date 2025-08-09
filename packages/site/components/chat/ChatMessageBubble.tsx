import { PlayerBubble } from "@/components/chat/PlayerBubble";
import Image from "next/image";
import { MatchMessageBubble } from "./MatchMessageBubble";
import { ResultsBubble } from "./ResultsBubble";
import { UIMessage } from "ai";
import { MatchPageData, PlayerView } from "@tranmere-web/lib/src/tranmere-web-types";
import { ResultsToolData } from "@tranmere-web/tools/src/ResultsTool";

export function ChatMessageBubble(props: { message: UIMessage }) {
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


                case "tool-PlayerProfileTool": {
                  if(part.output !== null && part.output !== undefined) {
                    return (
                      <div key={part.toolCallId}>
                        <PlayerBubble
                          key={props.message.id}
                          player={JSON.parse(part.output as string) as PlayerView}
                        ></PlayerBubble>
                      </div>
                    );
                  }
                  break;
                }


                case "tool-MatchTool": {
                  if(part.output !== null && part.output !== undefined) {
                    return (
                      <div key={part.toolCallId}>
                        <MatchMessageBubble
                          key={props.message.id}
                          match={JSON.parse(part.output as string) as MatchPageData}
                        ></MatchMessageBubble>
                      </div>
                    );
                  }
                  break;
                }

                case "tool-ResultsTool": {
                  if(part.output !== null && part.output !== undefined) {
                    return (
                      <div key={part.toolCallId}>
                        <ResultsBubble
                          key={props.message.id}
                          matches={JSON.parse(part.output as string) as ResultsToolData}
                        ></ResultsBubble>
                      </div>
                    );
                  }
                  break;
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
