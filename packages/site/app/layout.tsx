import "./globals.css";
import "@/public/assets/scss/chat.scss";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/images/favicon.ico" />
      </head>
      <body>

          <Navbar></Navbar>
          {children}

        <Footer></Footer>
      </body>
    </html>
  );
}
