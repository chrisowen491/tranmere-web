import { auth0 } from "@/lib/auth0";
import {
  createProgramme,
  deleteProgramme,
  getProgrammeByUrl,
  updateProgramme,
  type ProgrammeInput,
} from "@/lib/programmes";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

interface ProgrammeRequest {
  originalUrl?: string;
  url?: string;
  name?: string;
  date?: string;
  pages?: number;
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

function validateProgramme(body: ProgrammeRequest): ProgrammeInput | null {
  const url = body.url?.trim().slice(0, 500);
  const name = body.name?.trim().slice(0, 200);
  const date = body.date?.trim();
  const pages = Number(body.pages);
  const parsedDate = date ? new Date(`${date}T00:00:00Z`) : null;

  if (
    !url ||
    !name ||
    !date ||
    !/^(\/|https?:\/\/)/.test(url) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !parsedDate ||
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date ||
    !Number.isSafeInteger(pages) ||
    pages < 1
  ) {
    return null;
  }

  return { url, name, date, pages };
}

function revalidateProgrammes() {
  revalidatePath("/programmes");
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return error("You do not have permission to manage programmes.", 403);
  }

  const programme = validateProgramme((await request.json()) as ProgrammeRequest);
  if (!programme) {
    return error("Enter a valid PDF URL, match name, date and page count.", 400);
  }

  const db = getCloudflareContext().env.DB;
  if (await getProgrammeByUrl(db, programme.url)) {
    return error("A programme with that PDF URL already exists.", 409);
  }

  const created = await createProgramme(db, programme);
  revalidateProgrammes();
  return NextResponse.json({ programme: created }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdmin())) {
    return error("You do not have permission to manage programmes.", 403);
  }

  const body = (await request.json()) as ProgrammeRequest;
  const programme = validateProgramme(body);
  const originalUrl = body.originalUrl?.trim();
  if (!originalUrl || !programme) {
    return error("Enter a valid PDF URL, match name, date and page count.", 400);
  }

  const db = getCloudflareContext().env.DB;
  if (!(await getProgrammeByUrl(db, originalUrl))) {
    return error("That programme could not be found.", 404);
  }
  if (originalUrl !== programme.url && (await getProgrammeByUrl(db, programme.url))) {
    return error("A programme with that PDF URL already exists.", 409);
  }

  const updated = await updateProgramme(db, originalUrl, programme);
  revalidateProgrammes();
  return NextResponse.json({ programme: updated });
}

export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin())) {
    return error("You do not have permission to manage programmes.", 403);
  }

  const { url } = (await request.json()) as ProgrammeRequest;
  if (!url?.trim()) return error("Choose a programme to delete.", 400);

  const deleted = await deleteProgramme(getCloudflareContext().env.DB, url.trim());
  if (!deleted) return error("That programme could not be found.", 404);

  revalidateProgrammes();
  return NextResponse.json({ deleted: true });
}
