import type {
  Appearance,
  Match,
  PlayerSeasonSummary,
} from "@tranmere-web/lib/src/tranmere-web-types";
import type { ManagerRecord } from "@/lib/managers";
import type { PlayerProfile } from "@/lib/types";
import { getPlayersByNames, type PlayerRecord } from "@/lib/players";

export interface TrustedXiPlayer {
  name: string;
  position: string;
  picLink: string;
  starts: number;
  substituteAppearances: number;
  goals: number;
}

export interface ManagerTrustedXi {
  manager: ManagerRecord;
  formation: "4–4–2";
  rows: TrustedXiPlayer[][];
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  captain: string;
  archiveStarts: string;
}

function seasonForDate(value: string) {
  const date = new Date(value);
  const year = date.getUTCFullYear();
  return date.getUTCMonth() >= 6 ? year : year - 1;
}

function seasonsForManager(manager: ManagerRecord) {
  const first = Math.max(1977, seasonForDate(manager.dateJoined));
  const dateLeft = manager.dateLeft.toLowerCase().startsWith("now")
    ? new Date().toISOString().slice(0, 10)
    : manager.dateLeft;
  const final = Math.max(first, seasonForDate(dateLeft));
  return Array.from({ length: final - first + 1 }, (_, index) => first + index);
}

function positionGroup(position?: string | null) {
  const value = position?.toLowerCase() || "";
  if (value.includes("goalkeeper")) return "goalkeeper";
  if (value.includes("full back") || value.includes("fullback"))
    return "fullback";
  if (value.includes("defender")) return "defender";
  if (value.includes("winger")) return "winger";
  if (value.includes("midfielder")) return "midfielder";
  if (value.includes("striker") || value.includes("forward")) return "striker";
  return "other";
}

function appearanceKey(appearance: Appearance) {
  return `${appearance.Season}|${appearance.Date.slice(0, 10)}`;
}

function dedupeAppearances(appearances: Appearance[]) {
  const records = new Map<string, Appearance>();
  appearances.forEach((appearance) => {
    const key = appearanceKey(appearance);
    const current = records.get(key);
    if (
      !current ||
      (current.Type?.toLowerCase().includes("sub") &&
        !appearance.Type?.toLowerCase().includes("sub"))
    ) {
      records.set(key, appearance);
    }
  });
  return [...records.values()];
}

async function inBatches<T, R>(
  values: T[],
  size: number,
  callback: (value: T) => Promise<R>,
) {
  const output: R[] = [];
  for (let index = 0; index < values.length; index += size) {
    output.push(
      ...(await Promise.all(values.slice(index, index + size).map(callback))),
    );
  }
  return output;
}

export async function getManagerTrustedXi(
  db: D1Database,
  baseUrl: string,
  manager: ManagerRecord,
): Promise<ManagerTrustedXi> {
  const seasons = seasonsForManager(manager);
  const seasonSummaries = await Promise.all(
    seasons.map(async (season) => {
      const response = await fetch(
        `${baseUrl}/player-search/?season=${season}&sort=Starts`,
        { next: { revalidate: 7200 } },
      );
      if (!response.ok) return [];
      return ((await response.json()) as { players: PlayerSeasonSummary[] })
        .players;
    }),
  );
  const playerProfiles = await getPlayersByNames(
    db,
    seasonSummaries.flat().map((summary) => summary.Player),
  );
  const candidates = new Map<
    string,
    { player: PlayerRecord; appearances: number }
  >();
  seasonSummaries.flat().forEach((summary) => {
    const existing = candidates.get(summary.Player);
    const player = playerProfiles.get(summary.Player);
    if (!player) return;
    candidates.set(summary.Player, {
      player,
      appearances: (existing?.appearances || 0) + summary.starts + summary.subs,
    });
  });

  const candidatePool = [
    ...new Set(
      [
        "goalkeeper",
        "fullback",
        "defender",
        "winger",
        "midfielder",
        "striker",
        "other",
      ].flatMap((group) =>
        [...candidates.entries()]
          .filter(([, value]) => positionGroup(value.player.position) === group)
          .sort((a, b) => b[1].appearances - a[1].appearances)
          .slice(0, group === "other" ? 8 : 12)
          .map(([name]) => name),
      ),
    ),
  ];
  const joined = manager.dateJoined.slice(0, 10);
  const left = manager.dateLeft.toLowerCase().startsWith("now")
    ? new Date().toISOString().slice(0, 10)
    : manager.dateLeft.slice(0, 10);
  const exactRecords = await inBatches(candidatePool, 10, async (name) => {
    const response = await fetch(
      `${baseUrl}/page/player/${encodeURIComponent(name)}?json=true`,
      { next: { revalidate: 7200 } },
    );
    if (!response.ok) return null;
    const profile = (await response.json()) as PlayerProfile;
    const appearances = dedupeAppearances(profile.appearances || []).filter(
      (appearance) => {
        const date = appearance.Date.slice(0, 10);
        return date >= joined && date <= left;
      },
    );
    if (!appearances.length) return null;
    return {
      name,
      position: playerProfiles.get(name)?.position || "",
      picLink: playerProfiles.get(name)?.picLink || "",
      starts: appearances.filter(
        (appearance) => !appearance.Type?.toLowerCase().includes("sub"),
      ).length,
      substituteAppearances: appearances.filter((appearance) =>
        appearance.Type?.toLowerCase().includes("sub"),
      ).length,
      goals: appearances.reduce(
        (total, appearance) => total + (appearance.Goals || 0),
        0,
      ),
    } satisfies TrustedXiPlayer;
  });
  const ranked = exactRecords
    .filter((player): player is TrustedXiPlayer => player !== null)
    .filter((player) => player.starts > 0)
    .sort(
      (a, b) =>
        b.starts - a.starts ||
        b.starts +
          b.substituteAppearances -
          (a.starts + a.substituteAppearances),
    );
  const selected = new Set<string>();
  const take = (group: string, count: number) => {
    const positional = ranked.filter(
      (player) =>
        !selected.has(player.name) && positionGroup(player.position) === group,
    );
    const fallback = ranked.filter((player) => !selected.has(player.name));
    const result = [...positional, ...fallback]
      .filter(
        (player, index, all) =>
          all.findIndex((candidate) => candidate.name === player.name) ===
          index,
      )
      .slice(0, count);
    result.forEach((player) => selected.add(player.name));
    return result;
  };
  const goalkeeper = take("goalkeeper", 1);
  const fullbacks = take("fullback", 2);
  const defenders = take("defender", 2);
  const wingers = take("winger", 2);
  const midfielders = take("midfielder", 2);
  const strikers = take("striker", 2);
  const defined = (
    player: TrustedXiPlayer | undefined,
  ): player is TrustedXiPlayer => Boolean(player);

  const resultResponse = await fetch(
    `${baseUrl}/result-search/?manager=${encodeURIComponent(
      `${joined},${left}`,
    )}&sort=Date`,
    { next: { revalidate: 7200 } },
  );
  const matches = resultResponse.ok
    ? ((await resultResponse.json()) as { results: Match[] }).results
    : [];
  const outcomes = matches.map((match) => {
    const home = match.home === "Tranmere Rovers";
    const scored = home ? match.hgoal : match.vgoal;
    const conceded = home ? match.vgoal : match.hgoal;
    return scored > conceded ? "W" : scored < conceded ? "L" : "D";
  });

  return {
    manager,
    formation: "4–4–2",
    rows: [
      strikers,
      [wingers[0], ...midfielders, wingers[1]].filter(defined),
      [fullbacks[0], ...defenders, fullbacks[1]].filter(defined),
      goalkeeper,
    ],
    matches: matches.length,
    wins: outcomes.filter((outcome) => outcome === "W").length,
    draws: outcomes.filter((outcome) => outcome === "D").length,
    losses: outcomes.filter((outcome) => outcome === "L").length,
    captain: ranked[0]?.name || "",
    archiveStarts: `${firstSeasonLabel(seasons[0])}`,
  };
}

function firstSeasonLabel(season: number) {
  return `${season}/${String(season + 1).slice(-2)}`;
}
