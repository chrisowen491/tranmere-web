import PlayerProfileView from "@/components/apps/PlayerProfileView";
import { getAllArticlesForTag } from "@/lib/api";
import { GetCommentsByUrl } from "@/lib/comments";
import { PlayerProfile, SlugParams } from "@/lib/types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { getTransfers } from "@/lib/transfers";
import { getPlayerByName } from "@/lib/players";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl, breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import {
  queryAppRows,
  queryGoalRows,
  queryPlayerSeasonSummaryRows,
} from "@tranmere-web/lib/src/d1-queries";
import type { AppRow } from "@tranmere-web/lib/src/d1-types";
import type { Appearance } from "@tranmere-web/lib/src/tranmere-web-types";
import { mapPlayerSeasonSummary } from "@/lib/playerStatistics";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

function mapAppearance(
  row: AppRow,
  playerName: string,
  type: "Start" | "Sub",
  goals: number,
): Appearance {
  const isSubstitute = type === "Sub";
  return {
    id: `${row.id}-${type.toLowerCase()}`,
    Date: row.match_date,
    Opposition: row.opposition,
    Competition: row.competition ?? "",
    Season: String(row.season),
    Name: playerName,
    Number: row.shirt_number?.toString(),
    SubbedBy: isSubstitute ? row.player_name : row.substituted_by,
    SubTime: row.substitute_time,
    YellowCard: (isSubstitute ? row.substitute_yellow_card : row.yellow_card)
      ? "TRUE"
      : null,
    RedCard: (isSubstitute ? row.substitute_red_card : row.red_card)
      ? "TRUE"
      : null,
    Type: type,
    Goals: goals,
  };
}

export async function generateMetadata(props: { params: SlugParams }) {
  const params = await props.params;
  const name = decodeURI(params.slug);
  return pageMetadata({
    title: `Player Profile – ${name}`,
    description: `Career profile, appearances, goals and transfers for Tranmere Rovers player ${name}.`,
    pathname: `/page/player/${encodeURIComponent(name)}`,
  });
}

export default async function PlayerProfilePage(props: { params: SlugParams }) {
  const params = await props.params;
  await connection();
  const env = getCloudflareContext().env;
  const requestedName = decodeURI(params.slug);
  const d1Player = await getPlayerByName(env.DB, requestedName);
  if (!d1Player) notFound();

  const profile: PlayerProfile = {
    seasons: [],
    transfers: [],
    links: [],
    image: d1Player.picLink ?? "",
    player: { name: d1Player.name },
    appearances: [],
  };
  const [seasonRows, starts, substituteAppearances, goals] = await Promise.all([
    queryPlayerSeasonSummaryRows(env.DB, {
      player: d1Player.name,
      playerMatch: "exact",
    }),
    queryAppRows(env.DB, { player: d1Player.name, playerMatch: "exact" }),
    queryAppRows(env.DB, { substitutedBy: d1Player.name }),
    queryGoalRows(env.DB, { scorer: d1Player.name, scorerMatch: "exact" }),
  ]);
  const goalsByDate = goals.reduce((counts, goal) => {
    counts.set(goal.match_date, (counts.get(goal.match_date) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());
  profile.seasons = seasonRows.map(mapPlayerSeasonSummary);
  profile.appearances = [
    ...starts.map((row) =>
      mapAppearance(
        row,
        d1Player.name,
        "Start",
        goalsByDate.get(row.match_date) ?? 0,
      ),
    ),
    ...substituteAppearances.map((row) =>
      mapAppearance(
        row,
        d1Player.name,
        "Sub",
        goalsByDate.get(row.match_date) ?? 0,
      ),
    ),
  ].sort((a, b) => a.Date.localeCompare(b.Date));
  profile.debut = profile.appearances[0];

  profile.player = {
    id: d1Player.id,
    name: d1Player.name,
    dateOfBirth: d1Player.dateOfBirth ?? undefined,
    picLink: d1Player.picLink ?? undefined,
    foot: d1Player.foot ?? undefined,
    height: d1Player.height ?? undefined,
    placeOfBirth: d1Player.placeOfBirth ?? undefined,
    position: d1Player.position ?? undefined,
    secondaryPosition: d1Player.secondaryPosition ?? undefined,
  };
  profile.links = d1Player.links.map((link, index) => {
    const hostname = new URL(link).hostname.replace(/^www\./, "");
    return {
      id: `${d1Player.id}-${index}`,
      link,
      name: hostname,
      description: hostname,
    };
  });

  const [articles, transfers] = await Promise.all([
    getAllArticlesForTag(100, d1Player.name),
    getTransfers(env.DB, { playerName: d1Player.name }),
  ]);
  profile.transfers = transfers;

  const comments = await GetCommentsByUrl(env, `/page/player/${requestedName}`);

  let score = 0;
  comments.forEach((c) => {
    score = score + c.rating;
  });

  const avg = Math.round(score / comments.length);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: d1Player.name,
          url: absoluteUrl(`/page/player/${encodeURIComponent(d1Player.name)}`),
          image: d1Player.picLink || undefined,
          birthDate: d1Player.dateOfBirth || undefined,
          birthPlace: d1Player.placeOfBirth || undefined,
          jobTitle:
            [d1Player.position, d1Player.secondaryPosition]
              .filter(Boolean)
              .join(" / ") || "Footballer",
          memberOf: { "@id": "https://www.tranmere-web.com/#team" },
          description: d1Player.biographyMarkdown || undefined,
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Players", pathname: "/players" },
          {
            name: d1Player.name,
            pathname: `/page/player/${encodeURIComponent(d1Player.name)}`,
          },
        ])}
      />
      <PlayerProfileView
        player={profile}
        articles={articles}
        comments={comments}
        avg={avg}
        biographyMarkdown={d1Player.biographyMarkdown}
        editableProfile={{
          dateOfBirth: d1Player.dateOfBirth ?? "",
          biography: d1Player.biographyMarkdown ?? "",
          picLink: d1Player.picLink ?? "",
          foot: d1Player.foot ?? "",
          height: d1Player.height ?? "",
          placeOfBirth: d1Player.placeOfBirth ?? "",
          position: d1Player.position ?? "",
        }}
      ></PlayerProfileView>
    </>
  );
}
