import {
  adminError,
  isIsoDate,
  revalidateAdminPaths,
  requireAdminApi,
} from "@/lib/adminCrud";
import {
  createTransfer,
  getTransferById,
  updateTransfer,
  type TransferInput,
} from "@/lib/transfers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

interface TransferRequest {
  id?: string;
  playerName?: string;
  season?: number;
  fromClub?: string;
  toClub?: string;
  feeDescription?: string;
  cost?: number;
  date?: string;
}

function validateTransfer(body: TransferRequest): TransferInput | null {
  const playerName = body.playerName?.trim().slice(0, 200);
  const fromClub = body.fromClub?.trim().slice(0, 200);
  const toClub = body.toClub?.trim().slice(0, 200);
  const season = Number(body.season);
  const cost = Number(body.cost);
  const date = body.date?.trim() || null;

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

  if (date && !isIsoDate(date)) return null;

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
    date,
  };
}

function revalidateTransfer(
  transfer: TransferInput,
  previous?: Awaited<ReturnType<typeof getTransferById>>,
) {
  const paths = [
    "/transfer-central",
    `/season/${transfer.season}`,
    `/page/player/${transfer.playerName}`,
  ];
  if (previous) {
    paths.push(`/season/${previous.season}`, `/page/player/${previous.name}`);
  }
  revalidateAdminPaths(paths);
}

export async function POST(request: NextRequest) {
  const forbidden = await requireAdminApi("transfers");
  if (forbidden) return forbidden;

  const transfer = validateTransfer((await request.json()) as TransferRequest);
  if (!transfer) {
    return adminError(
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
  const forbidden = await requireAdminApi("transfers");
  if (forbidden) return forbidden;

  const body = (await request.json()) as TransferRequest;
  const transfer = validateTransfer(body);
  if (!body.id || !transfer) {
    return adminError(
      "Enter valid transfer details with Tranmere Rovers on exactly one side.",
      400,
    );
  }

  const db = getCloudflareContext().env.DB;
  const previous = await getTransferById(db, body.id);
  if (!previous) return adminError("That transfer could not be found.", 404);

  const updated = await updateTransfer(db, body.id, transfer);
  revalidateTransfer(transfer, previous);
  return NextResponse.json({ transfer: updated });
}
