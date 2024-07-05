import { ChatWindow } from "@/components/chat/ChatWindow";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Metadata } from "next";
export const runtime = "edge";


export const metadata: Metadata = {
  title: "AI Chat Bot",
  description: "Interactive Q&A Bot",
};

export default function AgentsPage() {
  const InfoCard = <div></div>;
  return (
    <>
    <Navbar showSearch={true}></Navbar>
    <ChatWindow
      endpoint="api/chat/agents"
      emptyStateComponent={InfoCard}
      placeholder="Ask me anything Tranmere Rovers related"
      titleText="Tranmere-Web AI"
    ></ChatWindow>
    <Footer></Footer>
    </>
  );
}
