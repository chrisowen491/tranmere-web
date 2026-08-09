import { AiChat } from "@/components/chat/AiChat";
import { Title } from "@/components/fragments/Title";
import { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
  title: "AI Chat Bot",
  description: "Interactive Q&A Bot",
};

export default function AgentsPage() {
  return (
    <>
      <Title title={"Tranmere-Web AI"} subTitle={"Artificial Intelligence"} />
      <AiChat />
    </>
  );
}
