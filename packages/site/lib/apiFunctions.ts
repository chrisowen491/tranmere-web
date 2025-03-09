export function GetBaseUrl(env: CloudflareEnv) {
  if (!env.API_DOMAIN) {
    env = process.env as unknown as CloudflareEnv;
  }

  return env.API_PORT
    ? `${env.API_PROTOCOL}://${env.API_DOMAIN}:${env.API_PORT}`
    : `${env.API_PROTOCOL}://${env.API_DOMAIN}:${env.API_PORT}`;
}
