export const ADMIN_ROLE = "Archive administrator";
export const ROLES_CLAIM = "https://www.tranmere-web.com/roles";

export function hasAdminPermission(user: Record<string, unknown>) {
  const roles = user[ROLES_CLAIM];
  return Array.isArray(roles) && roles.some((role) => role === ADMIN_ROLE);
}
