import { HONOURS_SEASONS } from "@tranmere-web/lib/src/honours-constants";
import type {
  AppRow,
  GoalRow,
  PlayerSeasonSummaryRow,
} from "@tranmere-web/lib/src/d1-types";
import {
  queryAppRows,
  queryGoalRows,
  queryPlayerSeasonSummaryRows,
} from "@tranmere-web/lib/src/d1-queries";
import { getPlayerStatisticsProfiles, type PlayerStatisticsProfile } from "./playerStatistics";

export type CultHeroCategory =
  | "long-spells"
  | "comebacks"
  | "super-subs"
  | "cup-heroes"
  | "promotion-contributors";

export interface CultHero {
  name: string;
  profile: PlayerStatisticsProfile;
  headline: string;
  detail: string;
  value: number;
  valueLabel: string;
}

export interface CultHeroSection {
  id: CultHeroCategory;
  eyebrow: string;
  title: string;
  description: string;
  heroes: CultHero[];
}

function isPlayerName(name: string) {
  return name.trim().toLowerCase() !== "own goal";
}

function seasonsForPlayer(rows: PlayerSeasonSummaryRow[]) {
  return rows
    .filter((row) => row.season !== "TOTAL" && /^\d{4}$/.test(row.season))
    .map((row) => Number(row.season))
    .sort((a, b) => a - b);
}

function longestRun(seasons: number[]) {
  if (!seasons.length) return { length: 0, start: 0, end: 0 };

  let best = { length: 1, start: seasons[0], end: seasons[0] };
  let current = { ...best };

  for (const season of seasons.slice(1)) {
    if (season === current.end + 1) {
      current = { ...current, length: current.length + 1, end: season };
    } else {
      current = { length: 1, start: season, end: season };
    }
    if (current.length > best.length) best = current;
  }

  return best;
}

function formatSeasonRange(start: number, end: number) {
  return start === end
    ? `${start}/${String(start + 1).slice(-2)}`
    : `${start}/${String(start + 1).slice(-2)}–${end}/${String(end + 1).slice(-2)}`;
}

function isCupCompetition(competition: string | null) {
  return Boolean(
    competition &&
      (/cup|trophy|play.?off/i.test(competition) || /^(FA|LC)\s*\d/i.test(competition)) &&
      !/league$/i.test(competition),
  );
}

function addProfiles(
  heroes: Omit<CultHero, "profile">[],
  profiles: Map<string, PlayerStatisticsProfile>,
) {
  return heroes.map((hero) => ({
    ...hero,
    profile: profiles.get(hero.name)!,
  }));
}

export function buildCultHeroSections(
  summaryRows: PlayerSeasonSummaryRow[],
  apps: AppRow[],
  goals: GoalRow[],
  profiles: Map<string, PlayerStatisticsProfile>,
): CultHeroSection[] {
  const summariesByPlayer = new Map<string, PlayerSeasonSummaryRow[]>();
  for (const row of summaryRows) {
    if (row.season === "TOTAL" || !isPlayerName(row.player_name)) continue;
    const current = summariesByPlayer.get(row.player_name) ?? [];
    current.push(row);
    summariesByPlayer.set(row.player_name, current);
  }

  const longSpells = [...summariesByPlayer.entries()]
    .map(([name, rows]) => {
      const run = longestRun(seasonsForPlayer(rows));
      const appearances = rows.reduce((total, row) => total + row.appearances, 0);
      return {
        name,
        headline: `${formatSeasonRange(run.start, run.end)} uninterrupted`,
        detail: `${appearances} recorded Rovers appearances across the archive.`,
        value: run.length,
        valueLabel: "seasons in one spell",
      };
    })
    .filter((hero) => hero.value >= 5)
    .sort((a, b) => b.value - a.value || b.detail.localeCompare(a.detail) || a.name.localeCompare(b.name))
    .slice(0, 8);

  const appsByPlayer = new Map<string, AppRow[]>();
  for (const app of apps) {
    if (!isPlayerName(app.player_name)) continue;
    const current = appsByPlayer.get(app.player_name) ?? [];
    current.push(app);
    appsByPlayer.set(app.player_name, current);
  }
  const comebacks = [...appsByPlayer.entries()]
    .map(([name, rows]) => {
      const dates = [...new Set(rows.map((row) => row.match_date))].sort();
      let bestGap = 0;
      let returnDate = "";
      for (let index = 1; index < dates.length; index += 1) {
        const gap = Date.parse(dates[index]) - Date.parse(dates[index - 1]);
        if (gap > bestGap) {
          bestGap = gap;
          returnDate = dates[index];
        }
      }
      return { name, bestGap, returnDate };
    })
    .filter((hero) => hero.bestGap >= 365 * 24 * 60 * 60 * 1000)
    .sort((a, b) => b.bestGap - a.bestGap || a.name.localeCompare(b.name))
    .slice(0, 8)
    .map((hero) => {
      const years = Math.round(
        hero.bestGap / (365.25 * 24 * 60 * 60 * 1000),
      );
      return {
        name: hero.name,
        headline: `Returned after ${years} ${years === 1 ? "year" : "years"} away`,
        detail: `Back in a Rovers line-up on ${hero.returnDate}.`,
        value: years,
        valueLabel: "years between appearances",
      };
    });

  const totalSummaries = summaryRows.filter(
    (row) => row.season === "TOTAL" && isPlayerName(row.player_name),
  );
  const superSubs = totalSummaries
    .filter((row) => row.substitute_appearances >= 20)
    .map((row) => ({
      name: row.player_name,
      headline: `${row.substitute_appearances} appearances from the bench`,
      detail: `${row.starts} starts alongside ${row.substitute_appearances} substitute appearances.`,
      value: row.substitute_appearances,
      valueLabel: "substitute appearances",
    }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
    .slice(0, 8);

  const cupGoals = new Map<string, number>();
  for (const goal of goals) {
    if (isPlayerName(goal.scorer) && isCupCompetition(goal.competition)) {
      cupGoals.set(goal.scorer, (cupGoals.get(goal.scorer) ?? 0) + 1);
    }
  }
  const cupHeroes = [...cupGoals.entries()]
    .map(([name, value]) => ({
      name,
      headline: `${value} cup goal${value === 1 ? "" : "s"} in the archive`,
      detail: "Goals recorded across cup, trophy and play-off matches.",
      value,
      valueLabel: "cup goals",
    }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
    .slice(0, 8);

  const promotionSeasons = new Map(
    HONOURS_SEASONS.filter((entry) =>
      entry.achievements.some(
        (achievement) => achievement.kind === "Promotion" || achievement.kind === "Play-offs",
      ),
    ).map((entry) => [entry.season, entry.achievements]),
  );
  const promotionContributions = new Map<string, { appearances: number; seasons: number[] }>();
  for (const row of summaryRows) {
    const season = Number(row.season);
    if (!promotionSeasons.has(season) || !isPlayerName(row.player_name)) continue;
    const current = promotionContributions.get(row.player_name) ?? {
      appearances: 0,
      seasons: [],
    };
    current.appearances += row.appearances;
    if (!current.seasons.includes(season)) current.seasons.push(season);
    promotionContributions.set(row.player_name, current);
  }
  const promotionHeroes = [...promotionContributions.entries()]
    .map(([name, contribution]) => ({
      name,
      headline: `${contribution.appearances} appearances in promotion campaigns`,
      detail: `Contributed in ${contribution.seasons
        .sort((a, b) => a - b)
        .map((season) => `${season}/${String(season + 1).slice(-2)}`)
        .join(", ")}.`,
      value: contribution.appearances,
      valueLabel: "promotion-season appearances",
    }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
    .slice(0, 8);

  return [
    {
      id: "long-spells",
      eyebrow: "Rovers through and through",
      title: "One-club spells",
      description: "The longest uninterrupted runs recorded in the Tranmere archive.",
      heroes: addProfiles(longSpells, profiles),
    },
    {
      id: "comebacks",
      eyebrow: "Back in the fold",
      title: "Comeback appearances",
      description: "The biggest gaps between one Rovers appearance and the next.",
      heroes: addProfiles(comebacks, profiles),
    },
    {
      id: "super-subs",
      eyebrow: "Change the game",
      title: "Substitute specialists",
      description: "The players most regularly trusted to make an impact from the bench.",
      heroes: addProfiles(superSubs, profiles),
    },
    {
      id: "cup-heroes",
      eyebrow: "When the cups came calling",
      title: "Cup heroes",
      description: "The archive's leading scorers in cup, trophy and play-off football.",
      heroes: addProfiles(cupHeroes, profiles),
    },
    {
      id: "promotion-contributors",
      eyebrow: "Seasons to remember",
      title: "Promotion contributors",
      description: "The most-used players across Rovers promotion and play-off-winning campaigns.",
      heroes: addProfiles(promotionHeroes, profiles),
    },
  ];
}

export async function getCultHeroSections(db: D1Database): Promise<CultHeroSection[]> {
  const [summaryRows, apps, goals] = await Promise.all([
    queryPlayerSeasonSummaryRows(db),
    queryAppRows(db),
    queryGoalRows(db),
  ]);
  const names = [...new Set([...summaryRows.map((row) => row.player_name), ...apps.map((app) => app.player_name), ...goals.map((goal) => goal.scorer)])];
  const profiles = await getPlayerStatisticsProfiles(db, names);
  return buildCultHeroSections(summaryRows, apps, goals, profiles);
}
