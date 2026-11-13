import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { HigherOrLowerGame } from "@/components/apps/HigherOrLowerGame";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import {
  buildDailyComparisons,
  type ComparisonPlayer,
} from "@/lib/higherOrLower";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Higher or Lower — Daily Tranmere player stats game",
  description:
    "Compare Tranmere Rovers players' recorded appearances and goals in ten daily Higher or Lower rounds.",
};

function dailyKey() {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Europe/London",
  }).format(new Date());
}

export default async function HigherOrLowerPage() {
  const db = (await getCloudflareContext({ async: true })).env.DB;
  const date = dailyKey();
  const { results } = await db
    .prepare(
      `SELECT s.player_name AS name, s.appearances, s.goals,
              MAX(p.pic_link) AS image
       FROM PlayerSeasonSummaries s
       JOIN Players p ON p.name = s.player_name
       WHERE s.season = 'TOTAL'
         AND s.appearances >= 10
         AND p.pic_link IS NOT NULL
         AND p.pic_link NOT LIKE '%simple/cccccc/none/cccccc/cccccc/none/cccccc%'
       GROUP BY s.player_name, s.appearances, s.goals
       ORDER BY s.player_name ASC`,
    )
    .all<ComparisonPlayer>();
  const gameNumber = Math.floor(
    (Date.parse(`${date}T00:00:00Z`) - Date.parse("2026-01-01T00:00:00Z")) /
      86400000,
  );

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Higher or Lower", pathname: "/higher-or-lower" },
        ])}
      />
      <HigherOrLowerGame
        date={date}
        gameNumber={gameNumber}
        rounds={buildDailyComparisons(results, date)}
      />
    </>
  );
}
