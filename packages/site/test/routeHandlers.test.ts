import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCloudflareContext: vi.fn(),
  getAdminSession: vi.fn(),
  getSession: vi.fn(),
  getGameBySeasonAndDate: vi.fn(),
  ensureAttendanceCorrectionsTable: vi.fn(),
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

vi.mock("@/lib/games", () => ({
  getGameBySeasonAndDate: mocks.getGameBySeasonAndDate,
}));

vi.mock("@/lib/attendanceCorrections", () => ({
  ensureAttendanceCorrectionsTable: mocks.ensureAttendanceCorrectionsTable,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

import {
  POST as createApp,
} from "@/app/api/admin/apps/route";
import {
  POST as createGoal,
} from "@/app/api/admin/goals/route";
import {
  PATCH as reviewAttendanceCorrection,
} from "@/app/api/attendance-corrections/route";
import { POST as sendContactMessage } from "@/app/api/contact-us/route";

type D1Result = { meta: { changes: number } };

function request(method: string, body: unknown) {
  return new NextRequest("http://localhost/api/test", {
    method,
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

function d1Fixture(options: {
  firstResults?: unknown[];
  runResults?: D1Result[];
} = {}) {
  const firstResults = [...(options.firstResults ?? [])];
  const runResults = [...(options.runResults ?? [])];
  const statements: Array<{
    sql: string;
    values: unknown[];
  }> = [];

  const db = {
    prepare: vi.fn((sql: string) => {
      const statement = {
        bind: vi.fn((...values: unknown[]) => {
          statements.push({ sql, values });
          return statement;
        }),
        first: vi.fn(async () => firstResults.shift() ?? null),
        run: vi.fn(async () => runResults.shift() ?? { meta: { changes: 1 } }),
      };
      return statement;
    }),
  } as unknown as D1Database;

  return { db, statements };
}

describe("admin mutation routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAdminSession.mockResolvedValue({
      user: { email: "admin@example.com" },
    });
  });

  it("rejects an unauthenticated appearance write before touching D1", async () => {
    const { db } = d1Fixture();
    mocks.getCloudflareContext.mockReturnValue({ env: { DB: db } });
    mocks.getAdminSession.mockResolvedValue(null);

    const response = await createApp(
      request("POST", {
        season: 2025,
        matchDate: "2025-08-02",
        playerName: "Test Player",
        opposition: "Test United",
      }),
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      message: "You do not have permission to manage appearances.",
    });
    expect((db.prepare as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
  });

  it("rejects malformed appearance and goal payloads", async () => {
    const { db } = d1Fixture();
    mocks.getCloudflareContext.mockReturnValue({ env: { DB: db } });

    const appResponse = await createApp(
      request("POST", {
        season: 2025,
        matchDate: "not-a-date",
        playerName: "Test Player",
        opposition: "Test United",
      }),
    );
    const goalResponse = await createGoal(
      request("POST", {
        season: 2025,
        matchDate: "2025-08-02",
        scorer: "",
        opposition: "Test United",
      }),
    );

    expect(appResponse.status).toBe(400);
    expect(goalResponse.status).toBe(400);
    expect((db.prepare as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled();
  });

  it("writes a validated appearance and revalidates its dependent pages", async () => {
    const { db, statements } = d1Fixture();
    mocks.getCloudflareContext.mockReturnValue({ env: { DB: db } });

    const response = await createApp(
      request("POST", {
        season: 2025,
        matchDate: "2025-08-02",
        playerName: "Test Player",
        competition: "League Two",
        opposition: "Test United",
        shirtNumber: 9,
        yellowCard: false,
        redCard: false,
        substituteYellowCard: false,
        substituteRedCard: false,
      }),
    );

    expect(response.status).toBe(201);
    expect(statements).toHaveLength(1);
    expect(statements[0].sql).toContain("INSERT INTO Apps");
    expect(statements[0].values).toEqual(
      expect.arrayContaining([2025, "2025-08-02", "Test Player", "Test United", 9]),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/apps");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/match/2025/2025-08-02");
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/page/player/Test%20Player",
    );
  });

  it("writes a validated goal and invalidates its match and player pages", async () => {
    const { db, statements } = d1Fixture();
    mocks.getCloudflareContext.mockReturnValue({ env: { DB: db } });

    const response = await createGoal(
      request("POST", {
        season: 2025,
        matchDate: "2025-08-02",
        scorer: "Test Player",
        opposition: "Test United",
        competition: "League Two",
        minute: "73",
        goalType: "Open play",
      }),
    );

    expect(response.status).toBe(201);
    expect(statements).toHaveLength(1);
    expect(statements[0].sql).toContain("INSERT INTO Goals");
    expect(statements[0].values).toEqual(
      expect.arrayContaining([
        2025,
        "2025-08-02",
        "Test Player",
        "Test United",
        "Open play",
      ]),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/goals");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/match/2025/2025-08-02");
    expect(mocks.revalidatePath).toHaveBeenCalledWith(
      "/page/player/Test%20Player",
    );
  });
});

describe("attendance-correction approval", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAdminSession.mockResolvedValue({
      user: { email: "admin@example.com" },
    });
  });

  it("updates the canonical D1 game and invalidates all affected archive pages", async () => {
    const { db, statements } = d1Fixture({
      firstResults: [
        {
          season: "2017",
          match_date: "2017-08-05",
          proposed_attendance: 7123,
        },
      ],
    });
    mocks.getCloudflareContext.mockReturnValue({ env: { DB: db } });

    const response = await reviewAttendanceCorrection(
      request("PATCH", { id: "correction-1", status: "approved" }),
    );

    expect(response.status).toBe(200);
    expect(mocks.ensureAttendanceCorrectionsTable).toHaveBeenCalledWith(db);
    expect(statements.map(({ sql }) => sql)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("UPDATE Games"),
        expect.stringContaining("UPDATE MatchAttendanceCorrections"),
      ]),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/match/2017/2017-08-05");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/season/2017");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/results");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/results/top-attendances");
  });

  it("does not approve a correction when the main game record is absent", async () => {
    const { db } = d1Fixture({
      firstResults: [
        {
          season: "2017",
          match_date: "2017-08-05",
          proposed_attendance: 7123,
        },
      ],
      runResults: [{ meta: { changes: 0 } }],
    });
    mocks.getCloudflareContext.mockReturnValue({ env: { DB: db } });

    const response = await reviewAttendanceCorrection(
      request("PATCH", { id: "correction-1", status: "approved" }),
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      message: "The main match record could not be found.",
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});

describe("contact form", () => {
  it("sends a validated message through the Cloudflare email binding", async () => {
    const send = vi.fn().mockResolvedValue({ messageId: "message-1" });
    mocks.getCloudflareContext.mockReturnValue({
      env: {
        AUTH0_ADMIN_EMAIL: "admin@example.com",
        CONTACT_EMAIL: { send },
      },
    });

    const response = await sendContactMessage(
      request("POST", {
        name: "A Supporter",
        email: "supporter@example.com",
        desc: "I found a useful programme.",
      }),
    );

    expect(response.status).toBe(201);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "admin@example.com",
        replyTo: { email: "supporter@example.com", name: "A Supporter" },
        subject: "Website contact: A Supporter",
        text: expect.stringContaining("I found a useful programme."),
      }),
    );
  });

  it("rejects malformed messages without attempting delivery", async () => {
    const send = vi.fn();
    mocks.getCloudflareContext.mockReturnValue({
      env: {
        AUTH0_ADMIN_EMAIL: "admin@example.com",
        CONTACT_EMAIL: { send },
      },
    });

    const response = await sendContactMessage(
      request("POST", { name: "", email: "not-an-email", desc: "" }),
    );

    expect(response.status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });
});
