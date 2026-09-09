import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { getClubCaptains } from "@/lib/clubCaptains";
import { getPlayerStatisticsProfiles } from "@/lib/playerStatistics";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Tranmere Rovers club captains",
  description: "Tranmere Rovers club captains by season.",
};

export default async function ClubCaptainsPage() {
  const env = getCloudflareContext().env;
  const captains = await getClubCaptains(env.DB);
  const profiles = await getPlayerStatisticsProfiles(
    env.DB,
    captains.map((captain) => captain.playerName),
  );
  const seasons = Map.groupBy(captains, (captain) => captain.season);

  return (
    <main className="min-h-screen bg-[#f4f0e8] text-[#071a2b]">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Players", pathname: "/players" },
          { name: "Club captains", pathname: "/players/club-captains" },
        ])}
      />
      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            Player records
          </p>
          <h1 className="mt-7 font-display text-5xl font-semibold tracking-[-0.055em] sm:text-7xl">
            Leaders
            <br />
            of the side.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
            The players entrusted with the Tranmere Rovers captaincy, season by
            season.
          </p>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="mb-8 border-b border-[#071a2b]/15 pb-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Captaincy archive
          </p>
          <h2 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em]">
            Season by season.
          </h2>
        </div>
        <ol className="grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 md:grid-cols-2">
          {[...seasons.entries()].map(([season, entries]) => (
            <li key={season} className="bg-[#fffdf8] p-6">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-blue-700">
                {season}/{String(season + 1).slice(-2)}
              </p>
              <div className="mt-5 space-y-4">
                {entries.map((captain) => {
                  const profile = profiles.get(captain.playerName)!;
                  return (
                    <div
                      key={captain.id}
                      className="flex items-center gap-4 border-t border-[#071a2b]/10 pt-4 first:border-0 first:pt-0"
                    >
                      <Link
                        href={`/page/player/${encodeURIComponent(captain.playerName)}`}
                        className="h-16 w-16 shrink-0 overflow-hidden border border-[#071a2b]/10 bg-[#e8e2d6]"
                      >
                        <Image
                          src={profile.picLink}
                          alt={`${captain.playerName} avatar`}
                          width={128}
                          height={128}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      </Link>
                      <div>
                        <Link
                          href={`/page/player/${encodeURIComponent(captain.playerName)}`}
                          className="font-display text-2xl font-semibold hover:text-blue-700"
                        >
                          {captain.playerName}
                        </Link>
                        {captain.notes && (
                          <p className="mt-1 text-sm text-[#071a2b]/55">
                            {captain.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>
        {!captains.length && (
          <div className="border border-[#071a2b]/15 bg-[#fffdf8] p-8">
            <h3 className="font-display text-2xl font-semibold">
              No captains recorded yet.
            </h3>
          </div>
        )}
      </section>
    </main>
  );
}
