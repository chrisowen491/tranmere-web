import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";


export default function NotFound() {
  return (
    <>
    <Navbar showSearch={false}></Navbar>
        <section className="bg-primary">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-10 text-white text-center">
                        <p>Could not find requested resource</p>
                        <Link href="/">Return Home</Link>
                    </div>
                </div>
            </div>
        </section>
    <Footer></Footer>
    </>

  );
}