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
  return (
    <div className={`${colorClassName} rounded px-4 py-2 max-w-full mb-8 flex`}>
      <div className="mr-2">
        <Image
          alt="Avatar"
          width={200}
          height={200}
          src={avatar!}
          className="h-24 w-24 rounded-full"
        />
      </div>
      <div className="whitespace-pre-wrap flex flex-col">
        <span>{props.message.content}</span>
        {props.message.player && (
          <PlayerBubble
            key={props.message.id}
            message={props.message}
          ></PlayerBubble>
        )}
        {props.message.match && (
          <MatchMessageBubble
            key={props.message.id}
            message={props.message}
          ></MatchMessageBubble>
        )}
      </div>
    </div>
  );
}
