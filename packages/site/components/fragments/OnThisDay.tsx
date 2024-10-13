import { GetOnThisDay } from "@/lib/apiFunctions";
import { PlayIcon } from "@heroicons/react/20/solid";
import { LinkButton } from "@/components//forms/LinkButton";
export async function OnThisDay() {
  const match = await GetOnThisDay();
  if (!match) {
    return <div></div>;
  }
  return (
    <>
      {match.programme ? (
        <img
          alt="Match Programme"
          src={`https://images.tranmere-web.com/${match.programme}`}
          className="h-80 mx-auto mt-2"
        />
      ) : (
        <PlayIcon
          aria-hidden="true"
          className="h-80 w-80 mx-auto text-indigo-600 dark:text-indigo-50"
        />
      )}

      <div className="p-10 pt-4 mx-auto">
        <h3 className="text-sm/4 font-semibold text-indigo-600 dark:text-indigo-50">
          On This Day
        </h3>
        <p className="mt-2 text-lg/7 font-medium tracking-tight text-gray-950 dark:text-indigo-50">
          {match.opposition} ({match.hgoal}-{match.vgoal})
        </p>
        <p className="mt-2 max-w-lg text-sm/6 text-gray-600 dark:text-indigo-50">
          <strong>Date:</strong> {match.date}
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
