import { hasAdminPermission } from "@/lib/authPermissions";
import { NextRequest, NextResponse } from "next/server";

export async function autoApproveAdminSubmissions(
  user: Record<string, unknown>,
  request: NextRequest,
  ids: string[],
  review: (request: NextRequest) => Promise<Response>,
  message: string,
) {
  if (!hasAdminPermission(user)) return null;

  for (const id of ids) {
    const response = await review(
      new NextRequest(request.url, {
        method: "PATCH",
        headers: request.headers,
        body: JSON.stringify({
          id,
          status: "approved",
          reviewNote: "Automatically approved: submitted by an administrator.",
        }),
      }),
    );
    if (!response.ok) return response;
  }

  return NextResponse.json({ message }, { status: 201 });
}
