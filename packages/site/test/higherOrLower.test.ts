import { describe, expect, it } from "vitest";
import {
  answerForRound,
  buildDailyComparisons,
  dailyRoundCount,
  scoreAnswers,
  type ComparisonPlayer,
  type Direction,
} from "@/lib/higherOrLower";

const players: ComparisonPlayer[] = Array.from({ length: 50 }, (_, index) => ({
  name: `Player ${index + 1}`,
  image: `/avatars/${index + 1}.svg`,
  appearances: 12 + index * 8,
  goals: 2 + index * 2,
}));

describe("Higher or Lower daily comparisons", () => {
  it("builds a repeatable ten-round deck without ties or repeat players", () => {
    const rounds = buildDailyComparisons(players, "2026-11-13");
    expect(rounds).toEqual(buildDailyComparisons(players, "2026-11-13"));
    expect(rounds).toHaveLength(dailyRoundCount);
    expect(
      rounds.filter((round) => round.metric === "appearances"),
    ).toHaveLength(5);
    expect(rounds.filter((round) => round.metric === "goals")).toHaveLength(5);
    expect(
      rounds.filter((round) => answerForRound(round) === "higher"),
    ).toHaveLength(5);
    expect(
      new Set(
        rounds.flatMap((round) => [round.baseline.name, round.challenger.name]),
      ).size,
    ).toBe(20);
    expect(
      rounds.every(
        (round) =>
          round.baseline[round.metric] !== round.challenger[round.metric],
      ),
    ).toBe(true);
    expect(buildDailyComparisons(players, "2026-11-14")).not.toEqual(rounds);
  });

  it("tracks score and consecutive correct answers", () => {
    const rounds = buildDailyComparisons(players, "2026-11-13");
    const correct = rounds.map(answerForRound);
    const wrong: Direction = correct[2] === "higher" ? "lower" : "higher";
    expect(
      scoreAnswers(rounds, [correct[0], correct[1], wrong, correct[3]]),
    ).toEqual({
      score: 3,
      streak: 1,
      bestStreak: 2,
    });
  });

  it("omits a comparison when the archive cannot supply a distinct pair", () => {
    expect(buildDailyComparisons(players.slice(0, 1), "2026-11-13")).toEqual(
      [],
    );
  });
});
