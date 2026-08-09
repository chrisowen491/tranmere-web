import { getCloudflareContext } from "@opennextjs/cloudflare";
import { connection } from "next/server";
import type { Metadata } from "next";
import { ManagerTrustedXi } from "@/components/apps/ManagerTrustedXi";
import { getManagers } from "@/lib/managers";
import { getManagerTrustedXi } from "@/lib/managerTrustedXi";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
  title: "Manager's Trusted XI",
  description:
    "Discover the players most frequently selected by every Tranmere Rovers manager.",
};

export default async function ManagerTrustedXiPage() {
  await connection();
  const env = (await getCloudflareContext({ async: true })).env;
  const managers = await getManagers(env.DB);
  const defaultManager =
    managers.find((manager) => manager.name === "Nigel Adkins") ||
    managers.find(
      (manager) => !manager.dateLeft.toLowerCase().startsWith("now"),
    )!;
  const initialXi = await getManagerTrustedXi(env.DB, defaultManager);

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            <span className="h-px w-10 bg-blue-400" />
            First on the team sheet
          </p>
          <h1 className="mt-7 max-w-5xl font-display text-5xl font-semibold leading-[0.94] tracking-[-0.055em] sm:text-7xl">
            The manager&rsquo;s
            <br />
            trusted XI.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
            Pick a managerial spell and reveal the XI they trusted most,
            arranged in their preferred formation.
          </p>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/15 pt-7 font-mono text-xs uppercase tracking-[0.16em] text-white/50">
            <span>Exact tenure dates</span>
            <span>Primary &amp; secondary positions</span>
            <span>Manager&rsquo;s preferred shape</span>
          </div>
        </div>
      </header>
      <ManagerTrustedXi managers={managers} initialXi={initialXi} />
    </main>
  );
}
