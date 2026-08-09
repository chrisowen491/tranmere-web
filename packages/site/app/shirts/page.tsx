import { ShirtSearchApp } from "@/components/apps/ShirtSearch";
import { getAllShirts } from "@/lib/api";
import { breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { cacheLife, cacheTag } from "next/cache";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = pageMetadata({
  title: "Tranmere Rovers shirts",
  description: "A catalogue of historic Tranmere Rovers football shirts.",
  pathname: "/shirts",
});

async function getCachedShirts() {
  "use cache";
  cacheLife("hours");
  cacheTag("shirts");
  return getAllShirts();
}

export default async function ShirtHome() {
  const shirts = await getCachedShirts();
  shirts.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Tranmere Rovers shirt archive",
          description: "Catalogue of historic Tranmere Rovers football shirts.",
          url: "https://www.tranmere-web.com/shirts",
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: shirts.length,
          },
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Shirts", pathname: "/shirts" },
        ])}
      />
      <ShirtSearchApp shirts={shirts}></ShirtSearchApp>
    </>
  );
}
