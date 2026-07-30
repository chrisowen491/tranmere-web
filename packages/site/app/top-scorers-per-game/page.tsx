import { Title } from "@/components/fragments/Title";
import { GetBaseUrl } from "@/lib/apiFunctions";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPlayerStatistics } from "@/lib/playerStatistics";

export const revalidate = 7200;

export const metadata: Metadata = {
  title: "Tranmere Top Scorers - Goals Per Game",
  description: "Who has the best goals per game average for Tranmere Rovers",
};

export default async function HatTricks() {
  const env = (await getCloudflareContext({ async: true })).env;
  const players = (
    await getPlayerStatistics(env.DB, GetBaseUrl(env), { sort: "Goals" })
  )
    .filter((player) => player.Apps > 20)
    .map((player) => ({
      ...player,
      goalsPerGame: Math.round((player.goals / player.Apps) * 100) / 100,
    }))
    .sort((a, b) => b.goalsPerGame - a.goalsPerGame);

  return (
    <>
      <Title
        subTitle="Player Records"
        title="Tranmere Top Goals Per Game Average"
        summary={
          "These players have the best goals per game ratio, with a minimum of 20 appearances"
        }
      ></Title>
      <div className="py-2 sm:py-2">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <ul
            role="list"
            className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-16 text-center sm:grid-cols-3 md:grid-cols-4 lg:mx-0 lg:max-w-none lg:grid-cols-5 xl:grid-cols-6"
          >
            {players.map((player, idx) => (
              <li key={idx}>
                <Image
                  alt={player.Player}
                  width={200}
                  height={200}
                  unoptimized={true}
                  src={player.profile.picLink}
                  className="mx-auto h-24 w-24 rounded-full"
                />
                <h3 className="mt-6 text-base font-semibold leading-7 tracking-tight text-gray-900 dark:text-gray-50">
                  {player.Player}
                </h3>
                <Link
                  href={`/page/player/${player.Player}`}
                  className="text-sm leading-6 text-gray-600 dark:text-gray-50"
                >
                  <p>{player.goalsPerGame} goals per game</p>
                  <p>{player.goals} goals</p>
                  <p>{player.Apps} appearances</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
