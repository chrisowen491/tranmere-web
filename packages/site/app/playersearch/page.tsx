import { PlayerSearch } from "@/components/apps/PlayerSearch";
import { Title } from "@/components/fragments/Title";
import { PlayerSeasonSummary } from "@tranmere-web/lib/src/tranmere-web-types";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { Metadata } from "next";
import { GetBaseUrl } from "@/lib/apiFunctions";
export const runtime = "edge";

export const metadata: Metadata = {
  title: "Players Home",
  description: "Tranmere Rovers player infomation index",
};

export default async function PlayerSearchPage() {
  const base = GetBaseUrl(getRequestContext().env) + "/player-search/";

  var dateobj = new Date();
  var theYear =
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
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-50">Search for players by season or position - or view <a href='/player-records/most-appearances' className='text-indigo-600'>all time time appearance records</a> or <a href='/player-records/top-scorers' className='text-indigo-600'>top scorers</a>, You can also see players with just <a href='/player-records/only-one-appearance' className='text-indigo-600'>one appearance</a> and browse <a href='/top-scorers-by-season' className='text-indigo-600'>top scorers by season</a> or player with <a href='/hat-tricks' className='text-indigo-600'>hat tricks</a>.</p>
      </Title>
      <PlayerSearch default={playerResults.players} season="2023" />
    </>
  );
}
