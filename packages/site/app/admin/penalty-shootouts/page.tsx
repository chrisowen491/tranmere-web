import { PenaltyShootoutAdmin } from "@/components/apps/admin/PenaltyShootoutAdmin";
import { requireAdminPage } from "@/lib/adminAuth";
import { GetSeasons } from "@tranmere-web/lib/src/apiFunctions";
import {
  queryPenaltyShootoutKicks,
  queryPlayerRows,
} from "@tranmere-web/lib/src/d1-queries";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Manage penalty shootouts | Admin" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ season?: string; date?: string }>;
}) {
  await requireAdminPage("/admin/penalty-shootouts");
  const params = await searchParams;
  const seasons = GetSeasons().sort((a, b) => b - a);
  const requested = Number(params.season);
  const season = seasons.includes(requested) ? requested : seasons[0];
  const date = /^\d{4}-\d{2}-\d{2}$/.test(params.date ?? "")
    ? params.date
    : undefined;
  const db = getCloudflareContext().env.DB;
  const [kicks, players] = await Promise.all([
    queryPenaltyShootoutKicks(db, { season, matchDate: date }),
    queryPlayerRows(db),
  ]);
  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <header className="border-b border-white/10 bg-[#071a2b] text-white">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
          <Link
            href="/admin"
            className="text-xs font-bold uppercase tracking-[0.14em] text-white/45 hover:text-white"
          >
            Admin overview
          </Link>
          <h1 className="mt-5 font-display text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
            Penalty shootouts
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
            Record every kick in sequence, including the taker, team and
            outcome.
          </p>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12">
        <PenaltyShootoutAdmin
          initialKicks={kicks}
          seasons={seasons}
          players={players.map((p) => p.name)}
          selectedSeason={season}
          selectedDate={date}
        />
      </section>
    </main>
  );
}
