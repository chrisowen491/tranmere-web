import { describe, expect, it } from "vitest";
import { replaceSeasonsKit } from "@tranmere-web/lib/src/apiFunctions";

describe("replaceSeasonsKit", () => {
  const avatar = "/builder/1989/simple/ffd3b3/none/000000/fcb98b/none/8e740c";

  it("keeps explicitly selected letter-suffixed kit variants", () => {
    expect(replaceSeasonsKit(avatar, "1990A")).toContain("/1990A/");
  });

  it("retains the historical fallback for numeric season kits", () => {
    expect(replaceSeasonsKit(avatar, "1990")).toContain("/1989/");
  });
});
