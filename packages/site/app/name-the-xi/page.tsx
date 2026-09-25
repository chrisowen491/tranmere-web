import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { JsonLd, breadcrumbJsonLd } from "@/components/seo/JsonLd";
import { NameTheXiGame } from "@/components/apps/NameTheXiGame";
import { getWhoAmIPlayerOptions } from "@/lib/players";

export const metadata: Metadata = {
  title: "Name the XI — Daily Tranmere lineup quiz",
  description:
    "Can you name the Tranmere starting eleven from a match in the club archive? Play the daily lineup quiz.",
};

function dailyKey() {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Europe/London",
  }).format(new Date());
}

function hash(value: string) {
  let result = 2166136261;
  for (const character of value) {
    result ^= character.charCodeAt(0);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

interface CandidateCount {
  total: number;
}

interface PuzzleMatch {
  id: string;
  season: number;
  match_date: string;
  competition: string;
  opposition: string;
  full_time_score: string;
}

interface StarterRow {
  player_name: string;
  shirt_number: number | null;
}

const eligibleMatch = `
  SELECT COUNT(*) AS total
  FROM Games g
  WHERE g.full_time_score IS NOT NULL
    AND TRIM(g.full_time_score) <> ''
    AND LOWER(TRIM(g.competition)) <> 'friendly'
    AND g.match_date <= ?
    AND (
      SELECT COUNT(DISTINCT a.player_name)
      FROM Apps a
      WHERE a.season = g.season
        AND a.match_date = g.match_date
        AND a.substitute_time IS NULL
    ) = 11`;

export default async function NameTheXiPage() {
  const db = (await getCloudflareContext({ async: true })).env.DB;
  const date = dailyKey();
  const candidateCount = await db
    .prepare(eligibleMatch)
    .bind(date)
    .first<CandidateCount>();
  const total = candidateCount?.total ?? 0;
  const offset = total ? hash(date) % total : 0;

  const match = total
    ? await db
        .prepare(
          `SELECT g.id, g.season, g.match_date, g.competition,
                  g.opposition, g.full_time_score
           FROM Games g
           WHERE g.full_time_score IS NOT NULL
             AND TRIM(g.full_time_score) <> ''
             AND LOWER(TRIM(g.competition)) <> 'friendly'
             AND g.match_date <= ?
             AND (
               SELECT COUNT(DISTINCT a.player_name)
               FROM Apps a
               WHERE a.season = g.season
                 AND a.match_date = g.match_date
                 AND a.substitute_time IS NULL
             ) = 11
           ORDER BY g.match_date ASC, g.id ASC
           LIMIT 1 OFFSET ?`,
        )
        .bind(date, offset)
        .first<PuzzleMatch>()
    : null;

  const starters = match
    ? await db
        .prepare(
          `SELECT player_name, MIN(shirt_number) AS shirt_number
           FROM Apps
           WHERE season = ? AND match_date = ? AND substitute_time IS NULL
           GROUP BY player_name
           ORDER BY shirt_number IS NULL, shirt_number ASC, player_name ASC`,
        )
        .bind(match.season, match.match_date)
        .all<StarterRow>()
    : null;
  const candidates = await getWhoAmIPlayerOptions(db);
  const gameNumber = Math.floor(
    (Date.parse(`${date}T00:00:00Z`) - Date.parse("2026-01-01T00:00:00Z")) /
      86400000,
  );

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Name the XI", pathname: "/name-the-xi" },
        ])}
      />
      <NameTheXiGame
        date={date}
        gameNumber={gameNumber}
        candidates={candidates.map((player) => player.name)}
        puzzle={
          match && starters?.results.length === 11
            ? {
                season: match.season,
                date: match.match_date,
                competition: match.competition,
                opposition: match.opposition,
                score: match.full_time_score,
                starters: starters.results.map((starter) => ({
                  name: starter.player_name,
                  shirtNumber: starter.shirt_number,
                })),
              }
            : null
        }
      />
    </>
  );
}
