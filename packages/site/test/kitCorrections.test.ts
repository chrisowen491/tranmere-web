import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAdminSession: vi.fn(),
  getCloudflareContext: vi.fn(),
  getGameBySeasonAndDate: vi.fn(),
  getSession: vi.fn(),
  resolveAccount: vi.fn(),
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
vi.mock("@/lib/accounts", () => ({ resolveAccount: mocks.resolveAccount }));
vi.mock("@/lib/games", () => ({
  getGameBySeasonAndDate: mocks.getGameBySeasonAndDate,
}));
vi.mock("@/lib/kitCorrections", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/lib/kitCorrections")>();
  return {
    ...original,
  };
});
vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

import {
  PATCH as reviewKitCorrection,
  POST as suggestKit,
} from "@/app/api/kit-corrections/route";

function request(method: string, body: unknown) {
  return new NextRequest("http://localhost/api/kit-corrections", {
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
  } as unknown as D1Database;
  return { db, statements };
}

describe("kit correction workflow", () => {
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
    mocks.resolveAccount.mockResolvedValue({
      id: "acct_supporter",
      authSub: "auth0|supporter",
    });
  });

  it("rejects kit values outside the avatar kit allow-list", async () => {
    const { db } = d1Fixture();
    mocks.getCloudflareContext.mockReturnValue({ env: { DB: db } });

    const response = await suggestKit(
      request("POST", {
        season: "1993",
        matchDate: "1993-08-14",
        proposedKit: "made-up-kit",
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.getGameBySeasonAndDate).not.toHaveBeenCalled();
  });

  it("stores a valid signed-in suggestion for review", async () => {
    const { db, statements } = d1Fixture();
    mocks.getCloudflareContext.mockReturnValue({ env: { DB: db } });
    mocks.getGameBySeasonAndDate.mockResolvedValue({
      home: "Tranmere Rovers",
      visitor: "Bolton Wanderers",
      kit: "1993",
    });

    const response = await suggestKit(
      request("POST", {
        season: "1993",
        matchDate: "1993-08-14",
        proposedKit: "1993A",
        explanation: "Shown in the match programme.",
      }),
    );

    expect(response.status).toBe(201);
    expect(
      statements.some(({ sql }) =>
        sql.includes("INSERT INTO MatchKitCorrections"),
      ),
    ).toBe(true);
    expect(statements.at(-1)?.values).toEqual(
      expect.arrayContaining(["1993", "1993-08-14", "1993A", "acct_supporter"]),
    );
  });

  it("publishes an approved kit and revalidates affected archive pages", async () => {
    const { db, statements } = d1Fixture([
      {
        season: "1993",
        match_date: "1993-08-14",
        proposed_kit: "1993A",
      },
    ]);
    mocks.getCloudflareContext.mockReturnValue({ env: { DB: db } });

    const response = await reviewKitCorrection(
      request("PATCH", { id: "correction-1", status: "approved" }),
    );

    expect(response.status).toBe(200);
    expect(statements.map(({ sql }) => sql)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("UPDATE Games SET kit"),
        expect.stringContaining("UPDATE MatchKitCorrections"),
      ]),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/match/1993/1993-08-14");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/season/1993");
  });
});
