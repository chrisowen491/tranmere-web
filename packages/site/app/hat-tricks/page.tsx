export const runtime = "edge";
import { Title } from "@/components/fragments/Title";
import { GetAllHatTricks } from "@/lib/apiFunctions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tranmere Hat Tricks",
  description: "Tranmere Rovers Hat Trick Scorers",
};

export default async function HatTricks() {
  const players = await GetAllHatTricks();

  return (
    <>
      <Title
        subTitle="Player Records"
        title="Tranmere Hat Tricks"
        summary={
          "All these players scored hat tricks (or better) in a first team game. Data only goes as far back as the 1977-78 season."
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
                <img
                  alt={player.Player}
                  src={player.picLink}
                  className="mx-auto h-24 w-24 rounded-full"
                />
                <h3 className="mt-6 text-base font-semibold leading-7 tracking-tight text-gray-900 dark:text-gray-50">
                  {player.Player}
                </h3>
                <a
                  href={`/match/${player.Season}/${player.Date}`}
                  className="text-sm leading-6 text-gray-600 dark:text-gray-50"
                >
                  <p>{player.Date}</p>
                  <p>vs {player.Opposition}</p>
                  <p>{player.Goals} goals</p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
