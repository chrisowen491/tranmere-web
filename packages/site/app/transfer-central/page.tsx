import { TransferSearch } from "@/components/apps/TransferSearch";
import { GetAllTeams } from "@tranmere-web/lib/src/apiFunctions";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Transfer } from "@tranmere-web/lib/src/tranmere-web-types";
import { Metadata } from "next";
import { GetBaseUrl } from "@/lib/apiFunctions";

export const metadata: Metadata = {
  title: "Transfers Home",
  description: "Tranmere Rovers transfer information index",
};

export default async function Transfers() {
  const base =
    GetBaseUrl((await getCloudflareContext({ async: true })).env) +
    "/transfer-search/";

  const request = await fetch(base);
  const results = (await request.json()) as {
    transfers: Transfer[];
  };

  const teams = await GetAllTeams();

  return (
    <main className="pb-24 text-[#071a2b]">
      <header className="border-b border-[#071a2b]/10">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Transfer archive
          </p>
          <div className="mt-3 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <h1 className="max-w-3xl font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
              Arrivals, departures and record deals.
            </h1>
            <p className="text-lg leading-8 text-[#071a2b]/65">
              Trace movement in and out of Prenton Park by season, player or
              club—from free transfers to record fees.
            </p>
          </div>
        </div>
      </header>
      <TransferSearch default={results.transfers} teams={teams} />
    </main>
  );
}
