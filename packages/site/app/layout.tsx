import DataDog from "@/components/DataDog";
import "./globals.css";
import "@/public/assets/scss/chat.scss";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Tranmere-Web.com",
    default: "Tranmere-Web",
  },
};

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
        <DataDog />
        {children}
      </body>
    </html>
  );
}
