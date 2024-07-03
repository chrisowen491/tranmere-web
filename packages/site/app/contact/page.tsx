import { Title } from "@/components/layout/Title";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TransferSearch } from "@/components/apps/TransferSearch";
import { GetAllTeams, GetBaseUrl } from "@/lib/apiFunctions";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { Transfer } from "@tranmere-web/lib/src/tranmere-web-types";
import { Metadata } from "next";
import { ContactForm } from "@/components/apps/ContactForm";
export const runtime = "edge";

export const metadata: Metadata = {
  title: "Transfers Home - Tranmere-Web",
  description: "Tranmere Rovers transfer information index",
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
