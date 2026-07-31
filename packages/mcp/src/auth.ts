import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTPayload,
  type JWTVerifyGetKey
} from 'jose';

export const MCP_SCOPES = [
  'read:players',
  'read:clubs',
  'read:transfers',
  'read:managers',
  'read:matches'
] as const;

export interface McpAuthContext {
  claims: JWTPayload;
  permissions: ReadonlySet<string>;
}

const keySets = new Map<string, JWTVerifyGetKey>();

function issuerFor(env: Env) {
  return `https://${env.AUTH0_DOMAIN.replace(/^https?:\/\//, '').replace(/\/$/, '')}/`;
}

function keySetFor(issuer: string) {
  const existing = keySets.get(issuer);
  if (existing) return existing;

  const keySet = createRemoteJWKSet(new URL(`${issuer}.well-known/jwks.json`));
  keySets.set(issuer, keySet);
  return keySet;
}

function permissionsFor(payload: JWTPayload) {
  const permissions = Array.isArray(payload.permissions)
    ? payload.permissions.filter(
        (permission): permission is string => typeof permission === 'string'
      )
    : [];
  const scopes =
    typeof payload.scope === 'string'
      ? payload.scope.split(/\s+/).filter(Boolean)
      : [];

  return new Set([...permissions, ...scopes]);
}

function resourceMetadataUrl(request: Request) {
  return new URL(
    '/.well-known/oauth-protected-resource/mcp',
    request.url
  ).toString();
}

export function protectedResourceMetadata(env: Env) {
  return {
    resource: env.AUTH0_AUDIENCE,
    authorization_servers: [issuerFor(env)],
    scopes_supported: MCP_SCOPES,
    bearer_methods_supported: ['header'],
    resource_name: 'Tranmere-Web MCP'
  };
}

export function unauthorizedResponse(
  request: Request,
  error = 'invalid_token'
) {
  const scope = MCP_SCOPES.join(' ');
  return Response.json(
    { error, error_description: 'A valid Auth0 access token is required.' },
    {
      status: 401,
      headers: {
        'Cache-Control': 'no-store',
        'WWW-Authenticate': `Bearer resource_metadata="${resourceMetadataUrl(request)}", scope="${scope}", error="${error}"`
      }
    }
  );
}

export async function authenticateRequest(
  request: Request,
  env: Env
): Promise<McpAuthContext | Response> {
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return unauthorizedResponse(request);
  }

  const token = authorization.slice('Bearer '.length).trim();
  if (!token) return unauthorizedResponse(request);

  const issuer = issuerFor(env);

  try {
    const { payload } = await jwtVerify(token, keySetFor(issuer), {
      issuer,
      audience: env.AUTH0_AUDIENCE,
      algorithms: ['RS256']
    });

    return {
      claims: payload,
      permissions: permissionsFor(payload)
    };
  } catch {
    return unauthorizedResponse(request);
  }
}

export function permissionDenied(
  auth: McpAuthContext,
  permission: (typeof MCP_SCOPES)[number]
) {
  if (auth.permissions.has(permission)) return null;

  // ChatGPT's CIMD OAuth flow currently requests the MCP resource but does not
  // request its advertised custom scopes. Auth0 therefore issues a valid,
  // audience-bound access token without a scope claim. API access is still
  // restricted by Auth0's user-delegated client grant, and authenticateRequest
  // has already verified the issuer, signature, and exact MCP audience.
  if (auth.permissions.size === 0) return null;

  return {
    content: [
      {
        type: 'text' as const,
        text: `The access token does not grant ${permission}.`
      }
    ],
    isError: true
  };
}
