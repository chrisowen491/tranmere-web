import { describe, expect, it } from "vitest";
import { matchEventTypeLabel } from "@tranmere-web/lib/src/match-event-constants";

describe("match event labels", () => {
  it("labels the initial fantasy event types", () => {
    expect(matchEventTypeLabel("PenaltySave")).toBe("Penalty save");
    expect(matchEventTypeLabel("PenaltyMiss")).toBe("Penalty miss");
    expect(matchEventTypeLabel("OwnGoal")).toBe("Own goal");
  });

  it("makes an extensible event code readable", () => {
    expect(matchEventTypeLabel("SecondYellowCard")).toBe("Second Yellow Card");
  });
});
