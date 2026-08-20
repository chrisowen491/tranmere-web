import { describe, expect, it } from "vitest";
import {
  ADMIN_ROLE,
  hasAdminPermission,
  ROLES_CLAIM,
} from "@/lib/authPermissions";

describe("administrator permissions", () => {
  it("accepts the archive administrator role", () => {
    expect(hasAdminPermission({ [ROLES_CLAIM]: [ADMIN_ROLE] })).toBe(true);
  });

  it("does not treat an email address or unrelated permission as admin", () => {
    expect(
      hasAdminPermission({
        email: "admin@example.com",
        [ROLES_CLAIM]: ["Supporter"],
      }),
    ).toBe(false);
  });

  it("rejects malformed permission claims", () => {
    expect(hasAdminPermission({ [ROLES_CLAIM]: ADMIN_ROLE })).toBe(false);
  });
});
