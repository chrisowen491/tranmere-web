import { describe, expect, it } from "vitest";
import { promotionAchievements } from "@/lib/promotionSquads";

describe("promotion squads", () => {
  it("uses promotion and play-off successes, newest first", () => {
    const achievements = promotionAchievements();

    expect(achievements.map(({ season }) => season)).toEqual([
      2018, 2017, 1990, 1988, 1975, 1966, 1937,
    ]);
    expect(
      achievements.every(
        ({ achievement }) =>
          achievement.kind === "Promotion" ||
          achievement.kind === "Play-offs" ||
          /promot(?:ed|ion)/i.test(
            `${achievement.title} ${achievement.detail}`,
          ),
      ),
    ).toBe(true);
  });
});
