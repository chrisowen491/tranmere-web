import { PlayerSearch } from "@/components/apps/PlayerSearch";
import { Title } from "@/components/fragments/Title";
import { PlayerSeasonSummary } from "@tranmere-web/lib/src/tranmere-web-types";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Metadata } from "next";
import { GetBaseUrl } from "@/lib/apiFunctions";
import { LinkButton } from "@/components/forms/LinkButton";

export const revalidate = 7200;

export const metadata: Metadata = {
  title: "Players Home",
  description: "Tranmere Rovers player infomation index",
};

export default async function PlayerSearchPage() {
  const base = GetBaseUrl((await getCloudflareContext({async: true})).env) + "/player-search/";

  const dateobj = new Date();
  const theYear =
    dateobj.getUTCMonth() > 6
      ? dateobj.getFullYear()
      : dateobj.getFullYear() - 1;

  const latestSeasonRequest = await fetch(
    base + `?season=${theYear}&sort=&filter=`,
  );
  const playerResults = (await latestSeasonRequest.json()) as {
    players: PlayerSeasonSummary[];
  };

  return (
    <>
      <Title title="Players Search" subTitle="Player Records" summary={""}>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-50">
          Search for players by season or position - or view{" "}
          <LinkButton
            href="/player-records/most-appearances"
            text="appearance records"
          />{" "}
          or{" "}
          <LinkButton href="/player-records/top-scorers" text="top scorers" />,
          You can also see players with just{" "}
          <LinkButton
            href="/player-records/only-one-appearance"
            text="one appearance"
          />{" "}
          and browse{" "}
          <LinkButton
            href="/top-scorers-by-season"
            text="top scorers by season"
          />{" "}
          or players with <LinkButton href="/hat-tricks" text="hat tricks" />{" "}
          and{" "}
          <LinkButton
            href="/top-scorers-per-game"
            text="Top goals per game"
          ></LinkButton>
          .
        </p>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-50">
          Use the filters to switch season or focus on a groups of players.
          Player records only go far back as 1977, though I am slowly filling in
          other years.
        </p>
      </Title>
      <div className="  mx-auto flex w-full max-w-7xl">
        <PlayerSearch default={playerResults.players} season="2023" />
      </div>
    </>
  );
}
