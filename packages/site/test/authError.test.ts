import { describe, expect, it } from "vitest";
import {
  getAuthErrorContent,
  normaliseAuthErrorCode,
  safeAuthReturnTo,
} from "@/lib/authError";

describe("Auth0 error handling", () => {
  it("preserves local return paths and rejects external redirects", () => {
    expect(safeAuthReturnTo("/profile?tab=programmes")).toBe(
      "/profile?tab=programmes",
    );
    expect(safeAuthReturnTo("//malicious.example/profile")).toBe("/");
    expect(safeAuthReturnTo("https://malicious.example/profile")).toBe("/");
  });

  it("uses the underlying access-denied code without exposing messages", () => {
    expect(
      normaliseAuthErrorCode({
        code: "authorization_error",
        cause: { code: "access_denied", message: "untrusted text" },
      }),
    ).toBe("access_denied");
  });

  it("falls back for unknown error codes", () => {
    expect(normaliseAuthErrorCode({ code: "unexpected_provider_error" })).toBe(
      "authentication_error",
    );
    expect(getAuthErrorContent("authentication_error").heading).toBe(
      "We couldn’t sign you in",
    );
  });
});
