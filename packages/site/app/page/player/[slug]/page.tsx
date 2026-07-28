import PlayerProfileView from "@/components/apps/PlayerProfileView";
import { getAllArticlesForTag } from "@/lib/api";
import { GetBaseUrl } from "@/lib/apiFunctions";
import { GetCommentsByUrl } from "@/lib/comments";
import { PlayerProfile, SlugParams } from "@/lib/types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import { biographyToText } from "@/lib/playerProfileCorrections";
import { getTransfers } from "@/lib/transfers";

export async function generateMetadata(props: { params: SlugParams }) {
  const params = await props.params;
  return {
    title: `Player Profile - ${decodeURI(params.slug)}`,
    description: `Player Profile for the Tranmere Rovers career of ${decodeURI(params.slug)}`,
  };
}

export default async function PlayerProfilePage(props: { params: SlugParams }) {
  const params = await props.params;
  const env = getCloudflareContext().env;
  const url =
    GetBaseUrl(env) + `/page/player/${decodeURI(params.slug)}?json=true`;

  const playerRequest = await fetch(url);

  const profile = (await playerRequest.json()) as PlayerProfile;

  if (!profile || !profile.player) notFound();

  const [articles, transfers] = await Promise.all([
    getAllArticlesForTag(100, decodeURI(params.slug)),
    getTransfers(env.DB, { playerName: profile.player.name }),
  ]);
  profile.transfers = transfers;

  const comments = await GetCommentsByUrl(
    env,
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
        editableProfile={{
          dateOfBirth: profile.player.dateOfBirth ?? "",
          biography: biographyToText(profile.player.biography),
          picLink: profile.player.picLink ?? "",
          foot: profile.player.foot ?? "",
          height: profile.player.height ?? "",
          placeOfBirth: profile.player.placeOfBirth ?? "",
          position: profile.player.position ?? "",
        }}
      ></PlayerProfileView>
    </>
  );
}
