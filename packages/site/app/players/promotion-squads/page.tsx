import {
  ArrowUpRightIcon,
  TrophyIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { replaceSeasonsKit } from "@tranmere-web/lib/src/apiFunctions";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Image from "next/image";
import Link from "next/link";
import { breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { getPromotionSquads } from "@/lib/promotionSquads";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Tranmere Rovers promotion squads",
  description:
    "The players, managers and key records behind Tranmere Rovers promotion-winning seasons.",
  pathname: "/players/promotion-squads",
});

function seasonLabel(season: number) {
  return `${season}/${String(season + 1).slice(-2)}`;
}

export default async function PromotionSquadsPage() {
  const env = (await getCloudflareContext({ async: true })).env;
  const squads = await getPromotionSquads(env.DB);

  return (
    <main className="min-h-screen bg-[#f4f0e8] pb-24 text-[#071a2b]">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Players", pathname: "/players" },
          { name: "Promotion squads", pathname: "/players/promotion-squads" },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Tranmere Rovers promotion squads",
          description:
            "The core players and managers behind Tranmere Rovers promotion-winning campaigns.",
          url: "https://www.tranmere-web.com/players/promotion-squads",
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: squads.length,
          },
        }}
      />

      <header className="relative overflow-hidden border-b border-white/15 bg-[#071a2b] text-white">
        <div className="archive-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-12 lg:py-24">
          <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
            <span className="h-px w-10 bg-blue-400" />
            Player archive
          </p>
          <div className="mt-7 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[0.94] tracking-[-0.055em] sm:text-7xl">
                The squads that
                <br />
                took us up.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">
                Meet the core players behind every recorded promotion and
                play-off-winning campaign in the Rovers archive.
              </p>
            </div>
            <dl className="grid grid-cols-2 border border-white/15">
              <div className="border-r border-white/15 p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  Campaigns
                </dt>
                <dd className="mt-3 font-display text-4xl font-semibold">
                  {squads.length}
                </dd>
              </div>
              <div className="p-5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                  First recorded
                </dt>
                <dd className="mt-3 font-display text-2xl font-semibold">
                  {seasonLabel(squads.at(-1)?.season ?? 0)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="mb-9 border-b border-[#071a2b]/15 pb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
            Promotion archive
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            The season&apos;s most-used players
          </h2>
        </div>

        <div className="space-y-10">
          {squads.map((squad) => {
            const topScorer = [...squad.players].sort(
              (left, right) =>
                right.goals - left.goals ||
                right.appearances - left.appearances,
            )[0];
            return (
              <article
                key={squad.season}
                className="border border-[#071a2b]/15 bg-[#fffdf8]"
              >
                <div className="grid gap-px border-b border-[#071a2b]/15 bg-[#071a2b]/15 lg:grid-cols-[230px_minmax(0,1fr)_220px]">
                  <Link
                    href={`/season/${squad.season}`}
                    className="group bg-[#071a2b] p-6 text-white transition hover:bg-blue-700"
                  >
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300">
                      Promotion season
                    </p>
                    <p className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em]">
                      {seasonLabel(squad.season)}
                    </p>
                    <span className="mt-8 inline-flex items-center gap-2 text-xs font-bold text-white/65 group-hover:text-white">
                      Open season <ArrowUpRightIcon className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                  <div className="bg-[#fffdf8] p-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <TrophyIcon className="h-5 w-5 text-amber-700" />
                      <h3 className="font-display text-2xl font-semibold tracking-[-0.03em]">
                        {squad.achievement.title}
                      </h3>
                    </div>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#071a2b]/60">
                      {squad.achievement.detail}
                    </p>
                    {squad.manager && (
                      <p className="mt-5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/45">
                        Manager · {squad.manager.name}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 bg-[#fffdf8] lg:grid-cols-1">
                    <div className="border-b border-[#071a2b]/15 p-5">
                      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/40">
                        Core squad
                      </p>
                      <p className="mt-2 font-display text-3xl font-semibold">
                        {squad.players.length}
                      </p>
                    </div>
                    <div className="p-5">
                      <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/40">
                        Leading scorer
                      </p>
                      <p className="mt-2 truncate font-display text-xl font-semibold">
                        {topScorer?.name ?? "—"}
                      </p>
                      <p className="mt-1 text-xs text-[#071a2b]/55">
                        {topScorer?.goals ?? 0} goals
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-[620px] w-full">
                    <thead className="border-b border-[#071a2b]/15 bg-[#e8e2d6] font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#071a2b]/55">
                      <tr>
                        <th className="w-14 px-4 py-4 text-center">No.</th>
                        <th className="px-4 py-4 text-left">Player</th>
                        <th className="px-4 py-4 text-center">Apps</th>
                        <th className="px-4 py-4 text-center">Goals</th>
                        <th className="hidden px-4 py-4 text-left md:table-cell">
                          Role
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#071a2b]/10 text-sm">
                      {squad.players.map((player, index) => (
                        <tr
                          key={player.name}
                          className="group transition hover:bg-blue-50/60"
                        >
                          <td className="px-4 py-3 text-center font-mono text-xs font-bold text-[#071a2b]/35">
                            {String(index + 1).padStart(2, "0")}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Image
                                alt=""
                                aria-hidden="true"
                                src={replaceSeasonsKit(
                                  player.profile.picLink,
                                  String(squad.season),
                                )}
                                width={44}
                                height={44}
                                unoptimized
                                className="h-11 w-11 border border-[#071a2b]/10 bg-[#e8e2d6] object-cover"
                              />
                              <Link
                                href={`/page/player/${player.name}`}
                                className="inline-flex items-center gap-1 font-display text-base font-semibold hover:text-blue-700"
                              >
                                {player.name}
                                <ArrowUpRightIcon className="h-3.5 w-3.5 opacity-25 transition group-hover:opacity-100" />
                              </Link>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center font-mono font-bold">
                            {player.appearances}
                            <span className="ml-1 text-xs font-normal text-[#071a2b]/45">
                              {player.starts}+{player.substitutes}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-grid min-w-8 place-items-center bg-blue-700 px-2 py-1 font-mono text-xs font-bold text-white">
                              {player.goals}
                            </span>
                          </td>
                          <td className="hidden px-4 py-3 text-[#071a2b]/55 md:table-cell">
                            {[
                              player.profile.position,
                              player.profile.secondaryPosition,
                            ]
                              .filter(Boolean)
                              .join(" / ") || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            );
          })}
        </div>

        <Link
          href="/honours"
          className="mt-10 inline-flex items-center gap-3 border border-[#071a2b]/20 bg-[#fffdf8] px-5 py-4 text-sm font-bold transition hover:border-blue-700 hover:text-blue-700"
        >
          <UserGroupIcon className="h-5 w-5" />
          Explore every landmark season
          <ArrowUpRightIcon className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
