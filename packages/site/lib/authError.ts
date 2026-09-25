const AUTH_ERROR_CODES = new Set([
  "access_denied",
  "authorization_error",
  "authorization_code_grant_error",
  "authorization_code_grant_request_error",
  "discovery_error",
  "invalid_configuration",
  "invalid_state",
  "missing_state",
  "session_expired",
]);

export interface AuthErrorContent {
  eyebrow: string;
  heading: string;
  description: string;
}

export function safeAuthReturnTo(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";

  try {
    const url = new URL(value, "https://www.tranmere-web.com");
    return url.origin === "https://www.tranmere-web.com"
      ? `${url.pathname}${url.search}${url.hash}`
      : "/";
  } catch {
    return "/";
  }
}

export function normaliseAuthErrorCode(error: unknown) {
  if (!error || typeof error !== "object") return "authentication_error";

  const sdkError = error as {
    code?: unknown;
    cause?: { code?: unknown };
  };
  const causeCode =
    typeof sdkError.cause?.code === "string" ? sdkError.cause.code : null;
  const errorCode = typeof sdkError.code === "string" ? sdkError.code : null;
  const code = causeCode === "access_denied" ? causeCode : errorCode;

  return code && AUTH_ERROR_CODES.has(code) ? code : "authentication_error";
}

export function getAuthErrorContent(code: string): AuthErrorContent {
  if (code === "access_denied" || code === "authorization_error") {
    return {
      eyebrow: "Sign-in cancelled",
      heading: "Sign-in wasn’t completed",
      description:
        "No changes were made to your account. You can try again whenever you’re ready.",
    };
  }

  if (code === "invalid_state" || code === "missing_state") {
    return {
      eyebrow: "Session expired",
      heading: "That sign-in link has expired",
      description:
        "For your security, sign-in links only work for a short time. Start again to create a fresh one.",
    };
  }

  if (code === "session_expired") {
    return {
      eyebrow: "Session expired",
      heading: "Please sign in again",
      description:
        "Your previous session has ended. Signing in again will return you to the archive.",
    };
  }

  if (code === "invalid_configuration" || code === "discovery_error") {
    return {
      eyebrow: "Service unavailable",
      heading: "Sign-in is temporarily unavailable",
      description:
        "The archive is still available, but we can’t connect to the sign-in service at the moment.",
    };
  }

  return {
    eyebrow: "Authentication error",
    heading: "We couldn’t sign you in",
    description:
      "Something interrupted the sign-in process. Try again, or return to the archive and continue browsing.",
  };
}
