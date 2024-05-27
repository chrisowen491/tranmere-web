import type { Message } from "ai/react";

export function ChatMessageBubble(props: { message: Message, aiEmoji?: string, sources: any[] }) {
  const colorClassName =
    props.message.role === "user" ? "bg-green text-white" : "bg-blue text-white";
  const alignmentClassName =
    props.message.role === "user" ? "ml-auto" : "mr-auto";
  const prefix = props.message.role === "user" ? "🧑" : props.aiEmoji;
  return (
    <div
      className={`${alignmentClassName} ${colorClassName} rounded px-4 py-2 max-w-[80%] mb-4 flex`}
    >
      <div className="col-2">
        {prefix}
      </div>
      <div className="whitespace-pre-wrap flex flex-col col-10">
        <span>{props.message.content}</span>
      </div>
    </div>
  );
}