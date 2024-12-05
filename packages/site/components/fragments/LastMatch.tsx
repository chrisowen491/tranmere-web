import { GetLastMatch } from "@/lib/apiFunctions";
import { PlayIcon } from "@heroicons/react/20/solid";
import { LinkButton } from "@/components//forms/LinkButton";
import Image from "next/image";
export async function LastMatch() {
  const match = await GetLastMatch();
  if (!match) {
    return <div></div>;
  }
  const score = `${match.home} ${match.ft} ${match.visitor}`;
  return (
    <>
      {match.largeProgramme ? (
        <Image
          alt="Match Programme"
          width={250}
          height={400}
          src={`https://images.tranmere-web.com/${match.largeProgramme}`}
          className="h-80 object-cover object-left mx-auto"
        />
      ) : (
        <PlayIcon
          aria-hidden="true"
          className="h-80 w-80 mx-auto text-indigo-600 dark:text-indigo-50"
        />
      )}

      <div className="p-10 pt-4 mx-auto">
        <h3 className="text-sm/4 font-semibold text-indigo-600 dark:text-indigo-50">
          Last Match
        </h3>
        <p className="mt-2 text-lg/7 font-medium tracking-tight text-gray-950 dark:text-indigo-50">
          {match.opposition} ({match.ft})
        </p>
        <p className="mt-2 max-w-lg text-sm/6 text-gray-600 dark:text-indigo-50">
          <LinkButton
            text="View Match Report"
            href={`/match/${match.season}/${match.date}`}
          ></LinkButton>
        </p>
      </div>
    </>
  );
}
