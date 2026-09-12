import { describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { autoApproveAdminSubmissions } from "@/lib/adminAutoApproval";
import { ADMIN_ROLE, ROLES_CLAIM } from "@/lib/authPermissions";

describe("autoApproveAdminSubmissions", () => {
  it("approves every submission made by an archive administrator", async () => {
    const reviewedRequests: NextRequest[] = [];
    const review = vi.fn(async (reviewRequest: NextRequest) => {
      reviewedRequests.push(reviewRequest);
      return NextResponse.json({ ok: true });
    });
    const response = await autoApproveAdminSubmissions(
      { [ROLES_CLAIM]: [ADMIN_ROLE] },
      new NextRequest("http://localhost/api/example"),
      ["first", "second"],
      review,
      "Published.",
    );

    expect(response?.status).toBe(201);
    expect(review).toHaveBeenCalledTimes(2);
    await expect(reviewedRequests[0]!.json()).resolves.toMatchObject({
      id: "first",
      status: "approved",
    });
  });

  it("leaves supporter submissions in the moderation queue", async () => {
    const review = vi.fn(async () => NextResponse.json({ ok: true }));
    const response = await autoApproveAdminSubmissions(
      { [ROLES_CLAIM]: ["Supporter"] },
      new NextRequest("http://localhost/api/example"),
      ["first"],
      review,
      "Published.",
    );

    expect(response).toBeNull();
    expect(review).not.toHaveBeenCalled();
  });
});
