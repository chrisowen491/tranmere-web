import { getAdminSession } from "@/lib/adminAuth";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/** Shared primitives for D1-backed admin route handlers. */
export function adminError(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

/** Returns a 403 response when the current request is not an admin request. */
export async function requireAdminApi(permission: string) {
  if (await getAdminSession()) return null;
  return adminError(`You do not have permission to manage ${permission}.`, 403);
}

export function requiredText(value: unknown, limit = 200) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

export function optionalText(value: unknown, limit = 200) {
  return requiredText(value, limit) || null;
}

export function isIsoDate(value: string) {
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

export function booleanFlag(value: unknown) {
  return value === true || value === 1 || value === "1" ? 1 : 0;
}

export function revalidateAdminPaths(paths: readonly string[]) {
  paths.forEach((path) => revalidatePath(path));
}
