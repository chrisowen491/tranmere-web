import PlayerProfileView from "@/components/apps/PlayerProfileView";
import { getAllArticlesForTag } from "@/lib/api";
import { GetCommentsByUrl } from "@/lib/comments";
import { PlayerProfile, SlugParams } from "@/lib/types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import { getTransfers } from "@/lib/transfers";
import { getPlayerByName } from "@/lib/players";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl, breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import {
  countPlayerAppearanceRows,
  queryGoalRows,
  queryPlayerAppearanceRows,
  queryPlayerSeasonSummaryRows,
} from "@tranmere-web/lib/src/d1-queries";
import { mapPlayerSeasonSummary } from "@/lib/playerStatistics";
import { goalCountsByDate, mapPlayerAppearance } from "@/lib/playerAppearances";

const APPEARANCE_PAGE_SIZE = 25;

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
  const [seasonRows, appearanceRows, appearanceTotal, debutRows, goals] =
    await Promise.all([
      queryPlayerSeasonSummaryRows(env.DB, {
        player: d1Player.name,
        playerMatch: "exact",
      }),
      queryPlayerAppearanceRows(env.DB, d1Player.name, {
        limit: APPEARANCE_PAGE_SIZE,
      }),
      countPlayerAppearanceRows(env.DB, d1Player.name),
      queryPlayerAppearanceRows(env.DB, d1Player.name, {
        limit: 1,
        sort: "date-asc",
      }),
      queryGoalRows(env.DB, { scorer: d1Player.name, scorerMatch: "exact" }),
    ]);
  const goalsByDate = goalCountsByDate(goals);
  profile.seasons = seasonRows.map(mapPlayerSeasonSummary);
  profile.appearances = appearanceRows.map((row) =>
    mapPlayerAppearance(
      row,
      d1Player.name,
      goalsByDate.get(row.match_date) ?? 0,
    ),
  );
  profile.debut = debutRows[0]
    ? mapPlayerAppearance(
        debutRows[0],
        d1Player.name,
        goalsByDate.get(debutRows[0].match_date) ?? 0,
      )
    : undefined;

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
        appearancePagination={{
          total: appearanceTotal,
          pageSize: APPEARANCE_PAGE_SIZE,
        }}
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
