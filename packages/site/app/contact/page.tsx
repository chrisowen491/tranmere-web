import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Metadata } from "next";
import { ContactForm } from "@/components/apps/ContactForm";
export const runtime = "edge";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact us page",
};

export default async function Transfers() {
  
  return <>
    <Navbar showSearch={true}></Navbar>
    <section>
      <div className="container">
        <div className="row">
          <div className="col">
            <h1>Contact us!</h1>
          </div>
        </div>
        <ContactForm></ContactForm>
      </div>
    </section>
    <Footer></Footer>
  </>;
}
