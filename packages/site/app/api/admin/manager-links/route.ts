import {
  adminError,
  optionalText,
  requiredText,
  requireAdminApi,
  revalidateAdminPaths,
} from "@/lib/adminCrud";
import {
  createManagerLink,
  deleteManagerLink,
  getManagerById,
  getManagerLinks,
  type ManagerLinkInput,
} from "@/lib/managers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

function validUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function input(body: Record<string, unknown>): ManagerLinkInput | null {
  const managerId = requiredText(body.managerId, 100);
  const label = requiredText(body.label, 200);
  const url = requiredText(body.url, 2000);
  const sortOrder = Number(body.sortOrder ?? 0);
  return managerId && label && validUrl(url) && Number.isInteger(sortOrder)
    ? {
        managerId,
        label,
        description: optionalText(body.description, 500),
        url,
        publisher: optionalText(body.publisher, 100),
        sortOrder,
      }
    : null;
}

export async function POST(request: NextRequest) {
  const forbidden = await requireAdminApi("manager links");
  if (forbidden) return forbidden;
  const managerLink = input((await request.json()) as Record<string, unknown>);
  if (!managerLink) return adminError("Enter a valid manager link.", 400);
  const db = getCloudflareContext().env.DB;
  if (!(await getManagerById(db, managerLink.managerId)))
    return adminError("That manager could not be found.", 404);
  const link = await createManagerLink(db, crypto.randomUUID(), managerLink);
  revalidateAdminPaths([`/managers/${managerLink.managerId}`]);
  return NextResponse.json({ link }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const forbidden = await requireAdminApi("manager links");
  if (forbidden) return forbidden;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return adminError("Choose a manager link to remove.", 400);
  const db = getCloudflareContext().env.DB;
  const record = (await getManagerLinks(db)).find((link) => link.id === id);
  if (!record) return adminError("That manager link could not be found.", 404);
  await deleteManagerLink(db, id);
  revalidateAdminPaths([`/managers/${record.managerId}`]);
  return NextResponse.json({ ok: true });
}
