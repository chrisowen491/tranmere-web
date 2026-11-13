import { describe, expect, it } from "vitest";
import { biographyClues, buildWhoAmIClues } from "@/lib/whoAmIClues";

const player = {
  name: "Alex Example",
  position: "Central Midfielder",
  firstSeason: "2018",
  lastSeason: "2020",
  appearances: 42,
  goals: 3,
  debutDate: "2018-08-04",
  debutOpposition: "Example Town",
  biographyMarkdown:
    "Alex Example began his career in the academy at Riverside FC. He helped the youth side win a regional title before moving into senior football. A loan spell at Harbour Town brought regular first-team minutes and a promotion campaign. He currently plays for another club. [His former team](https://example.com/player) reached a cup final during that spell.",
};

describe("Who Am I clue deck", () => {
  it("uses historical biography details without revealing the name or stale current-club claims", () => {
    const clues = biographyClues(player.biographyMarkdown, player.name);
    expect(clues).toHaveLength(3);
    expect(clues.join(" ")).not.toMatch(/Alex|Example|currently|https?:\/\//i);
    expect(clues[0]).toContain("regional title");
  });

  it("keeps the daily deck stable, varied, and complete", () => {
    const first = buildWhoAmIClues(player, "2026-11-13");
    expect(first).toEqual(buildWhoAmIClues(player, "2026-11-13"));
    expect(first).toHaveLength(5);
    expect(first.some((clue) => clue.label === "From the biography")).toBe(
      true,
    );
    expect(first.at(-1)?.label).toBe("Name pattern");
    expect(buildWhoAmIClues(player, "2026-11-14")).not.toEqual(first);
  });

  it("falls back to archive facts when a biography has no usable sentence", () => {
    const clues = buildWhoAmIClues(
      { ...player, biographyMarkdown: "Alex Example is currently playing." },
      "2026-11-13",
    );
    expect(clues).toHaveLength(5);
    expect(clues.map((clue) => clue.label)).not.toContain("From the biography");
  });
});
