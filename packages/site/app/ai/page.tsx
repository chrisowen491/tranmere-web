import { ChatBlock } from "@/components/chat/ChatBlock";
import { Title } from "@/components/fragments/Title";
import { Metadata } from "next";
export const runtime = "edge";

export const metadata: Metadata = {
  title: "AI Chat Bot",
  description: "Interactive Q&A Bot",
};

export default function AgentsPage() {
  return (
    <>
      <Title title={"Tranmere-Web AI"} subTitle={"Artificial Intelligence"} />
      <ChatBlock placeholder="Ask me anything Tranmere Rovers related"></ChatBlock>
    </>
  );
}
