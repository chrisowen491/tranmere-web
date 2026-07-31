import type { ReactNode } from "react";

const siteUrl = "https://www.tranmere-web.com";

type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdValue[]
  | { [key: string]: JsonLdValue | undefined };

export function absoluteUrl(pathname: string) {
  return new URL(pathname, siteUrl).toString();
}

export function JsonLd({ data }: { data: JsonLdValue }): ReactNode {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; pathname: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.pathname),
    })),
  };
}

export const sportsTeamJsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsTeam",
  "@id": `${siteUrl}/#team`,
  name: "Tranmere Rovers",
  alternateName: "Tranmere Rovers FC",
  url: siteUrl,
  sport: "Football",
  sameAs: ["https://www.tranmererovers.co.uk/"],
  description:
    "Tranmere Rovers Football Club, documented by the independent Tranmere-Web archive.",
};
