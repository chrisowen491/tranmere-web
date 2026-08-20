import { getCloudflareContext } from "@opennextjs/cloudflare";

interface ManagementToken {
  value: string;
  expiresAt: number;
}

export interface Auth0Identity {
  connection: string;
  provider: string;
  user_id: string;
  isSocial: boolean;
}

let cachedToken: ManagementToken | null = null;

function configuration() {
  const env = getCloudflareContext().env;
  const domain =
    env.AUTH0_MANAGEMENT_DOMAIN || process.env.AUTH0_MANAGEMENT_DOMAIN;
  const clientId =
    env.AUTH0_MANAGEMENT_CLIENT_ID || process.env.AUTH0_MANAGEMENT_CLIENT_ID;
  const clientSecret =
    env.AUTH0_MANAGEMENT_CLIENT_SECRET ||
    process.env.AUTH0_MANAGEMENT_CLIENT_SECRET;
  if (!domain || !clientId || !clientSecret) {
    throw new Error(
      "Auth0 account linking requires the canonical management domain and M2M credentials.",
    );
  }
  return {
    domain: domain.replace(/^https?:\/\//, "").replace(/\/$/, ""),
    clientId,
    clientSecret,
  };
}

async function managementToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000)
    return cachedToken.value;
  const { domain, clientId, clientSecret } = configuration();
  const response = await fetch(`https://${domain}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${domain}/api/v2/`,
    }),
  });
  if (!response.ok) {
    const failure = (await response.json().catch(() => null)) as {
      error?: string;
      error_description?: string;
    } | null;
    console.error("Auth0 management token request failed", {
      status: response.status,
      error: failure?.error,
      description: failure?.error_description,
    });
    throw new Error(
      failure?.error_description ||
        failure?.error ||
        "Unable to authorize Auth0 account linking.",
    );
  }
  const body = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!body.access_token)
    throw new Error("Auth0 did not return a management token.");
  cachedToken = {
    value: body.access_token,
    expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000,
  };
  return cachedToken.value;
}

async function managementRequest(path: string, init?: RequestInit) {
  const { domain } = configuration();
  const response = await fetch(`https://${domain}/api/v2${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${await managementToken()}`,
      "content-type": "application/json",
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error(
      "Auth0 Management API request failed",
      response.status,
      detail,
    );
    throw new Error("Auth0 could not update the linked sign-in methods.");
  }
  return response;
}

function identityParts(providerSub: string) {
  const separator = providerSub.indexOf("|");
  if (separator < 1 || separator === providerSub.length - 1)
    throw new Error("Auth0 returned an invalid user identity.");
  return {
    provider: providerSub.slice(0, separator),
    userId: providerSub.slice(separator + 1),
  };
}

export async function linkAuth0Identity(
  primaryUserId: string,
  secondaryUserId: string,
) {
  const secondary = identityParts(secondaryUserId);
  const response = await managementRequest(
    `/users/${encodeURIComponent(primaryUserId)}/identities`,
    {
      method: "POST",
      body: JSON.stringify({
        provider: secondary.provider,
        user_id: secondary.userId,
      }),
    },
  );
  return (await response.json()) as Auth0Identity[];
}

export async function unlinkAuth0Identity(
  primaryUserId: string,
  secondaryUserId: string,
) {
  const secondary = identityParts(secondaryUserId);
  await managementRequest(
    `/users/${encodeURIComponent(primaryUserId)}/identities/${encodeURIComponent(secondary.provider)}/${encodeURIComponent(secondary.userId)}`,
    { method: "DELETE" },
  );
}
