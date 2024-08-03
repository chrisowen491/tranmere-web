import { PlayerProfile } from "@/lib/types";

export function PlayerOfTheDay(props: { randomplayer: PlayerProfile }) {
  const { randomplayer = props.randomplayer } = props;
  let goals = 0;
  if (randomplayer.appearances) {
    randomplayer.appearances.forEach((app) => {
      goals = goals + app.Goals!;
    });
  }
  return (
    <section className="isolate overflow-hidden mx-auto w-full px-8 mx-8">
      <div className="relative mx-auto max-w-2xl py-8 sm:py-8 lg:max-w-4xl">
        <div className="absolute left-1/2 top-0 -z-10 h-[50rem] w-[90rem] -translate-x-1/2 bg-[radial-gradient(50%_100%_at_top,theme(colors.indigo.100),white)] opacity-20 lg:left-36" />
        <div className="absolute inset-y-0 right-1/2 -z-10 mr-12 w-[150vw] origin-bottom-left skew-x-[-30deg] shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:mr-20 md:mr-0 lg:right-full lg:-mr-36 lg:origin-center" />
        <figure className="grid grid-cols-1 items-center gap-x-6 gap-y-8 lg:gap-x-10">
          <div className="col-end-1 w-16 lg:row-span-4 lg:w-72">
            <img
              alt=""
              src={randomplayer.player.picLink}
              className="rounded-xl bg-indigo-50 lg:rounded-3xl"
            />
          </div>
          <figcaption className="text-base lg:col-start-1 lg:row-start-3">
            <div className="font-semibold text-gray-900 dark:text-gray-50">
              Player Of the Day:
            </div>
            <div className="font-semibold text-gray-900 dark:text-gray-50">
              {randomplayer.player.name}
            </div>
            <div className="mt-1 text-gray-500 dark:text-gray-50">
              <strong>Debut:</strong> {randomplayer.debut.Opposition}{" "}
              {randomplayer.debut.Date}
            </div>
            <div className="mt-1 text-gray-500 dark:text-gray-50">
              {randomplayer.appearances.length} apps, {goals} goals
            </div>
            <div className="">
              <a
                href={`/page/player/${randomplayer.player.name}`}
                className="text-base font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View Player Profile
              </a>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
