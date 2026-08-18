import Image from "next/image";
import { replaceSeasonsKit } from "@tranmere-web/lib/src/apiFunctions";
import { FANTASY_FORMATIONS, type FantasyFormation } from "@/lib/fantasyTeams";

type Player = {
  slotId: string;
  playerId: string;
  playerName: string;
  picLink: string | null;
  missing: boolean;
};

export function SharedFantasyTeam({
  formation,
  kit,
  captainPlayerId,
  players,
}: {
  formation: FantasyFormation;
  kit: string;
  captainPlayerId: string | null;
  players: Player[];
}) {
  const bySlot = new Map(players.map((player) => [player.slotId, player]));
  return (
    <div className="fantasy-pitch relative min-h-[700px] overflow-hidden border border-[#071a2b]/25 bg-blue-900 px-4 py-8 text-white sm:px-8">
      <div className="pointer-events-none absolute inset-4 border border-white/25" />
      <div className="pointer-events-none absolute inset-x-4 top-1/2 border-t border-white/25" />
      <div className="relative z-10 flex min-h-[636px] flex-col justify-between">
        {FANTASY_FORMATIONS[formation].map((line, index) => (
          <div
            key={index}
            className="flex min-h-28 items-center justify-around gap-1"
          >
            {line.map((slot) => {
              const player = bySlot.get(slot.id);
              return (
                <div
                  key={slot.id}
                  className="flex w-20 flex-col items-center text-center sm:w-28"
                >
                  <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/45 bg-[#f4f0e8] sm:h-24 sm:w-24">
                    {player?.picLink ? (
                      <Image
                        src={replaceSeasonsKit(player.picLink, kit)}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center px-2 font-mono text-[10px] font-bold text-[#071a2b]">
                        Unavailable
                      </div>
                    )}
                  </div>
                  <span className="mt-2 text-xs font-bold">
                    {player?.playerName ?? slot.position}
                    {player?.playerId === captainPlayerId ? " (C)" : ""}
                  </span>
                  {player?.missing && (
                    <span className="mt-1 bg-amber-300 px-1 font-mono text-[8px] text-[#071a2b]">
                      Saved archive name
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
