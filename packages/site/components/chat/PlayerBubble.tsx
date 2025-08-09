import Image from "next/image";
import { PlayerView } from "@tranmere-web/lib/src/tranmere-web-types";
import Link from "next/link";

export function PlayerBubble(props: { player: PlayerView }) {
  const player = props.player;
  return (
    <ul
      role="list"
      className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 text-center"
    >
        <li
          className="text-sm leading-6 text-gray-50 dark:text-gray-50"
        >
          {player.player.picLink ? (
            <Image
              alt={player.player.name}
              width={200}
              height={200}
              unoptimized={true}
              src={player.player.picLink}
              className="mx-auto h-48 w-48 rounded-full"
            />
          ) : (
            ""
          )}
          <h3 className="mt-6 text-base font-semibold leading-7 tracking-tight">
            {player?.player.name}
          </h3>
          <table className="mx-auto table-auto text-xs mb-8">
            <thead>
              <tr>
                <th>Season</th>
                <th>Apps</th>
                <th>Goals</th>
              </tr>
            </thead>
            <tbody>
              {player.seasons.map((season, idx) => (
                <tr key={idx}>
                  <td>{season.Season}</td>
                  <td>{season.Apps}</td>
                  <td>{season.goals}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            <Link className="underline" href={`/page/player/${player?.player.name}`}>
              View Profile
            </Link>
          </p>
        </li>
    </ul>
  );
}
