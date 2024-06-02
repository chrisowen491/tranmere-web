import "./globals.css";
import "../../../tranmere-web/assets/scss/chat.scss";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Tranmere Web Chat Bot</title>
        <link rel="shortcut icon" href="/images/favicon.ico" />
      </head>
      <body>
        <div>
          <Navbar></Navbar>
          {children}
        </div>

        <Footer></Footer>
        <script async src="https://www.tranmere-web.com//assets/scripts/bundle--modernizr.js?r=91208"></script>
        <script async src="https://www.tranmere-web.com//assets/scripts/bundle--tranmere-web.js?r=91208"></script>
      </body>
    </html>
  );
}
