import { Metadata } from "next";
import { ContactForm } from "@/components/apps/ContactForm";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
  title: "Contact Tranmere-Web",
  description:
    "Contact the independent Tranmere Rovers archive with questions, corrections and site feedback.",
};

export default function ContactPage() {
  return <ContactForm />;
}
