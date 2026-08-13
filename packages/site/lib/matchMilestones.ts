import {
  queryAppRows,
  queryGoalRows,
  queryGameDateRangeBounds,
  queryHatTrickRows,
  queryPlayerMilestoneRows,
} from "@tranmere-web/lib/src/d1-queries";
import type { AppRow, GoalRow } from "@tranmere-web/lib/src/d1-types";
import type { ManagerRecord } from "@/lib/managers";

export type MatchMilestoneKind =
  | "debut"
  | "final-appearance"
  | "first-goal"
  | "appearance-landmark"
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

function isMissingMilestonesTable(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes("no such table: PlayerMilestones")
  );
}

async function getLegacyPlayerMilestones(
  db: D1Database,
  input: {
    matchDate: string;
    apps: AppRow[];
    goals: GoalRow[];
    includeFinalAppearances?: boolean;
  },
): Promise<MatchMilestone[]> {
  const playerNames = distinct([
    ...input.apps.map((appearance) => appearance.player_name),
    ...input.apps
      .map((appearance) => appearance.substituted_by)
      .filter((name): name is string => Boolean(name)),
    ...input.apps
      .map((appearance) => appearance.substitute_substituted_by)
      .filter((name): name is string => Boolean(name)),
  ]);
  const scorers = distinct(input.goals.map((goal) => goal.scorer));
  const [appearanceHistories, goalHistories] = await Promise.all([
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
  ]);
  const milestones: MatchMilestone[] = [];

  for (const { name, rows } of appearanceHistories) {
    const dates = rows.map((appearance) => appearance.match_date).sort();
    if (dates[0] === input.matchDate) {
      milestones.push({
        kind: "debut",
        name,
        href: playerHref(name),
        label: "made his Tranmere debut",
      });
    }
    if (
      dates.at(-1) === input.matchDate &&
      input.includeFinalAppearances !== false
    ) {
      milestones.push({
        kind: "final-appearance",
        name,
        href: playerHref(name),
        label: "made his final Rovers appearance",
      });
    }
  }

  for (const { name, rows } of goalHistories) {
    if (rows.map((goal) => goal.match_date).sort()[0] === input.matchDate) {
      milestones.push({
        kind: "first-goal",
        name,
        href: playerHref(name),
        label: "scored his first Rovers goal",
      });
    }
  }

  return milestones;
}

/**
 * Finds notable Rovers milestones using the nightly derived milestone table.
 * This keeps match pages to one compact lookup rather than querying the full
 * appearance and goal history of every player involved.
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
  const [storedPlayerMilestones, hatTricks, managerGameBounds] =
    await Promise.all([
      queryPlayerMilestoneRows(db, { matchDate: input.matchDate }).catch(
        (error) => {
          if (isMissingMilestonesTable(error)) return null;
          throw error;
        },
      ),
      queryHatTrickRows(db, {
        season: input.season,
        matchDate: input.matchDate,
      }),
      input.manager
        ? queryGameDateRangeBounds(
            db,
            input.manager.dateJoined,
            ["now", "now()", "present"].includes(
              input.manager.dateLeft.toLowerCase(),
            )
              ? new Date().toISOString().slice(0, 10)
              : input.manager.dateLeft,
          )
        : Promise.resolve(null),
    ]);

  const milestones: MatchMilestone[] = storedPlayerMilestones
    ? storedPlayerMilestones.flatMap((milestone): MatchMilestone[] => {
        if (milestone.milestone_type === "debut") {
          return [
            {
              kind: "debut" as const,
              name: milestone.player_name,
              href: playerHref(milestone.player_name),
              label: "made his Tranmere debut",
            },
          ];
        }
        if (milestone.milestone_type === "latest-appearance") {
          return input.includeFinalAppearances === false
            ? []
            : [
                {
                  kind: "final-appearance" as const,
                  name: milestone.player_name,
                  href: playerHref(milestone.player_name),
                  label: "made his final Rovers appearance",
                },
              ];
        }
        if (milestone.milestone_type === "first-goal") {
          return [
            {
              kind: "first-goal" as const,
              name: milestone.player_name,
              href: playerHref(milestone.player_name),
              label: "scored his first Rovers goal",
            },
          ];
        }
        if (
          milestone.milestone_type === "appearance-landmark" &&
          milestone.milestone_value
        ) {
          return [
            {
              kind: "appearance-landmark" as const,
              name: milestone.player_name,
              href: playerHref(milestone.player_name),
              label: `made his ${milestone.milestone_value}th Rovers appearance`,
            },
          ];
        }
        return [];
      })
    : await getLegacyPlayerMilestones(db, input);

  for (const hatTrick of hatTricks) {
    milestones.push({
      kind: "hat-trick",
      name: hatTrick.player_name,
      href: playerHref(hatTrick.player_name),
      label: `scored a hat-trick (${hatTrick.goals} goals)`,
    });
  }

  if (input.manager && managerGameBounds?.first_match_date) {
    if (managerGameBounds.first_match_date === input.matchDate) {
      milestones.push({
        kind: "manager-first-game",
        name: input.manager.name,
        href: "/managers",
        label: "took charge for the first time",
      });
    }
    if (managerGameBounds.last_match_date === input.matchDate) {
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
