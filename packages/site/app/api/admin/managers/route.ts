import { auth0 } from "@/lib/auth0";
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
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

interface ManagerRequest {
  id?: string;
  name?: string;
  dateJoined?: string;
  dateLeft?: string;
  imagePath?: string;
  favouriteFormation?: string;
}

function error(message: string, status: number) {
  return NextResponse.json({ message }, { status });
}

async function requireAdmin() {
  const session = await auth0.getSession();
  const env = getCloudflareContext().env;
  const adminEmail = env.AUTH0_ADMIN_EMAIL || process.env.AUTH0_ADMIN_EMAIL;
  return session && adminEmail && session.user.email === adminEmail
    ? session
    : null;
}

function isDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(`${value}T00:00:00Z`))
  );
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
    !isDate(dateJoined) ||
    (!isDate(dateLeft) && !/^(now|now\(\))$/i.test(dateLeft))
  ) {
    return null;
  }

  if (isDate(dateLeft) && dateLeft < dateJoined) return null;

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
  if (!(await requireAdmin())) {
    return error("You do not have permission to manage managers.", 403);
  }

  const manager = validateManager((await request.json()) as ManagerRequest);
  if (!manager) {
    return error(
      "Enter valid manager details, dates and favourite formation.",
      400,
    );
  }

  const created = await createManager(
    getCloudflareContext().env.DB,
    crypto.randomUUID(),
    manager,
  );
  revalidatePath("/managers");
  return NextResponse.json({ manager: created }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdmin())) {
    return error("You do not have permission to manage managers.", 403);
  }

  const body = (await request.json()) as ManagerRequest;
  const manager = validateManager(body);
  if (!body.id || !manager) {
    return error(
      "Enter valid manager details, dates and favourite formation.",
      400,
    );
  }

  const db = getCloudflareContext().env.DB;
  if (!(await getManagerById(db, body.id))) {
    return error("That manager could not be found.", 404);
  }

  const updated = await updateManager(db, body.id, manager);
  revalidatePath("/managers");
  return NextResponse.json({ manager: updated });
}
