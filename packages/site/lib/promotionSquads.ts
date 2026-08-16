import {
  HONOURS_SEASONS,
  type HonoursAchievement,
} from "@tranmere-web/lib/src/honours-constants";
import { queryPlayerSeasonSummaryRows } from "@tranmere-web/lib/src/d1-queries";
import { getManagerAtDate, type ManagerRecord } from "@/lib/managers";
import {
  defaultPlayerAvatar,
  getPlayerStatisticsProfiles,
  mapPlayerSeasonSummary,
  type PlayerStatisticsProfile,
} from "@/lib/playerStatistics";

export interface PromotionSquadPlayer {
  name: string;
  starts: number;
  substitutes: number;
  appearances: number;
  goals: number;
  profile: PlayerStatisticsProfile;
}

export interface PromotionSquad {
  season: number;
  achievement: HonoursAchievement;
  manager: ManagerRecord | null;
  players: PromotionSquadPlayer[];
}

function isPromotionAchievement(achievement: HonoursAchievement) {
  return (
    achievement.kind === "Promotion" ||
    achievement.kind === "Play-offs" ||
    /promot(?:ed|ion)/i.test(`${achievement.title} ${achievement.detail}`)
  );
}

export function promotionAchievements() {
  return HONOURS_SEASONS.flatMap(({ season, achievements }) =>
    achievements
      .filter(isPromotionAchievement)
      .map((achievement) => ({ season, achievement })),
  ).sort((left, right) => right.season - left.season);
}

export async function getPromotionSquads(db: D1Database) {
  return Promise.all(
    promotionAchievements().map(async ({ season, achievement }) => {
      const rows = await queryPlayerSeasonSummaryRows(db, {
        season: String(season),
        sort: "starts",
        limit: 14,
      });
      const players = rows.map(mapPlayerSeasonSummary);
      const profiles = await getPlayerStatisticsProfiles(
        db,
        players.map((player) => player.Player),
      );
      const manager = await getManagerAtDate(db, achievement.achievedOn);

      return {
        season,
        achievement,
        manager,
        players: players.map((player) => ({
          name: player.Player,
          starts: player.starts,
          substitutes: player.subs,
          appearances: player.starts + player.subs,
          goals: player.goals,
          profile: profiles.get(player.Player) ?? {
            picLink: defaultPlayerAvatar,
            position: null,
            secondaryPosition: null,
            exists: false,
          },
        })),
      } satisfies PromotionSquad;
    }),
  );
}
