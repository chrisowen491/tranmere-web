export const runtime = "edge";

import { NextResponse } from "next/server";
import { GetSeasons } from "@/lib/apiFunctions";

//export interface Season

export async function POST() {
  const seasons = GetSeasons();
  return NextResponse.json(
    seasons.map((s) => {
      return {
        value: `${s}-${(s + 1).toString().slice(2)}`,
        label: `${s}-${(s + 1).toString().slice(2)}`,
      };
    }),
    { status: 200 },
  );
}
