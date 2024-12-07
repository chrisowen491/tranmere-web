import { ExtendedMessage } from "@/lib/types";
import Image from "next/image";
import { LinkButton } from "../forms/LinkButton";

export function PlayerBubble(props: { message: ExtendedMessage }) {
  return (
    <ul
      role="list"
      className="mx-auto grid max-w-2xl grid-cols-2 gap-x-8 gap-y-16 text-center sm:grid-cols-3 md:grid-cols-4 lg:mx-0 lg:max-w-none lg:grid-cols-5 xl:grid-cols-6"
    >
      {props.message.players!.map((player, idx) => (
        <li
          key={idx}
          className="text-sm leading-6 text-gray-600 dark:text-gray-50"
        >
          {player.picLink ? (
            <Image
              alt={player.Player}
              width={200}
              height={200}
              unoptimized={true}
              src={player.picLink.fields.file.url}
              className="mx-auto h-48 w-48 rounded-full"
            />
          ) : (
            ""
          )}
          <h3 className="mt-6 text-base font-semibold leading-7 tracking-tight">
            {player?.Player}
          </h3>
          <p>{player?.Apps} apps</p>
          <p>{player?.goals} goals</p>
          <p>
            <LinkButton
              text="View Profile"
              href={`/page/player/${player?.Player}`}
            ></LinkButton>
          </p>
        </li>
      ))}

      {props.message.profiles!.map((player, idx) => (
        <li
          key={idx}
          className="text-sm leading-6 text-gray-600 dark:text-gray-50"
        >
          {player.player.picLink ? (
            <Image
              alt={player.player.name}
              width={200}
              height={200}
              unoptimized={true}
              src={player.player.picLink!}
              className="mx-auto h-48 w-48 rounded-full"
            />
          ) : (
            ""
          )}
          <h3 className="mt-6 text-base font-semibold leading-7 tracking-tight">
            {player.player.name}
          </h3>
          <p>{player.seasons.find((s) => s.Season === "TOTAL")?.Apps} apps</p>
          <p>{player.seasons.find((s) => s.Season === "TOTAL")?.goals} goals</p>
          <p>
            <LinkButton
              text="View Profile"
              href={`/page/player/${player.player.name}`}
            ></LinkButton>
          </p>
        </li>
      ))}
    </ul>
  );
}
