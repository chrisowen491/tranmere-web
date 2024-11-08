import PlayerProfileView from "@/components/apps/PlayerProfileView";
import { getAllArticlesForTag } from "@/lib/api";
import { GetBaseUrl } from "@/lib/apiFunctions";
import { GetCommentsByUrl } from "@/lib/comments";
import { PlayerProfile, SlugParams } from "@/lib/types";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { notFound } from "next/navigation";
export const runtime = "edge";

export async function generateMetadata(props: { params: SlugParams }) {
  const params = await props.params;
  return {
    title: `Player Profile - ${decodeURI(params.slug)}`,
    description: `Player Profile for the Tranmere Rovers career of ${decodeURI(params.slug)}`,
  };
}

export default async function PlayerProfilePage(props: { params: SlugParams }) {
  const params = await props.params;
  const url =
    GetBaseUrl(getRequestContext().env) +
    `/page/player/${decodeURI(params.slug)}?json=true`;

  const playerRequest = await fetch(url);
  
  const profile = (await playerRequest.json()) as PlayerProfile;
  
  if (!profile || !profile.player) notFound();

  const articles = await getAllArticlesForTag(100, decodeURI(params.slug));

  const comments = await GetCommentsByUrl(
    getRequestContext().env,
    `/page/player/${decodeURI(params.slug)}`,
  );

  let score = 0;
  comments.forEach((c) => {
    score = score + c.rating;
  });

  const avg = Math.round(score / comments.length);

  return (
    <>
      <PlayerProfileView
        player={profile}
        articles={articles}
        comments={comments}
        avg={avg}
      ></PlayerProfileView>
    </>
  );
}
