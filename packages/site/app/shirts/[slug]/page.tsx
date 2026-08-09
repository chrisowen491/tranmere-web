import { ShirtApp } from "@/components/apps/Shirt";
import { SlugParams } from "@/lib/types";
import { getAllShirts } from "@/lib/api";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { cacheLife, cacheTag } from "next/cache";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

async function getCachedShirts() {
  "use cache";
  cacheLife("hours");
  cacheTag("shirts");
  return getAllShirts();
}

export async function generateMetadata(props: { params: SlugParams }) {
  const params = await props.params;
  const shirts = await getCachedShirts();

  const shirt = shirts.find((s) => s.slug === params.slug);
  if (!shirt) return {};
  return pageMetadata({
    title: shirt.name,
    description: `Explore the ${shirt.name} in the Tranmere Rovers shirt archive.`,
    pathname: `/shirts/${params.slug}`,
    image: shirt.imagesCollection?.items[0]?.url,
  });
}
export default async function ShirtHome(props: { params: SlugParams }) {
  const shirts = await getCachedShirts();
  const params = await props.params;
  const shirt = shirts.find((s) => s.slug === params.slug);

  if (!shirt) notFound();

  return <ShirtApp shirt={shirt} />;
}
