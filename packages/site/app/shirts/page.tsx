import { ShirtSearchApp } from "@/components/apps/ShirtSearch";
import { getAllShirts } from "@/lib/shirts";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 7200;

export const metadata = pageMetadata({
  title: "Tranmere Rovers shirts",
  description: "A catalogue of historic Tranmere Rovers football shirts.",
  pathname: "/shirts",
});

export default async function ShirtHome() {
  const db = (await getCloudflareContext({ async: true })).env.DB;
  const shirts = await getAllShirts(db);
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
