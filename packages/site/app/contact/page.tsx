import { Metadata } from "next";
import { ContactForm } from "@/components/apps/ContactForm";

export const metadata: Metadata = {
  title: "Contact Tranmere-Web",
  description:
    "Contact the independent Tranmere Rovers archive with questions, corrections and site feedback.",
};

export default function ContactPage() {
  return <ContactForm />;
}
