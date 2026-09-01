import { areIntervalsOverlapping } from "date-fns";
import type { Manager } from "@tranmere-web/lib/src/tranmere-web-types";

export function getSeasonManagers(
  managers: Manager[],
  season: number,
): Manager[] {
  const seasonInterval = {
    start: new Date(season, 6, 20),
    end: new Date(season + 1, 4, 15),
  };

  return managers
    .filter((manager) =>
      areIntervalsOverlapping(seasonInterval, {
        start: new Date(manager.dateJoined),
        end: manager.dateLeft.toLowerCase().startsWith("now")
          ? new Date()
          : new Date(manager.dateLeft),
      }),
    )
    .sort(
      (a, b) =>
        new Date(a.dateJoined).getTime() - new Date(b.dateJoined).getTime() ||
        a.name.localeCompare(b.name),
    );
}
