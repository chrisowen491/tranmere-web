import { describe, expect, it } from "vitest";
import { normalizeSupporterAvatar } from "@/lib/userProfiles";

describe("normalizeSupporterAvatar", () => {
  const avatar = "/builder/2026/simple/cccccc/none/000000/cccccc/none/cccccc";

  it("stores builder avatars as portable local paths", () => {
    expect(
      normalizeSupporterAvatar(`https://www.tranmere-web.com${avatar}`),
    ).toBe(avatar);
    expect(normalizeSupporterAvatar(`http://localhost:3001${avatar}`)).toBe(
      avatar,
    );
  });

  it("allows an avatar to be removed", () => {
    expect(normalizeSupporterAvatar("")).toBeNull();
    expect(normalizeSupporterAvatar(null)).toBeNull();
  });

  it("rejects external and incomplete URLs", () => {
    expect(() =>
      normalizeSupporterAvatar(`https://example.com${avatar}`),
    ).toThrow();
    expect(() => normalizeSupporterAvatar("/builder/2026/simple")).toThrow();
  });
});
