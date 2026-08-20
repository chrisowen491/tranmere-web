import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  ensureUserProfile: vi.fn(),
  getCloudflareContext: vi.fn(),
  getSession: vi.fn(),
  resolveAccount: vi.fn(),
  withdrawCorrection: vi.fn(),
}));

vi.mock("@/lib/auth0", () => ({ auth0: { getSession: mocks.getSession } }));
vi.mock("@/lib/accounts", () => ({ resolveAccount: mocks.resolveAccount }));
vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: mocks.getCloudflareContext,
}));
vi.mock("@/lib/userProfiles", () => ({
  ensureUserProfile: mocks.ensureUserProfile,
  supporterUsername: (user: { username?: string }) => user.username,
}));
vi.mock("@/lib/correctionActivity", () => ({
  withdrawCorrection: mocks.withdrawCorrection,
}));

import {
  DELETE as withdraw,
  PUT as updateRecognition,
} from "@/app/api/correction-activity/route";

function request(method: string, body: unknown) {
  return new NextRequest("http://localhost/api/correction-activity", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("correction activity API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({
      user: { sub: "auth0|supporter", username: "roversfan" },
    });
    mocks.getCloudflareContext.mockReturnValue({ env: { DB: "db" } });
    mocks.resolveAccount.mockResolvedValue({
      id: "acct_supporter",
      authSub: "auth0|supporter",
    });
    mocks.withdrawCorrection.mockResolvedValue(true);
  });

  it("requires authentication before withdrawal", async () => {
    mocks.getSession.mockResolvedValue(null);
    const response = await withdraw(
      request("DELETE", { id: "correction-1", kind: "attendance" }),
    );
    expect(response.status).toBe(401);
    expect(mocks.withdrawCorrection).not.toHaveBeenCalled();
  });

  it("withdraws only through the signed-in contributor identity", async () => {
    const response = await withdraw(
      request("DELETE", { id: "correction-1", kind: "appearance" }),
    );
    expect(response.status).toBe(200);
    expect(mocks.withdrawCorrection).toHaveBeenCalledWith(
      "db",
      "acct_supporter",
      "appearance",
      "correction-1",
    );
  });

  it("updates the opt-in recognition preference", async () => {
    const run = vi.fn(async () => ({ meta: { changes: 1 } }));
    const bind = vi.fn(() => ({ run }));
    const prepare = vi.fn(() => ({ bind }));
    mocks.getCloudflareContext.mockReturnValue({ env: { DB: { prepare } } });
    const response = await updateRecognition(request("PUT", { visible: true }));
    expect(response.status).toBe(200);
    expect(bind).toHaveBeenCalledWith(1, "roversfan", "acct_supporter");
  });
});
