import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  resolveAccount: vi.fn(),
  listAccountIdentities: vi.fn(),
  removeLinkedIdentity: vi.fn(),
  unlinkAuth0Identity: vi.fn(),
  getCloudflareContext: vi.fn(),
}));

vi.mock("@/lib/auth0", () => ({ auth0: { getSession: mocks.getSession } }));
vi.mock("@/lib/accounts", () => ({ resolveAccount: mocks.resolveAccount }));
vi.mock("@/lib/accountLinking", () => ({
  listAccountIdentities: mocks.listAccountIdentities,
  removeLinkedIdentity: mocks.removeLinkedIdentity,
}));
vi.mock("@/lib/auth0Management", () => ({
  unlinkAuth0Identity: mocks.unlinkAuth0Identity,
}));
vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: mocks.getCloudflareContext,
}));

import { DELETE } from "@/app/api/account-identities/route";

const identities = [
  {
    providerSub: "auth0|primary",
    provider: "auth0",
    isPrimary: true,
    lastAuthenticatedAt: "2026-08-20T00:00:00Z",
  },
  {
    providerSub: "google-oauth2|secondary",
    provider: "google-oauth2",
    isPrimary: false,
    lastAuthenticatedAt: "2026-08-20T00:00:00Z",
  },
];

function request(providerSub: string) {
  return new Request("http://localhost/api/account-identities", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ providerSub }),
  });
}

describe("account identity removal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({ user: { sub: "auth0|primary" } });
    mocks.getCloudflareContext.mockReturnValue({ env: { DB: "db" } });
    mocks.resolveAccount.mockResolvedValue({
      id: "acct_primary",
      authSub: "auth0|primary",
    });
    mocks.listAccountIdentities.mockResolvedValue(identities);
  });

  it("does not allow the primary identity to be removed", async () => {
    const response = await DELETE(request("auth0|primary"));
    expect(response.status).toBe(409);
    expect(mocks.unlinkAuth0Identity).not.toHaveBeenCalled();
  });

  it("unlinks Auth0 before removing the local secondary identity", async () => {
    const response = await DELETE(request("google-oauth2|secondary"));
    expect(response.status).toBe(200);
    expect(mocks.unlinkAuth0Identity).toHaveBeenCalledWith(
      "auth0|primary",
      "google-oauth2|secondary",
    );
    expect(mocks.removeLinkedIdentity).toHaveBeenCalledWith(
      "db",
      "acct_primary",
      "google-oauth2|secondary",
    );
    expect(
      mocks.unlinkAuth0Identity.mock.invocationCallOrder[0],
    ).toBeLessThan(mocks.removeLinkedIdentity.mock.invocationCallOrder[0]);
  });
});
