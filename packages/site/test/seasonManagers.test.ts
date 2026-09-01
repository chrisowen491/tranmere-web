import { describe, expect, it } from "vitest";
import { getSeasonManagers } from "@/lib/seasonManagers";
import type { Manager } from "@tranmere-web/lib/src/tranmere-web-types";

describe("getSeasonManagers", () => {
  it("lists managers by appointment date in ascending order", () => {
    const managers: Manager[] = [
      {
        name: "Third manager",
        dateJoined: "2012-03-01",
        dateLeft: "2012-05-30",
      },
      {
        name: "First manager",
        dateJoined: "2010-06-01",
        dateLeft: "2011-09-30",
      },
      {
        name: "Second manager",
        dateJoined: "2011-10-01",
        dateLeft: "2012-02-29",
      },
      {
        name: "Outside season",
        dateJoined: "2013-01-01",
        dateLeft: "2013-12-31",
      },
    ];

    expect(getSeasonManagers(managers, 2011).map(({ name }) => name)).toEqual([
      "First manager",
      "Second manager",
      "Third manager",
    ]);
  });
});
