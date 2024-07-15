import PlayerProfileView from "@/components/apps/PlayerProfileView";
import { GetBaseUrl } from "@/lib/apiFunctions";
import { GetCommentsByUrl } from "@/lib/comments";
import { PlayerProfile } from "@/lib/types";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { notFound } from "next/navigation";
export const runtime = "edge";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  return {
    title: `Player Profile - ${decodeURI(params.slug)}`,
    description: `Player Profile for the Tranmere Rovers career of ${decodeURI(params.slug)}`,
  };
}

export default async function PlayerProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const url =
    GetBaseUrl(getRequestContext().env) +
    `/page/player/${decodeURI(params.slug)}?json=true`;

  const playerRequest = await fetch(url);

  const profile = (await playerRequest.json()) as PlayerProfile;
  const comments = await GetCommentsByUrl(
    getRequestContext().env,
    `/page/player/${decodeURI(params.slug)}`,
  );

  let score = 0;
  comments.forEach((c) => {
    score = score + c.rating;
  });

  const avg = Math.round(score / comments.length);

  if (!profile || !profile.player) notFound();

  return (
    <>
      <PlayerProfileView
        player={profile}
        comments={comments}
        avg={avg}
      ></PlayerProfileView>
    </>
  );
}
