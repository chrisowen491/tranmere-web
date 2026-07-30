import type {
  Appearance,
  Match,
} from "@tranmere-web/lib/src/tranmere-web-types";
import type { PlayerProfile } from "@/lib/types";
import { getPlayersByNames } from "@/lib/players";

export interface PartnershipMatch {
  date: string;
  season: string;
  opposition: string;
  competition: string;
  result: "W" | "D" | "L" | null;
  scored: number | null;
  conceded: number | null;
  firstPlayerGoals: number;
  secondPlayerGoals: number;
}

export interface PlayerPartnership {
  firstPlayer: string;
  secondPlayer: string;
  matches: PartnershipMatch[];
  sharedSeasons: string[];
}

function appearanceKey(appearance: Appearance) {
  return `${appearance.Season}|${appearance.Date.slice(0, 10)}`;
}

function matchKey(match: Match) {
  return `${match.season}|${match.date.slice(0, 10)}`;
}

function matchResult(match?: Match) {
  if (!match) return null;
  const isHome = match.home === "Tranmere Rovers";
  const scored = isHome ? match.hgoal : match.vgoal;
  const conceded = isHome ? match.vgoal : match.hgoal;
  return {
    result: (scored > conceded ? "W" : scored < conceded ? "L" : "D") as
      "W" | "D" | "L",
    scored,
    conceded,
  };
}

export async function getPlayerPartnership(
  db: D1Database,
  baseUrl: string,
  firstPlayer: string,
  secondPlayer: string,
): Promise<PlayerPartnership> {
  const profiles = await getPlayersByNames(db, [firstPlayer, secondPlayer]);
  if (!profiles.has(firstPlayer) || !profiles.has(secondPlayer)) {
    throw new Error("Player not found");
  }

  const loadProfile = async (name: string) => {
    const response = await fetch(
      `${baseUrl}/page/player/${encodeURIComponent(name)}?json=true`,
      { next: { revalidate: 7200 } },
    );
    if (!response.ok) throw new Error(`Unable to load ${name}`);
    return (await response.json()) as PlayerProfile;
  };

  const [firstProfile, secondProfile] = await Promise.all([
    loadProfile(firstPlayer),
    loadProfile(secondPlayer),
  ]);
  const firstAppearances = firstProfile.appearances || [];
  const secondAppearances = new Map(
    (secondProfile.appearances || []).map((appearance) => [
      appearanceKey(appearance),
      appearance,
    ]),
  );
  const sharedAppearances = firstAppearances
    .filter((appearance) => secondAppearances.has(appearanceKey(appearance)))
    .toSorted(
      (a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime(),
    );
  const sharedSeasons = [
    ...new Set(sharedAppearances.map((appearance) => appearance.Season)),
  ].sort((a, b) => Number(a) - Number(b));

  const seasonResults = await Promise.all(
    sharedSeasons.map(async (season) => {
      const response = await fetch(
        `${baseUrl}/result-search/?season=${encodeURIComponent(season)}&sort=Date`,
        { next: { revalidate: 7200 } },
      );
      if (!response.ok) return [];
      return ((await response.json()) as { results: Match[] }).results;
    }),
  );
  const results = new Map(
    seasonResults.flat().map((match) => [matchKey(match), match]),
  );

  return {
    firstPlayer,
    secondPlayer,
    sharedSeasons,
    matches: sharedAppearances.map((firstAppearance) => {
      const key = appearanceKey(firstAppearance);
      const secondAppearance = secondAppearances.get(key)!;
      const match = results.get(key);
      const outcome = matchResult(match);
      return {
        date: firstAppearance.Date.slice(0, 10),
        season: firstAppearance.Season,
        opposition:
          match?.opposition ||
          firstAppearance.Opposition ||
          secondAppearance.Opposition,
        competition:
          match?.competition ||
          firstAppearance.Competition ||
          secondAppearance.Competition,
        result: outcome?.result || null,
        scored: outcome?.scored ?? null,
        conceded: outcome?.conceded ?? null,
        firstPlayerGoals: firstAppearance.Goals || 0,
        secondPlayerGoals: secondAppearance.Goals || 0,
      };
    }),
  };
}
