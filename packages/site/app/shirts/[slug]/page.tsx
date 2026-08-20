import { ShirtApp } from "@/components/apps/Shirt";
import { SlugParams } from "@/lib/types";
import { getAllShirts } from "@/lib/api";
import { GetCommentsByUrl } from "@/lib/comments";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { auth0 } from "@/lib/auth0";
import { resolveAccount } from "@/lib/accounts";

export const revalidate = 7200;

export async function generateMetadata(props: { params: SlugParams }) {
  const params = await props.params;
  const shirts = await getAllShirts();

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
  const shirts = await getAllShirts();
  const params = await props.params;
  const shirt = shirts.find((s) => s.slug === params.slug);

  if (!shirt) notFound();

  const env = (await getCloudflareContext({ async: true })).env;
  const session = await auth0.getSession();
  const account = session
    ? await resolveAccount(env.DB, session.user.sub)
    : null;
  const comments = await GetCommentsByUrl(
    env,
    `/shirts/${shirt.slug}`,
    account?.id,
  );
  const averageRating = comments.length
    ? Math.round(
        comments.reduce((total, comment) => total + comment.rating, 0) /
          comments.length,
      )
    : 0;

  return (
    <ShirtApp shirt={shirt} comments={comments} averageRating={averageRating} />
  );
}
