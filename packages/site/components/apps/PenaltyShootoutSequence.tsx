import type { PenaltyShootoutKickRow } from "@tranmere-web/lib/src/d1-types";
import { replaceSeasonsKit } from "@tranmere-web/lib/src/apiFunctions";
import { UserIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

const outcomeLabel = { scored: "Scored", missed: "Missed", saved: "Saved" };

export function PenaltyShootoutSequence({
  kicks,
  opposition,
  playerAvatars,
  season,
  kit,
}: {
  kicks: PenaltyShootoutKickRow[];
  opposition: string;
  playerAvatars?: Record<string, string>;
  season?: number;
  kit?: string;
}) {
  if (!kicks.length) return null;
  const orderedKicks = [...kicks].sort((a, b) => a.kick_order - b.kick_order);

  if (playerAvatars) {
    const rounds = Array.from(
      { length: Math.ceil(orderedKicks.length / 2) },
      (_, index) => orderedKicks.slice(index * 2, index * 2 + 2),
    );

    return (
      <div className="mt-6 border border-[#071a2b]/15 bg-[#fffdf8]">
        <div className="grid grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] items-end border-b border-[#071a2b]/15 bg-[#071a2b] px-3 py-4 text-[#fffdf8] sm:grid-cols-[minmax(0,1fr)_96px_minmax(0,1fr)] sm:px-5">
          <p className="text-sm font-bold sm:text-base">Tranmere Rovers</p>
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">
            Score
          </p>
          <p className="text-right text-sm font-bold sm:text-base">
            {opposition}
          </p>
        </div>
        <ol className="divide-y divide-[#071a2b]/10">
          {rounds.map((round, roundIndex) => {
            const completed = orderedKicks.slice(0, (roundIndex + 1) * 2);
            const roversScore = completed.filter(
              (kick) =>
                kick.team_side === "tranmere" && kick.outcome === "scored",
            ).length;
            const oppositionScore = completed.filter(
              (kick) =>
                kick.team_side === "opposition" && kick.outcome === "scored",
            ).length;
            const roversKick = round.find(
              (kick) => kick.team_side === "tranmere",
            );
            const oppositionKick = round.find(
              (kick) => kick.team_side === "opposition",
            );

            const renderKick = (
              kick: PenaltyShootoutKickRow | undefined,
            ) => {
              if (!kick) return <div aria-hidden="true" />;
              const avatar =
                kick.team_side === "tranmere"
                  ? playerAvatars[kick.player_name]
                  : undefined;
              const content = (
                <>
                  <div className="h-10 w-10 shrink-0 overflow-hidden border border-[#071a2b]/10 bg-[#e8e2d6] sm:h-12 sm:w-12">
                    {avatar ? (
                      <Image
                        src={replaceSeasonsKit(
                          avatar,
                          kit || season?.toString(),
                        )}
                        alt=""
                        width={96}
                        height={96}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon
                        aria-hidden="true"
                        className="h-full w-full p-2.5 text-[#071a2b]/30"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold sm:text-sm">
                      {kick.player_name}
                    </p>
                    <p
                      className={`mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${
                        kick.outcome === "scored"
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }`}
                    >
                      {outcomeLabel[kick.outcome]}
                    </p>
                  </div>
                </>
              );

              return kick.team_side === "tranmere" ? (
                <Link
                  href={`/page/player/${encodeURIComponent(kick.player_name)}`}
                  aria-label={`View ${kick.player_name}'s profile`}
                  className="flex min-w-0 items-center gap-2 hover:text-blue-700 sm:gap-3"
                >
                  {content}
                </Link>
              ) : (
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                  {content}
                </div>
              );
            };

            return (
              <li
                key={round[0]?.id ?? roundIndex}
                className="grid grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] items-center px-3 py-4 sm:grid-cols-[minmax(0,1fr)_96px_minmax(0,1fr)] sm:px-5"
              >
                {renderKick(roversKick)}
                <div className="text-center">
                  <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#071a2b]/40">
                    Round {roundIndex + 1}
                  </p>
                  <p className="mt-1 font-mono text-base font-bold text-[#071a2b] sm:text-lg">
                    {roversScore}–{oppositionScore}
                  </p>
                </div>
                {renderKick(oppositionKick)}
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  return (
    <ol className="mt-6 divide-y divide-[#071a2b]/10 border border-[#071a2b]/15 bg-[#fffdf8]">
      {orderedKicks.map((kick, index) => {
        const completed = orderedKicks.slice(0, index + 1);
        const rovers = completed.filter(
          (item) => item.team_side === "tranmere" && item.outcome === "scored",
        ).length;
        const opponents = completed.filter(
          (item) =>
            item.team_side === "opposition" && item.outcome === "scored",
        ).length;
        const isRovers = kick.team_side === "tranmere";
        const avatar = isRovers ? playerAvatars?.[kick.player_name] : undefined;
        return (
          <li
            key={kick.id}
            className={`grid items-center gap-4 px-4 py-4 hover:bg-blue-50/60 sm:px-5 ${
              playerAvatars
                ? "grid-cols-[32px_48px_minmax(0,1fr)_auto] sm:grid-cols-[48px_48px_minmax(0,1fr)_auto]"
                : "grid-cols-[48px_minmax(0,1fr)_auto]"
            }`}
          >
            <span className="font-mono text-xs font-bold text-[#071a2b]/45">
              {String(kick.kick_order).padStart(2, "0")}
            </span>
            {playerAvatars && (
              <div className="h-12 w-12 shrink-0 overflow-hidden border border-[#071a2b]/10 bg-[#e8e2d6]">
                {avatar ? (
                  <Link
                    href={`/page/player/${encodeURIComponent(kick.player_name)}`}
                    aria-label={`View ${kick.player_name}'s profile`}
                  >
                    <Image
                      src={replaceSeasonsKit(
                        avatar,
                        kit || season?.toString(),
                      )}
                      alt={`${kick.player_name} avatar`}
                      width={96}
                      height={96}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  </Link>
                ) : (
                  <UserIcon
                    aria-hidden="true"
                    className="h-full w-full p-3 text-[#071a2b]/35"
                  />
                )}
              </div>
            )}
            <div>
              <p className="font-semibold">
                {isRovers ? (
                  <Link
                    href={`/page/player/${encodeURIComponent(kick.player_name)}`}
                    className="hover:text-blue-700"
                  >
                    {kick.player_name}
                  </Link>
                ) : (
                  kick.player_name
                )}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#071a2b]/45">
                {isRovers ? "Tranmere Rovers" : opposition}
                {kick.notes ? ` · ${kick.notes}` : ""}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`text-xs font-bold uppercase tracking-[0.1em] ${
                  kick.outcome === "scored"
                    ? "text-emerald-700"
                    : "text-rose-700"
                }`}
              >
                {outcomeLabel[kick.outcome]}
              </span>
              <span className="mt-1 block font-mono text-sm font-bold">
                {rovers}–{opponents}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
