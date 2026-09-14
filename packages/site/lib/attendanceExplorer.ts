import type { Match } from "@tranmere-web/lib/src/tranmere-web-types";

export type AttendanceVenue = "H" | "A" | "N";

export interface AttendanceFilters {
  seasonFrom?: number;
  seasonTo?: number;
  competition?: string;
  venue?: AttendanceVenue;
}

export interface AttendanceGroup {
  label: string;
  matches: number;
  recorded: number;
  total: number;
  average: number;
  highest: number;
}

function attendance(match: Match) {
  const value = Number(match.attendance);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function summarise(label: string, matches: Match[]): AttendanceGroup {
  const values = matches.flatMap((match) => {
    const value = attendance(match);
    return value === null ? [] : [value];
  });
  const total = values.reduce((sum, value) => sum + value, 0);

  return {
    label,
    matches: matches.length,
    recorded: values.length,
    total,
    average: values.length ? Math.round(total / values.length) : 0,
    highest: values.length ? Math.max(...values) : 0,
  };
}

function groupMatches(
  matches: Match[],
  label: (match: Match) => string | undefined,
) {
  const groups = new Map<string, Match[]>();
  for (const match of matches) {
    const key = label(match)?.trim();
    if (!key) continue;
    groups.set(key, [...(groups.get(key) ?? []), match]);
  }
  return [...groups].map(([key, group]) => summarise(key, group));
}

export function buildAttendanceExplorer(
  matches: Match[],
  filters: AttendanceFilters = {},
) {
  const filteredMatches = matches.filter((match) => {
    const season = Number(match.season);
    return (
      (!filters.seasonFrom || season >= filters.seasonFrom) &&
      (!filters.seasonTo || season <= filters.seasonTo) &&
      (!filters.competition || match.competition === filters.competition) &&
      (!filters.venue || match.location === filters.venue)
    );
  });
  const recordedMatches = filteredMatches.filter(
    (match) => attendance(match) !== null,
  );
  const values = recordedMatches
    .map((match) => attendance(match)!)
    .toSorted((left, right) => left - right);
  const total = values.reduce((sum, value) => sum + value, 0);
  const middle = Math.floor(values.length / 2);
  const median = values.length
    ? Math.round(
        values.length % 2
          ? values[middle]
          : (values[middle - 1] + values[middle]) / 2,
      )
    : 0;

  return {
    filteredMatches,
    recordedMatches,
    summary: {
      matches: filteredMatches.length,
      recorded: recordedMatches.length,
      coverage: filteredMatches.length
        ? Math.round((recordedMatches.length / filteredMatches.length) * 100)
        : 0,
      total,
      average: values.length ? Math.round(total / values.length) : 0,
      median,
    },
    bySeason: groupMatches(filteredMatches, (match) => match.season).sort(
      (left, right) => Number(left.label) - Number(right.label),
    ),
    byVenue: groupMatches(filteredMatches, (match) =>
      match.location === "H"
        ? "Home"
        : match.location === "A"
          ? "Away"
          : "Neutral",
    ).sort((left, right) => right.average - left.average),
    byCompetition: groupMatches(
      filteredMatches,
      (match) => match.competition,
    ).sort(
      (left, right) =>
        right.recorded - left.recorded || right.average - left.average,
    ),
    byOpposition: groupMatches(filteredMatches, (match) => match.opposition)
      .filter((group) => group.recorded >= 3)
      .sort(
        (left, right) =>
          right.average - left.average || right.recorded - left.recorded,
      ),
    records: recordedMatches.toSorted(
      (left, right) =>
        attendance(right)! - attendance(left)! ||
        left.date.localeCompare(right.date),
    ),
  };
}
