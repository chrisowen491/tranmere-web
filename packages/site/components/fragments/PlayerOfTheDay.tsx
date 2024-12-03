import { PlayerProfile } from "@/lib/types";
import { LinkButton } from "@/components//forms/LinkButton";
import { GetAllPlayers, GetBaseUrl } from "@/lib/apiFunctions";
import { getRequestContext } from "@cloudflare/next-on-pages";
import Image from "next/image";

export async function PlayerOfTheDay() {
  const players = await GetAllPlayers();
  const randomplayer = players[Math.floor(Math.random() * players.length)];

  const url =
    GetBaseUrl(getRequestContext().env) + `/page/player/${randomplayer.name}`;

  const playerRequest = await fetch(url);

  const profile = (await playerRequest.json()) as PlayerProfile;

  let goals = 0;
  if (profile.appearances) {
    profile.appearances.forEach((app) => {
      goals = goals + app.Goals!;
    });
  }
  return (
    <>
      <Image
        alt={profile.player.name}
        width={200}
        height={200}
        unoptimized={true}
        src={profile.player.picLink!}
        className="h-80 w-80 object-cover object-left mx-auto"
      />
      <div className="p-10 pt-4 mx-auto">
        <h3 className="text-sm/4 font-semibold text-indigo-600 dark:text-indigo-50">
          Random Player
        </h3>
        <p className="mt-2 text-lg/7 font-medium tracking-tight text-gray-950 dark:text-indigo-50">
          {profile.player.name}
        </p>
        <p className="mt-2 max-w-lg text-sm/6 text-gray-600 dark:text-indigo-50">
          <strong>Debut:</strong> {profile.debut.Opposition}{" "}
          {profile.debut.Date}
          <br />
          {profile.appearances.length} apps, {goals} goals
          <br />
          <LinkButton
            text="View Player Profile"
            href={`/page/player/${profile.player.name}`}
          ></LinkButton>
        </p>
      </div>
    </>
  );
}
