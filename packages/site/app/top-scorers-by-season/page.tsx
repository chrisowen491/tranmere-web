import { Title } from "@/components/fragments/Title";
import { GetTopScorersBySeason } from "@tranmere-web/lib/src/apiFunctions";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 7200;

export const metadata: Metadata = {
  title: "Top Scorers By Season",
  description: "Tranmere Rovers Top Scorers By Season",
};

export default async function TopScorersBySeason() {
  const topScorers = await GetTopScorersBySeason();

  return (
    <>
      <Title
        subTitle={"Player Records"}
        title="Top Scorers By Season"
        summary={"Data only goes as far back as the 1977-78 season."}
      ></Title>
      <div className="py-2 sm:py-2">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <ul
            role="list"
            className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-16 text-center sm:grid-cols-3 md:grid-cols-4 lg:mx-0 lg:max-w-none lg:grid-cols-5 xl:grid-cols-6"
          >
            {topScorers.map((player, idx) => (
              <li key={idx}>
                <Link
                  href={`/page/player/${player.Player}`}
                  className="text-sm leading-6 text-gray-600 dark:text-gray-50"
                >
                  <Image
                    alt={player.Player}
                    width={200}
                    height={200}
                    unoptimized={true}
                    src={player.bio!.picLink!}
                    className="mx-auto h-24 w-24 rounded-full"
                  />
                  <h3 className="mt-6 text-base font-semibold leading-7 tracking-tight text-gray-900 dark:text-gray-50">
                    {player.Player}
                  </h3>
                  <p>{player.Season}</p>
                  <p>{player.goals} goals</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
