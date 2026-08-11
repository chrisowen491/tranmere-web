import {
  queryAppRows,
  queryGoalRows,
  queryHatTrickRows,
} from "@tranmere-web/lib/src/d1-queries";
import type { AppRow, GoalRow } from "@tranmere-web/lib/src/d1-types";
import type { ManagerRecord } from "@/lib/managers";
import { searchGames } from "@/lib/games";

export type MatchMilestoneKind =
  | "debut"
  | "final-appearance"
  | "first-goal"
  | "hat-trick"
  | "manager-first-game"
  | "manager-last-game";

export interface MatchMilestone {
  kind: MatchMilestoneKind;
  name: string;
  href: string;
  label: string;
}

function playerHref(name: string) {
  return `/page/player/${encodeURIComponent(name)}`;
}

function distinct(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function isFirstOrLastAppearance(appearances: AppRow[], matchDate: string) {
  const dates = appearances.map((appearance) => appearance.match_date).sort();
  return {
    first: dates[0] === matchDate,
    last: dates.at(-1) === matchDate,
  };
}

function isFirstGoal(goals: GoalRow[], matchDate: string) {
  return goals.map((goal) => goal.match_date).sort()[0] === matchDate;
}

/**
 * Finds notable Rovers milestones for a match using the historic D1 records.
 * Apps and goals are intentionally queried separately because an appearance is
 * a wider career event than a goal, while a hat-trick is an explicit archive
 * record rather than inferred from the scoreline.
 */
export async function getMatchMilestones(
  db: D1Database,
  input: {
    season: number;
    matchDate: string;
    apps: AppRow[];
    goals: GoalRow[];
    manager: ManagerRecord | null;
    includeFinalAppearances?: boolean;
  },
): Promise<MatchMilestone[]> {
  const playerNames = distinct([
    ...input.apps.map((appearance) => appearance.player_name),
    ...input.apps
      .map((appearance) => appearance.substituted_by)
      .filter((name): name is string => Boolean(name)),
  ]);
  const scorers = distinct(input.goals.map((goal) => goal.scorer));

  const [appearanceHistories, goalHistories, hatTricks, managerGames] =
    await Promise.all([
      Promise.all(
        playerNames.map(async (name) => ({
          name,
          rows: (
            await Promise.all([
              queryAppRows(db, { player: name, playerMatch: "exact" }),
              queryAppRows(db, { substitutedBy: name }),
            ])
          )
            .flat()
            .filter(
              (appearance, index, rows) =>
                rows.findIndex(({ id }) => id === appearance.id) === index,
            ),
        })),
      ),
      Promise.all(
        scorers.map(async (name) => ({
          name,
          rows: await queryGoalRows(db, { scorer: name, scorerMatch: "exact" }),
        })),
      ),
      queryHatTrickRows(db, {
        season: input.season,
        matchDate: input.matchDate,
      }),
      input.manager
        ? searchGames(db, {
            dateFrom: input.manager.dateJoined,
            dateTo: ["now", "now()", "present"].includes(
              input.manager.dateLeft.toLowerCase(),
            )
              ? new Date().toISOString().slice(0, 10)
              : input.manager.dateLeft,
            sort: "date-asc",
          })
        : Promise.resolve(null),
    ]);

  const milestones: MatchMilestone[] = [];
  for (const { name, rows } of appearanceHistories) {
    const { first, last } = isFirstOrLastAppearance(rows, input.matchDate);
    if (first) {
      milestones.push({
        kind: "debut",
        name,
        href: playerHref(name),
        label: "made his Tranmere debut",
      });
    }
    if (last && input.includeFinalAppearances !== false) {
      milestones.push({
        kind: "final-appearance",
        name,
        href: playerHref(name),
        label: "made his final Rovers appearance",
      });
    }
  }

  for (const { name, rows } of goalHistories) {
    if (isFirstGoal(rows, input.matchDate)) {
      milestones.push({
        kind: "first-goal",
        name,
        href: playerHref(name),
        label: "scored his first Rovers goal",
      });
    }
  }

  for (const hatTrick of hatTricks) {
    milestones.push({
      kind: "hat-trick",
      name: hatTrick.player_name,
      href: playerHref(hatTrick.player_name),
      label: `scored a hat-trick (${hatTrick.goals} goals)`,
    });
  }

  if (input.manager && managerGames?.results.length) {
    const managerGamesOnDates = managerGames.results.map((game) => game.date);
    if (managerGamesOnDates[0] === input.matchDate) {
      milestones.push({
        kind: "manager-first-game",
        name: input.manager.name,
        href: "/managers",
        label: "took charge for the first time",
      });
    }
    if (managerGamesOnDates.at(-1) === input.matchDate) {
      milestones.push({
        kind: "manager-last-game",
        name: input.manager.name,
        href: "/managers",
        label: "took charge for the final time",
      });
    }
  }

  return milestones;
}
