"use client";

import dynamic from "next/dynamic";

const ChatBlock = dynamic(
  () => import("@/components/chat/ChatBlock").then((module) => module.ChatBlock),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-slate-500 lg:px-8">
        Loading Rovers AI…
      </div>
    ),
  },
);

export function AiChat() {
  return <ChatBlock placeholder="Ask me anything Tranmere Rovers related" />;
}
