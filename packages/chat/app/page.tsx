import { ChatWindow } from "@/components/ChatWindow";

export default function AgentsPage() {
  const InfoCard = <div></div>;
  return (
    <ChatWindow
      endpoint="api/chat/agents"
      emptyStateComponent={InfoCard}
      placeholder="Alright mate! Ask me anything Tranmere Rovers related"
      titleText="Rover the Dog"
      emoji="🐶"
    ></ChatWindow>
  );
}
