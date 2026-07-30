import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import { ManagerTrustedXi } from "@/components/apps/ManagerTrustedXi";
import { GetBaseUrl } from "@/lib/apiFunctions";
import { getManagers } from "@/lib/managers";
import { getManagerTrustedXi } from "@/lib/managerTrustedXi";

export const revalidate = 7200;

export const metadata: Metadata = {
  title: "Manager's Trusted XI",
  description:
    "Discover the players most frequently selected by every Tranmere Rovers manager.",
};

export default async function ManagerTrustedXiPage() {
  const env = (await getCloudflareContext({ async: true })).env;
  const managers = await getManagers(env.DB);
  const defaultManager =
    managers.find((manager) => manager.name === "Nigel Adkins") ||
    managers.find(
      (manager) => !manager.dateLeft.toLowerCase().startsWith("now"),
    )!;
  const initialXi = await getManagerTrustedXi(GetBaseUrl(env), defaultManager);

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
            Pick a managerial spell and reveal the goalkeeper, back four,
            midfield and strike partnership they started most often.
          </p>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/15 pt-7 font-mono text-xs uppercase tracking-[0.16em] text-white/50">
            <span>Exact tenure dates</span>
            <span>Primary positions</span>
            <span>4–4–2 archive XI</span>
          </div>
        </div>
      </header>
      <ManagerTrustedXi managers={managers} initialXi={initialXi} />
    </main>
  );
}
