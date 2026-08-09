import { type Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import clsx from "clsx";
import { Providers } from "@/app/providers";
import { Layout } from "@/components/layout/Layout";
import { JsonLd, sportsTeamJsonLd } from "@/components/seo/JsonLd";

import "@/styles/tailwind.css";
import "./globals.css";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Use local version of Lexend so that we can use OpenType features
const lexend = localFont({
  src: "../fonts/lexend.woff2",
  display: "swap",
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Tranmere-Web.com",
    default: "Tranmere-Web",
  },
  description:
    "The independent archive of Tranmere Rovers results, players, shirts, stories and statistics.",
  metadataBase: new URL("https://www.tranmere-web.com"),
  openGraph: {
    title: "Tranmere-Web",
    description: "A century of Rovers, one living archive.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tranmere-Web",
    description: "A century of Rovers, one living archive.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={clsx("h-full antialiased", inter.variable, lexend.variable)}
      suppressHydrationWarning
    >
      <body className="flex min-h-full bg-[#f4f0e8] text-[#071a2b]">
        <JsonLd data={sportsTeamJsonLd} />
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
