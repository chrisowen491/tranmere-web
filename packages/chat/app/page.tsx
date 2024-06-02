import { ChatWindow } from "@/components/ChatWindow";

export default function AgentsPage() {
  const InfoCard = <div></div>;
  return (
    <ChatWindow
      endpoint="api/chat/agents"
      emptyStateComponent={InfoCard}
      placeholder="Ask me anything Tranmere Rovers related"
      titleText="Tranmere-Web AI"
    ></ChatWindow>
  );
}
