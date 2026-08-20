import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  ensureGoalCorrectionsTable: vi.fn(),
  getAdminSession: vi.fn(),
  getCloudflareContext: vi.fn(),
  getSession: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: mocks.getCloudflareContext,
}));
vi.mock("@/lib/adminAuth", () => ({
  getAdminSession: mocks.getAdminSession,
}));
vi.mock("@/lib/auth0", () => ({
  auth0: { getSession: mocks.getSession },
}));
vi.mock("@/lib/goalCorrections", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/lib/goalCorrections")>();
  return {
    ...original,
    ensureGoalCorrectionsTable: mocks.ensureGoalCorrectionsTable,
  };
});
vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

import {
  PATCH as reviewGoalCorrection,
  POST as suggestGoalCorrection,
} from "@/app/api/goal-corrections/route";

function request(method: string, body: unknown) {
  return new NextRequest("http://localhost/api/goal-corrections", {
    method,
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

function d1Fixture(firstResults: unknown[] = []) {
  const results = [...firstResults];
  const statements: Array<{ sql: string; values: unknown[] }> = [];
  const db = {
    prepare: vi.fn((sql: string) => {
      const statement = {
        bind: vi.fn((...values: unknown[]) => {
          statements.push({ sql, values });
          return statement;
        }),
        first: vi.fn(async () => results.shift() ?? null),
        run: vi.fn(async () => ({ meta: { changes: 1 } })),
      };
      return statement;
    }),
    batch: vi.fn(async (items: unknown[]) =>
      items.map(() => ({ meta: { changes: 1 } })),
    ),
  } as unknown as D1Database;
  return { db, statements };
}

const goal = {
  id: "goal-1",
  season: 2024,
  match_date: "2024-08-20",
  opposition: "Everton U21",
  scorer: "Josh Davison",
  minute: "11",
  goal_type: "Shot",
  foot: "Right",
  assist: "Harvey Saunders",
  assist_type: "Pass",
};

describe("goal correction workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({
      user: {
        sub: "auth0|supporter",
        name: "A Supporter",
        email: "supporter@example.com",
      },
    });
    mocks.getAdminSession.mockResolvedValue({
      user: { email: "admin@example.com" },
    });
  });

  it("requires a signed-in supporter", async () => {
    mocks.getSession.mockResolvedValue(null);
    const response = await suggestGoalCorrection(
      request("POST", { goalId: "goal-1", changes: { minute: "12" } }),
    );
    expect(response.status).toBe(401);
  });

  it("stores changes against one existing goal", async () => {
    const { db, statements } = d1Fixture([goal, null]);
    mocks.getCloudflareContext.mockReturnValue({ env: { DB: db } });

    const response = await suggestGoalCorrection(
      request("POST", {
        goalId: "goal-1",
        changes: { minute: "12", goalType: "Open play", foot: "Left" },
        source: "Match report",
      }),
    );

    expect(response.status).toBe(201);
    const insert = statements.find(({ sql }) =>
      sql.includes("INSERT INTO GoalCorrections"),
    );
    expect(insert?.values).toEqual(
      expect.arrayContaining([
        "goal-1",
        "2024",
        "2024-08-20",
        expect.stringContaining('"foot":"Left"'),
      ]),
    );
  });

  it("publishes approved fields to the targeted Goals row", async () => {
    const { db, statements } = d1Fixture([
      {
        goal_id: "goal-1",
        season: "2024",
        match_date: "2024-08-20",
        changes_json: JSON.stringify({
          minute: "12",
          goalType: "Open play",
          foot: "Left",
        }),
      },
      goal,
    ]);
    mocks.getCloudflareContext.mockReturnValue({ env: { DB: db } });

    const response = await reviewGoalCorrection(
      request("PATCH", { id: "correction-1", status: "approved" }),
    );

    expect(response.status).toBe(200);
    const goalUpdate = statements.find(({ sql }) =>
      sql.includes("UPDATE Goals SET scorer"),
    );
    expect(goalUpdate?.values).toEqual([
      "Josh Davison",
      "12",
      "Open play",
      "Left",
      "Harvey Saunders",
      "Pass",
      "goal-1",
    ]);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/match/2024/2024-08-20");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/season/2024");
  });
});
