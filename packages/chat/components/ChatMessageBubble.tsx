import type { Message } from "ai/react";

export function ChatMessageBubble(props: { message: Message, botAvatar: string }) {
  const userAvatar = "/images/2023.png"
  const colorClassName =
    props.message.role === "user" ? "bg-green text-white" : "bg-blue text-white";
  const avatar = props.message.role === "user" ? userAvatar : props.botAvatar;
  return (
    <div className={`ml-auto mr-auto ${colorClassName} rounded px-4 py-2 max-w-[80%] mb-4 flex row`}>
      <div className="col-2">
        <img src={avatar} />
      </div>
      <div className="col-10">
        <span>{props.message.content}</span>
      </div>
    </div>
  );
}