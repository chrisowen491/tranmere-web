import {
  ArrowRightIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  TrophyIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import {
  Manager,
  Match,
  Transfer,
} from "@tranmere-web/lib/src/tranmere-web-types";
import { Shirt, ShirtUsageType } from "@/lib/types";
import { replaceSeasonsKit } from "@tranmere-web/lib/src/apiFunctions";
import Image from "next/image";
import Link from "next/link";
import { JumpBox } from "../forms/JumpBox";
import type { PlayerStatisticsView } from "@/lib/playerStatistics";
import type { HonoursAchievement } from "@tranmere-web/lib/src/honours-constants";
import type { LeagueSeasonSummaryRow } from "@tranmere-web/lib/src/d1-types";
import {
  goalsAgainst,
  goalsFor,
  matchOutcome,
  outcomeClass,
} from "@/lib/seasonMatchUtils";
import {
  buildMostUsedXi,
  divisionName,
  maxBy,
  seasonLabel,
  shortDate,
  summarizeResults,
  uniqueMatches,
} from "@/lib/seasonStoryData";

function playerInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2);
}

function ordinal(value: number) {
  const remainder = value % 100;
  if (remainder >= 11 && remainder <= 13) return `${value}th`;
  const suffix =
    value % 10 === 1
      ? "st"
      : value % 10 === 2
        ? "nd"
        : value % 10 === 3
          ? "rd"
          : "th";
  return `${value}${suffix}`;
}

export function SeasonStory(props: {
  season: string;
  results: Match[];
  players: PlayerStatisticsView[];
  managers: Manager[];
  transfers: Transfer[];
  shirts: Shirt[];
  seasons: number[];
  achievements: readonly HonoursAchievement[];
  leagueSummary?: LeagueSeasonSummaryRow;
}) {
  const {
    season: seasonValue,
    results,
    players,
    managers,
    transfers,
    shirts,
    seasons,
    achievements,
    leagueSummary,
  } = props;
  const season = Number(seasonValue);
  const hasRelegation = achievements.some(
    (achievement) => achievement.kind === "Relegation",
  );
  const completedResults = results.filter(
    (result) =>
      typeof result.hgoal === "number" && typeof result.vgoal === "number",
  );
  const leagueResults = completedResults.filter(
    (result) =>
      result.competition === "League" || result.competition === "Conference",
  );
  const leagueResultSummary = summarizeResults(leagueResults);
  const leagueSummaryStats = leagueSummary
    ? {
        matches:
          leagueSummary.wins + leagueSummary.draws + leagueSummary.losses,
        wins: leagueSummary.wins,
        draws: leagueSummary.draws,
        defeats: leagueSummary.losses,
        goals: `${leagueSummary.goals_for}–${leagueSummary.goals_against}`,
      }
    : {
        matches: leagueResults.length,
        wins: leagueResultSummary.W,
        draws: leagueResultSummary.D,
        defeats: leagueResultSummary.L,
        goals: `${leagueResultSummary.scored}–${leagueResultSummary.conceded}`,
      };
  const prentonLeagueResults = leagueResults.filter(
    (result) =>
      result.venue?.trim().toLowerCase() === "prenton park" &&
      Boolean(result.attendance && result.attendance > 0),
  );
  const prentonLeagueAttendance = prentonLeagueResults.reduce(
    (total, result) => total + (result.attendance ?? 0),
    0,
  );
  const averagePrentonLeagueAttendance = prentonLeagueResults.length
    ? Math.round(prentonLeagueAttendance / prentonLeagueResults.length)
    : 0;
  const topScorer = maxBy(players, (player) => player.goals);
  const mostUsedXi = buildMostUsedXi(players);
  const biggestWin = maxBy(
    completedResults.filter((result) => matchOutcome(result) === "W"),
    (result) => goalsFor(result) - goalsAgainst(result),
  );
  const highestAttendance = maxBy(
    completedResults,
    (result) => result.attendance ?? 0,
  );
  const storyMoments = uniqueMatches([
    completedResults[0],
    biggestWin,
    highestAttendance,
    completedResults.at(-1),
  ]);
  const definingMatches = uniqueMatches([
    biggestWin,
    highestAttendance,
    completedResults.at(-1),
  ]).slice(0, 3);
  const managerNames = managers.map((manager) => manager.name).join(", ");
  const homeShirt =
    shirts.find((shirt) => shirt.use === ShirtUsageType.Home) ?? shirts[0];
  const shirt = homeShirt?.imagesCollection.items[0];

  return (
    <section
      id="season-story"
      className="overflow-hidden bg-[#071a2b] text-white"
    >
      <div className="border-b border-white/15">
        <div className="mx-auto flex max-w-7xl items-center gap-7 px-6 py-4 text-xs font-bold uppercase tracking-[0.15em] lg:px-8">
          <a
            className="border-b-2 border-emerald-400 pb-1"
            href="#season-story"
          >
            Story
          </a>
          <a
            className="text-white/55 transition hover:text-white"
            href="#season-timeline"
          >
            Timeline
          </a>
          <a
            className="text-white/55 transition hover:text-white"
            href="#season-archive"
          >
            Full archive
          </a>
          <Link
            className="ml-auto hidden text-white/55 transition hover:text-white md:block"
            href={`/results?season=${seasonValue}`}
          >
            All results
          </Link>
          <JumpBox compact season={seasonValue} seasons={seasons} />
        </div>
      </div>

      <div className="relative isolate">
        <div className="archive-grid absolute inset-0 -z-10 opacity-60" />
        <div className="absolute right-0 top-0 -z-10 h-full w-1/2 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),transparent_65%)]" />
        <div className="mx-auto grid min-h-[32rem] max-w-7xl items-center gap-10 px-6 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              Season story · {divisionName(completedResults, season)}
            </p>
            <h2 className="mt-5 font-display text-6xl font-semibold tracking-[-0.055em] sm:text-7xl">
              {seasonLabel(seasonValue)}
            </h2>
            <p className="mt-5 max-w-2xl text-xl leading-8 text-white/65">
              {completedResults.length > 0
                ? `${leagueSummaryStats.wins} league wins, ${leagueSummaryStats.goals} league goals and a campaign told match by match.`
                : "The people, shirts and records that shaped the campaign."}
            </p>
            {achievements.length > 0 && (
              <Link
                href="/honours"
                className={`mt-7 flex max-w-2xl items-start gap-4 border p-4 transition ${
                  hasRelegation
                    ? "border-rose-300/35 bg-rose-300/[0.08] hover:border-rose-300/70 hover:bg-rose-300/[0.12]"
                    : "border-amber-300/35 bg-amber-300/[0.08] hover:border-amber-300/70 hover:bg-amber-300/[0.12]"
                }`}
              >
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-[#071a2b] ${
                    hasRelegation ? "bg-rose-300" : "bg-amber-300"
                  }`}
                >
                  {hasRelegation ? (
                    <ExclamationTriangleIcon
                      className="h-6 w-6"
                      aria-hidden="true"
                    />
                  ) : (
                    <TrophyIcon className="h-6 w-6" aria-hidden="true" />
                  )}
                </span>
                <span>
                  <span
                    className={`block text-[0.65rem] font-bold uppercase tracking-[0.17em] ${
                      hasRelegation ? "text-rose-300" : "text-amber-300"
                    }`}
                  >
                    {hasRelegation ? "Relegation season" : "Honours season"}
                  </span>
                  <span className="mt-1 block font-display text-xl font-semibold text-white">
                    {achievements
                      .map((achievement) => achievement.title)
                      .join(" · ")}
                  </span>
                  <span className="mt-1 block text-xs text-white/50">
                    View the complete Rovers roll of honour
                  </span>
                </span>
                <ArrowRightIcon
                  className={`ml-auto mt-3 h-4 w-4 shrink-0 ${
                    hasRelegation ? "text-rose-300" : "text-amber-300"
                  }`}
                  aria-hidden="true"
                />
              </Link>
            )}
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#season-timeline"
                className="inline-flex items-center gap-2 bg-white px-5 py-3 text-sm font-bold text-[#071a2b] transition hover:bg-emerald-300"
              >
                Follow the timeline
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#season-archive"
                className="border border-white/30 px-5 py-3 text-sm font-bold transition hover:border-white"
              >
                Browse the archive
              </a>
            </div>
            {(managerNames || transfers.length > 0) && (
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-6 text-sm text-white/60">
                {managerNames && <span>Manager: {managerNames}</span>}
                {transfers.length > 0 && (
                  <span>{transfers.length} recorded transfers</span>
                )}
              </div>
            )}
          </div>

          <div className="relative hidden min-h-[22rem] place-items-center lg:grid">
            <div className="absolute h-72 w-72 rounded-full border border-white/10 bg-white/[0.03]" />
            {shirt ? (
              <Image
                src={shirt.url}
                alt={`${seasonLabel(seasonValue)} Tranmere shirt`}
                width={560}
                height={560}
                className="relative z-10 h-80 w-80 object-contain drop-shadow-[0_25px_30px_rgba(0,0,0,0.35)]"
              />
            ) : topScorer?.profile.picLink ? (
              <Image
                src={replaceSeasonsKit(topScorer.profile.picLink, seasonValue)}
                alt={topScorer.Player}
                width={420}
                height={420}
                unoptimized
                className="relative z-10 h-80 w-80 object-contain"
              />
            ) : (
              <CalendarDaysIcon
                aria-hidden="true"
                className="relative z-10 h-36 w-36 text-white/20"
              />
            )}
          </div>
        </div>
      </div>

      <div className="border-y border-white/15 bg-white/[0.035]">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 px-6 sm:grid-cols-4 lg:grid-cols-8 lg:px-8">
          {[
            [
              "Division",
              leagueSummary?.division ?? divisionName(completedResults, season),
            ],
            [
              "Final league position",
              leagueSummary
                ? ordinal(leagueSummary.final_league_position)
                : "—",
            ],
            ["League matches", leagueSummaryStats.matches],
            ["League wins", leagueSummaryStats.wins],
            ["League draws", leagueSummaryStats.draws],
            ["League defeats", leagueSummaryStats.defeats],
            ["League goals", leagueSummaryStats.goals],
            [
              "Average Prenton Park gate",
              averagePrentonLeagueAttendance
                ? averagePrentonLeagueAttendance.toLocaleString("en-GB")
                : "—",
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              className="border-b border-white/10 px-3 py-5 text-center last:border-r-0 sm:border-r lg:border-b-0"
            >
              <dt className="text-[0.65rem] font-bold uppercase tracking-[0.13em] text-white/45">
                {label}
              </dt>
              <dd
                className={`mt-2 font-display font-semibold ${
                  label === "Division" ? "text-base leading-tight" : "text-2xl"
                }`}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div
        id="season-journey"
        className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
              The journey
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.035em]">
              Four moments from the campaign
            </h2>
          </div>
          <span className="text-sm text-white/45">
            {storyMoments[0] ? shortDate(storyMoments[0].date) : "Start"} →{" "}
            {storyMoments.at(-1)
              ? shortDate(storyMoments.at(-1)!.date)
              : "Finish"}
          </span>
        </div>

        {storyMoments.length > 0 && (
          <ol className="relative mt-10 grid gap-8 before:absolute before:left-2 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-white/20 md:grid-cols-4 md:gap-5 md:before:left-0 md:before:right-0 md:before:top-2 md:before:h-px md:before:w-auto">
            {storyMoments.map((match, index) => (
              <li className="relative pl-9 md:pl-0 md:pt-9" key={match.date}>
                <span className="absolute left-0 top-0 h-4 w-4 rounded-full border-4 border-[#071a2b] bg-emerald-400 md:left-0" />
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/40">
                  {shortDate(match.date)}
                </p>
                <h3 className="mt-2 text-lg font-semibold">
                  {index === 0
                    ? "Opening chapter"
                    : match === biggestWin
                      ? "Biggest victory"
                      : match === highestAttendance
                        ? "The biggest crowd"
                        : "Final word"}
                </h3>
                <p className="mt-2 text-sm text-white/55">
                  {match.opposition} · {match.ft}
                </p>
                <Link
                  href={`/match/${match.season}/${match.date}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-emerald-300 hover:text-white"
                >
                  View match <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="bg-[#f4f0e8] text-[#071a2b]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="section-kicker">Defining matches</p>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.035em]">
                The days that shaped the season
              </h2>
              <div className="mt-8 divide-y divide-[#071a2b]/15 border-y border-[#071a2b]/15">
                {definingMatches.map((match, index) => (
                  <Link
                    href={`/match/${match.season}/${match.date}`}
                    key={`${match.date}-${match.opposition}`}
                    className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-6"
                  >
                    <span className="font-mono text-xs text-[#071a2b]/40">
                      0{index + 1}
                    </span>
                    <span>
                      <span className="block text-xs font-bold uppercase tracking-[0.12em] text-blue-700">
                        {shortDate(match.date)} · {match.competition}
                      </span>
                      <span className="mt-1 block font-display text-xl font-semibold">
                        {match.opposition}
                      </span>
                      <span className="mt-1 block text-sm text-[#071a2b]/55">
                        {match.venue}
                        {match.attendance
                          ? ` · ${match.attendance.toLocaleString("en-GB")} attendance`
                          : ""}
                      </span>
                    </span>
                    <span className="bg-[#071a2b] px-3 py-2 font-mono text-sm font-bold text-white transition group-hover:bg-blue-700">
                      {match.ft}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="section-kicker">The team</p>
                  <h2 className="mt-4 font-display text-3xl font-semibold">
                    Most-used XI
                  </h2>
                </div>
                <UserGroupIcon
                  aria-hidden="true"
                  className="h-8 w-8 text-blue-700"
                />
              </div>
              <div className="relative mt-8 min-h-[32rem] overflow-hidden border border-[#071a2b]/15 bg-[#d7e5d3] p-5">
                <div className="absolute inset-4 border border-[#071a2b]/20" />
                <div className="absolute left-1/2 top-4 h-[calc(100%-2rem)] w-px bg-[#071a2b]/20" />
                <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#071a2b]/20" />
                <div className="relative z-10 flex min-h-[29rem] flex-col justify-around">
                  {mostUsedXi.map((row, rowIndex) => (
                    <div
                      className="flex items-start justify-around gap-2"
                      key={rowIndex}
                    >
                      {row.map((player) => (
                        <Link
                          key={player.Player}
                          href={`/page/player/${player.Player}`}
                          className="group flex w-20 flex-col items-center text-center"
                        >
                          <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-full border-2 border-white bg-[#071a2b] text-xs font-bold text-white shadow-md transition group-hover:bg-blue-700">
                            {player.profile.picLink ? (
                              <Image
                                src={replaceSeasonsKit(
                                  player.profile.picLink,
                                  seasonValue,
                                )}
                                alt=""
                                width={80}
                                height={80}
                                unoptimized
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              playerInitials(player.Player)
                            )}
                          </span>
                          <span className="mt-1.5 text-[0.65rem] font-bold leading-tight">
                            {player.Player}
                          </span>
                          <span className="text-[0.6rem] text-[#071a2b]/50">
                            {player.profile.position ??
                              `${player.starts} starts`}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            <div className="border border-[#071a2b]/15 bg-[#fffdf8] p-6">
              <TrophyIcon
                className="h-7 w-7 text-blue-700"
                aria-hidden="true"
              />
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-[#071a2b]/45">
                Top scorer
              </p>
              <p className="mt-2 font-display text-2xl font-semibold">
                {topScorer?.Player ?? "No data"}
              </p>
              {topScorer && (
                <p className="mt-1 text-sm text-[#071a2b]/55">
                  {topScorer.goals} goals
                </p>
              )}
            </div>
            <div className="border border-[#071a2b]/15 bg-[#fffdf8] p-6">
              <MapPinIcon
                className="h-7 w-7 text-blue-700"
                aria-hidden="true"
              />
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-[#071a2b]/45">
                Biggest crowd
              </p>
              <p className="mt-2 font-display text-2xl font-semibold">
                {highestAttendance?.attendance
                  ? highestAttendance.attendance.toLocaleString("en-GB")
                  : "No data"}
              </p>
              <p className="mt-1 text-sm text-[#071a2b]/55">
                {highestAttendance?.opposition}
              </p>
            </div>
            <div className="border border-[#071a2b]/15 bg-[#fffdf8] p-6">
              <CalendarDaysIcon
                className="h-7 w-7 text-blue-700"
                aria-hidden="true"
              />
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-[#071a2b]/45">
                Season form
              </p>
              <div className="mt-4 flex flex-wrap gap-1">
                {completedResults.slice(-18).map((match) => {
                  const result = matchOutcome(match);
                  return (
                    <span
                      key={`${match.date}-${match.opposition}`}
                      className={`grid h-6 w-6 place-items-center text-[0.6rem] font-bold text-white ${outcomeClass(result, "bg-[#64748b]")}`}
                    >
                      {result}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
