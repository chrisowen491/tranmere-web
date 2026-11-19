import { getCloudflareContext } from "@opennextjs/cloudflare";
import { timeMachineEventsSql } from "@tranmere-web/lib/src/d1-queries/time-machine";
import { TimeMachineGame } from "@/components/apps/TimeMachineGame";
import { dailyTimeline, type ArchiveEvent } from "@/lib/timeMachine";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Rovers Time Machine — daily archive game",
  description: "Put five moments from Tranmere Rovers history in date order.",
};

export default async function TimeMachinePage() {
  const day = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const db = (await getCloudflareContext({ async: true })).env.DB;
  const { results } = await db
    .prepare(timeMachineEventsSql)
    .all<ArchiveEvent>();
  const cards = dailyTimeline(results, day);
  return <TimeMachineGame key={day} day={day} cards={cards} />;
}
