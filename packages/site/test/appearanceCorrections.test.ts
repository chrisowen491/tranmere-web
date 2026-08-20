import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  ensureAppearanceCorrectionsTable: vi.fn(),
  getAdminSession: vi.fn(),
  getCloudflareContext: vi.fn(),
  getSession: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: mocks.getCloudflareContext,
}));
vi.mock("@/lib/adminAuth", () => ({ getAdminSession: mocks.getAdminSession }));
vi.mock("@/lib/auth0", () => ({ auth0: { getSession: mocks.getSession } }));
vi.mock("@/lib/appearanceCorrections", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/lib/appearanceCorrections")>();
  return {
    ...original,
    ensureAppearanceCorrectionsTable: mocks.ensureAppearanceCorrectionsTable,
  };
});
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import {
  PATCH as reviewAppearanceCorrection,
  POST as suggestAppearanceCorrection,
} from "@/app/api/appearance-corrections/route";

function request(method: string, body: unknown) {
  return new NextRequest("http://localhost/api/appearance-corrections", {
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

const appearance = {
  id: "app-1",
  season: 1989,
  match_date: "1989-08-19",
  opposition: "Crewe Alexandra",
  player_name: "Ian Muir",
  shirt_number: 10,
  yellow_card: 0,
  red_card: 0,
  substituted_by: "Tony Thomas",
  substitute_time: "72",
  substitute_yellow_card: 0,
  substitute_red_card: 0,
};

describe("appearance correction workflow", () => {
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
    const response = await suggestAppearanceCorrection(
      request("POST", { appearanceId: "app-1", changes: { shirtNumber: "9" } }),
    );
    expect(response.status).toBe(401);
  });

  it("stores changes against one existing appearance", async () => {
    const { db, statements } = d1Fixture([appearance, null]);
    mocks.getCloudflareContext.mockReturnValue({ env: { DB: db } });
    const response = await suggestAppearanceCorrection(
      request("POST", {
        appearanceId: "app-1",
        changes: { shirtNumber: "9", yellowCard: true },
        source: "Match programme",
      }),
    );
    expect(response.status).toBe(201);
    const insert = statements.find(({ sql }) =>
      sql.includes("INSERT INTO AppearanceCorrections"),
    );
    expect(insert?.values).toEqual(
      expect.arrayContaining([
        "app-1",
        "1989",
        "1989-08-19",
        expect.stringContaining('"yellowCard":true'),
      ]),
    );
  });

  it("publishes approved fields to the targeted Apps row", async () => {
    const { db, statements } = d1Fixture([
      {
        appearance_id: "app-1",
        season: "1989",
        match_date: "1989-08-19",
        changes_json: JSON.stringify({ shirtNumber: "9", yellowCard: true }),
      },
      appearance,
    ]);
    mocks.getCloudflareContext.mockReturnValue({ env: { DB: db } });
    const response = await reviewAppearanceCorrection(
      request("PATCH", { id: "correction-1", status: "approved" }),
    );
    expect(response.status).toBe(200);
    const update = statements.find(({ sql }) =>
      sql.includes("UPDATE Apps SET player_name"),
    );
    expect(update?.values).toEqual([
      "Ian Muir",
      9,
      1,
      0,
      "Tony Thomas",
      "72",
      0,
      0,
      "app-1",
    ]);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/match/1989/1989-08-19");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/season/1989");
  });
});
