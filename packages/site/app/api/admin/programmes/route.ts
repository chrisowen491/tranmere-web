import {
  adminError,
  isIsoDate,
  revalidateAdminPaths,
  requireAdminApi,
} from "@/lib/adminCrud";
import {
  createProgramme,
  deleteProgramme,
  getProgrammeByUrl,
  updateProgramme,
  type ProgrammeInput,
} from "@/lib/programmes";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

interface ProgrammeRequest {
  originalUrl?: string;
  url?: string;
  name?: string;
  date?: string;
  pages?: number;
}

function validateProgramme(body: ProgrammeRequest): ProgrammeInput | null {
  const url = body.url?.trim().slice(0, 500);
  const name = body.name?.trim().slice(0, 200);
  const date = body.date?.trim();
  const pages = Number(body.pages);
  if (
    !url ||
    !name ||
    !date ||
    !/^(\/|https?:\/\/)/.test(url) ||
    !isIsoDate(date) ||
    !Number.isSafeInteger(pages) ||
    pages < 1
  ) {
    return null;
  }

  return { url, name, date, pages };
}

function revalidateProgrammes() {
  revalidateAdminPaths(["/programmes"]);
}

export async function POST(request: NextRequest) {
  const forbidden = await requireAdminApi("programmes");
  if (forbidden) return forbidden;

  const programme = validateProgramme(
    (await request.json()) as ProgrammeRequest,
  );
  if (!programme) {
    return adminError(
      "Enter a valid PDF URL, match name, date and page count.",
      400,
    );
  }

  const db = getCloudflareContext().env.DB;
  if (await getProgrammeByUrl(db, programme.url)) {
    return adminError("A programme with that PDF URL already exists.", 409);
  }

  const created = await createProgramme(db, programme);
  revalidateProgrammes();
  return NextResponse.json({ programme: created }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const forbidden = await requireAdminApi("programmes");
  if (forbidden) return forbidden;

  const body = (await request.json()) as ProgrammeRequest;
  const programme = validateProgramme(body);
  const originalUrl = body.originalUrl?.trim();
  if (!originalUrl || !programme) {
    return adminError(
      "Enter a valid PDF URL, match name, date and page count.",
      400,
    );
  }

  const db = getCloudflareContext().env.DB;
  if (!(await getProgrammeByUrl(db, originalUrl))) {
    return adminError("That programme could not be found.", 404);
  }
  if (
    originalUrl !== programme.url &&
    (await getProgrammeByUrl(db, programme.url))
  ) {
    return adminError("A programme with that PDF URL already exists.", 409);
  }

  const updated = await updateProgramme(db, originalUrl, programme);
  revalidateProgrammes();
  return NextResponse.json({ programme: updated });
}

export async function DELETE(request: NextRequest) {
  const forbidden = await requireAdminApi("programmes");
  if (forbidden) return forbidden;

  const { url } = (await request.json()) as ProgrammeRequest;
  if (!url?.trim()) return adminError("Choose a programme to delete.", 400);

  const deleted = await deleteProgramme(
    getCloudflareContext().env.DB,
    url.trim(),
  );
  if (!deleted) return adminError("That programme could not be found.", 404);

  revalidateProgrammes();
  return NextResponse.json({ deleted: true });
}
