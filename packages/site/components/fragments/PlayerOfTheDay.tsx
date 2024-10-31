import { PlayerProfile } from "@/lib/types";
import { LinkButton } from "@/components//forms/LinkButton";
import Image from "next/image";

export function PlayerOfTheDay(props: { randomplayer: PlayerProfile }) {
  const { randomplayer = props.randomplayer } = props;
  let goals = 0;
  if (randomplayer.appearances) {
    randomplayer.appearances.forEach((app) => {
      goals = goals + app.Goals!;
    });
  }
  return (
    <>
      <Image
        alt={randomplayer.player.name}
        width={200}
        height={200}  
        unoptimized={true}
        src={randomplayer.player.picLink!}
        className="h-80 w-80 object-cover object-left mx-auto"
      />
      <div className="p-10 pt-4 mx-auto">
        <h3 className="text-sm/4 font-semibold text-indigo-600 dark:text-indigo-50">
          Random Player of the Day
        </h3>
        <p className="mt-2 text-lg/7 font-medium tracking-tight text-gray-950 dark:text-indigo-50">
          {randomplayer.player.name}
        </p>
        <p className="mt-2 max-w-lg text-sm/6 text-gray-600 dark:text-indigo-50">
          <strong>Debut:</strong> {randomplayer.debut.Opposition}{" "}
          {randomplayer.debut.Date}
          <br />
          {randomplayer.appearances.length} apps, {goals} goals
          <br />
          <LinkButton
            text="View Player Profile"
            href={`/page/player/${randomplayer.player.name}`}
          ></LinkButton>
        </p>
      </div>
    </>
  );
}
