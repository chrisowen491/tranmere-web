import { MatchMessageBubble } from "@/components/chat/MatchMessageBubble";
import { PlayerBubble } from "@/components/chat/PlayerBubble";
import { ExtendedMessage } from "@/lib/types";
import Image from "next/image";

export function ChatMessageBubble(props: { message: ExtendedMessage }) {
  const userAvatar = "/images/2023.png";
  const colorClassName =
    props.message.role === "user"
      ? "bg-blue-600 text-gray-50"
      : "bg-green-600 text-gray-50";
  const avatar =
    props.message.role === "user" ? userAvatar : props.message.avatar;
  console.log(props.message);
  return (
    <>
      <div className="mb-10">
        <div className="w-full">
          {(props.message.players || props.message.profiles) && (
            <PlayerBubble
              key={props.message.id}
              message={props.message}
            ></PlayerBubble>
          )}
          {props.message.matches && (
            <MatchMessageBubble
              key={props.message.id}
              message={props.message}
            ></MatchMessageBubble>
          )}
        </div>
      </div>
      <div
        className={`${colorClassName} rounded px-4 py-2 max-w-full mb-8 flex`}
      >
        <div className="mr-2 flex flex-col shrink-0">
          <Image
            alt="Avatar"
            width={200}
            height={200}
            src={avatar!}
            unoptimized={true}
            className="h-24 w-24 rounded-full"
          />
        </div>
        <div className="flex flex-col">
          <span>{props.message.content}</span>
        </div>
      </div>
    </>
  );
}
