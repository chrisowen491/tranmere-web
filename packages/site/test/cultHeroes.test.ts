import { describe, expect, it } from "vitest";
import type {
  AppRow,
  GoalRow,
  PlayerSeasonSummaryRow,
} from "@tranmere-web/lib/src/d1-types";
import { buildCultHeroSections } from "@/lib/cultHeroes";

const profile = {
  picLink: "/avatar.svg",
  position: null,
  secondaryPosition: null,
};

function summary(
  player_name: string,
  season: string,
  overrides: Partial<PlayerSeasonSummaryRow> = {},
): PlayerSeasonSummaryRow {
  return {
    player_name,
    season,
    appearances: 20,
    starts: 15,
    substitute_appearances: 5,
    goals: 0,
    assists: 0,
    yellow_cards: 0,
    red_cards: 0,
    free_kicks: 0,
    penalties: 0,
    headers: 0,
    ...overrides,
  };
}

function app(player_name: string, match_date: string): AppRow {
  return {
    id: `${player_name}-${match_date}`,
    season: Number(match_date.slice(0, 4)),
    match_date,
    player_name,
    competition: "League",
    opposition: "Opponent",
    shirt_number: null,
    yellow_card: 0,
    red_card: 0,
    substitute_yellow_card: 0,
    substitute_red_card: 0,
    substitute_time: null,
    substituted_by: null,
    substitute_substituted_by: null,
  };
}

function goal(scorer: string, competition: string): GoalRow {
  return {
    id: `${scorer}-${competition}`,
    season: 1990,
    match_date: "1990-05-20",
    scorer,
    opposition: "Opponent",
    competition,
    minute: null,
    goal_type: null,
    assist: null,
    assist_type: null,
    foot: null,
    six_yard_box: 0,
    eighteen_yard_box: 0,
    cross_side: null,
    long_range: 0,
  };
}

describe("cult hero index", () => {
  it("builds distinct editorial routes from archive statistics", () => {
    const rows = [
      ...[1988, 1989, 1990, 1991, 1992].map((season) =>
        summary("Long Spell", String(season)),
      ),
      summary("Own Goal", "TOTAL", { substitute_appearances: 99 }),
      summary("Bench Icon", "TOTAL", { substitute_appearances: 34, starts: 12 }),
      summary("Promotion Player", "1988", { appearances: 31 }),
    ];
    const profiles = new Map(
      ["Long Spell", "Bench Icon", "Promotion Player", "Returnee", "Cup Hero"].map(
        (name) => [name, profile],
      ),
    );
    const sections = buildCultHeroSections(
      rows,
      [app("Returnee", "1990-01-01"), app("Returnee", "1992-02-01")],
      [goal("Cup Hero", "FA Cup"), goal("Cup Hero", "LC 2")],
      profiles,
    );

    expect(sections.find((section) => section.id === "long-spells")?.heroes[0])
      .toMatchObject({ name: "Long Spell", value: 5 });
    expect(sections.find((section) => section.id === "comebacks")?.heroes[0])
      .toMatchObject({ name: "Returnee", value: 2 });
    expect(sections.find((section) => section.id === "super-subs")?.heroes[0])
      .toMatchObject({ name: "Bench Icon", value: 34 });
    expect(sections.flatMap((section) => section.heroes).map((hero) => hero.name)).not.toContain(
      "Own Goal",
    );
    expect(sections.find((section) => section.id === "cup-heroes")?.heroes[0])
      .toMatchObject({ name: "Cup Hero", value: 2 });
    expect(
      sections
        .find((section) => section.id === "promotion-contributors")
        ?.heroes.some(
          (hero) => hero.name === "Promotion Player" && hero.value === 31,
        ),
    ).toBe(true);
  });
});
