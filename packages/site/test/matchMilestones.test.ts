import { describe, expect, it } from "vitest";
import { isCurrentManager } from "@/lib/matchMilestones";
import type { ManagerRecord } from "@/lib/managers";

function managerWithEndDate(dateLeft: string): ManagerRecord {
  return {
    id: "manager-1",
    name: "Current Manager",
    dateJoined: "2025-01-01",
    dateLeft,
    dateLeftText: dateLeft,
  };
}

describe("match milestones", () => {
  it.each(["now", "now()", "present", " Present "])(
    "recognises %s as a current managerial tenure",
    (dateLeft) => {
      expect(isCurrentManager(managerWithEndDate(dateLeft))).toBe(true);
    },
  );

  it("does not treat a completed managerial tenure as current", () => {
    expect(isCurrentManager(managerWithEndDate("2026-05-01"))).toBe(false);
  });
});
