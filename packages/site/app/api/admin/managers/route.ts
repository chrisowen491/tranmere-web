import {
  adminError,
  isIsoDate,
  revalidateAdminPaths,
  requireAdminApi,
} from "@/lib/adminCrud";
import {
  MANAGER_FORMATIONS,
  type ManagerFormation,
} from "@tranmere-web/lib/src/manager-constants";
import {
  createManager,
  getManagerById,
  updateManager,
  type ManagerInput,
} from "@/lib/managers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

interface ManagerRequest {
  id?: string;
  name?: string;
  dateJoined?: string;
  dateLeft?: string;
  imagePath?: string;
  favouriteFormation?: string;
}

function validateManager(body: ManagerRequest): ManagerInput | null {
  const name = body.name?.trim().slice(0, 200);
  const dateJoined = body.dateJoined?.trim();
  const requestedDateLeft = body.dateLeft?.trim();
  const dateLeft =
    requestedDateLeft?.toLowerCase() === "present"
      ? "now()"
      : requestedDateLeft;

  if (
    !name ||
    !dateJoined ||
    !dateLeft ||
    !isIsoDate(dateJoined) ||
    (!isIsoDate(dateLeft) && !/^(now|now\(\))$/i.test(dateLeft))
  ) {
    return null;
  }

  if (isIsoDate(dateLeft) && dateLeft < dateJoined) return null;

  const requestedFormation = body.favouriteFormation?.trim() || "";
  if (
    requestedFormation &&
    !MANAGER_FORMATIONS.includes(requestedFormation as ManagerFormation)
  ) {
    return null;
  }

  return {
    name,
    dateJoined,
    dateLeft: /^(now|now\(\))$/i.test(dateLeft) ? "now()" : dateLeft,
    imagePath: body.imagePath?.trim().slice(0, 500) || "",
    favouriteFormation: requestedFormation as ManagerFormation | "",
  };
}

export async function POST(request: NextRequest) {
  const forbidden = await requireAdminApi("managers");
  if (forbidden) return forbidden;

  const manager = validateManager((await request.json()) as ManagerRequest);
  if (!manager) {
    return adminError(
      "Enter valid manager details, dates and favourite formation.",
      400,
    );
  }

  const created = await createManager(
    getCloudflareContext().env.DB,
    crypto.randomUUID(),
    manager,
  );
  revalidateAdminPaths(["/managers"]);
  return NextResponse.json({ manager: created }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const forbidden = await requireAdminApi("managers");
  if (forbidden) return forbidden;

  const body = (await request.json()) as ManagerRequest;
  const manager = validateManager(body);
  if (!body.id || !manager) {
    return adminError(
      "Enter valid manager details, dates and favourite formation.",
      400,
    );
  }

  const db = getCloudflareContext().env.DB;
  if (!(await getManagerById(db, body.id))) {
    return adminError("That manager could not be found.", 404);
  }

  const updated = await updateManager(db, body.id, manager);
  revalidateAdminPaths(["/managers"]);
  return NextResponse.json({ manager: updated });
}
