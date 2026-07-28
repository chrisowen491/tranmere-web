import { auth0 } from "@/lib/auth0";
import {
  createTransfer,
  getTransferById,
  updateTransfer,
  type TransferInput,
} from "@/lib/transfers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

interface TransferRequest {
  id?: string;
  playerName?: string;
  season?: number;
  fromClub?: string;
  toClub?: string;
  feeDescription?: string;
  cost?: number;
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

function validateTransfer(body: TransferRequest): TransferInput | null {
  const playerName = body.playerName?.trim().slice(0, 200);
  const fromClub = body.fromClub?.trim().slice(0, 200);
  const toClub = body.toClub?.trim().slice(0, 200);
  const season = Number(body.season);
  const cost = Number(body.cost);

  if (
    !playerName ||
    !fromClub ||
    !toClub ||
    !Number.isInteger(season) ||
    season < 1800 ||
    season > 2200 ||
    !Number.isSafeInteger(cost) ||
    cost < 0
  ) {
    return null;
  }

  const fromTranmere = fromClub === "Tranmere Rovers";
  const toTranmere = toClub === "Tranmere Rovers";
  if (fromTranmere === toTranmere) return null;

  return {
    playerName,
    season,
    fromClub,
    toClub,
    feeDescription: body.feeDescription?.trim().slice(0, 200) || "",
    cost,
  };
}

function revalidateTransfer(
  transfer: TransferInput,
  previous?: Awaited<ReturnType<typeof getTransferById>>,
) {
  revalidatePath("/transfer-central");
  revalidatePath(`/season/${transfer.season}`);
  revalidatePath(`/page/player/${transfer.playerName}`);
  if (previous) {
    revalidatePath(`/season/${previous.season}`);
    revalidatePath(`/page/player/${previous.name}`);
  }
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return error("You do not have permission to manage transfers.", 403);
  }

  const transfer = validateTransfer((await request.json()) as TransferRequest);
  if (!transfer) {
    return error(
      "Enter valid transfer details with Tranmere Rovers on exactly one side.",
      400,
    );
  }

  const db = getCloudflareContext().env.DB;
  const created = await createTransfer(db, crypto.randomUUID(), transfer);
  revalidateTransfer(transfer);
  return NextResponse.json({ transfer: created }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdmin())) {
    return error("You do not have permission to manage transfers.", 403);
  }

  const body = (await request.json()) as TransferRequest;
  const transfer = validateTransfer(body);
  if (!body.id || !transfer) {
    return error(
      "Enter valid transfer details with Tranmere Rovers on exactly one side.",
      400,
    );
  }

  const db = getCloudflareContext().env.DB;
  const previous = await getTransferById(db, body.id);
  if (!previous) return error("That transfer could not be found.", 404);

  const updated = await updateTransfer(db, body.id, transfer);
  revalidateTransfer(transfer, previous);
  return NextResponse.json({ transfer: updated });
}
