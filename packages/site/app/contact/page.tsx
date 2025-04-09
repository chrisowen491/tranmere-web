import { Metadata } from "next";
import { ContactForm } from "@/components/apps/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact us page",
};

export default async function Transfers() {
  return <ContactForm></ContactForm>;
}
