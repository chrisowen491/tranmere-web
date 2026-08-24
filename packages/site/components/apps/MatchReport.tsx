"use client";

import Link from "next/link";
import Image from "next/image";
import { Match } from "@tranmere-web/lib/src/tranmere-web-types";
import { ResultTable } from "@/components/apps/partials/ResultTable";
import CommentPanel from "@/components/comments/CommentPanel";
import type { Comment } from "@/lib/comments";
import { Reviews } from "@/components/comments/Reviews";
import { BreadcrumbLinks } from "@/components/fragments/BreadcrumbLinks";
import { ArrowPathIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { replaceSeasonsKit } from "@tranmere-web/lib/src/apiFunctions";
import { AttendanceCorrectionForm } from "./AttendanceCorrectionForm";
import { FormationCorrectionForm } from "./FormationCorrectionForm";
import { KitCorrectionForm } from "./KitCorrectionForm";
import { GoalCorrectionForm } from "./GoalCorrectionForm";
import { AppearanceCorrectionForm } from "./AppearanceCorrectionForm";
import { GoalSubmissionForm } from "./GoalSubmissionForm";
import { MissingAppearanceCorrectionForm } from "./MissingAppearanceCorrectionForm";
import { kitLabel } from "@/lib/kitCorrections";
import type { MatchPageView } from "@/lib/matchPlayers";
import type { ManagerRecord } from "@/lib/managers";
import { arrangeMatchLineup, formationLabel } from "@/lib/matchLineup";
import type { MatchMilestone } from "@/lib/matchMilestones";
import { ManagerFormation } from "@tranmere-web/lib/src/manager-constants";
import { matchOutcome, outcomeClass } from "@/lib/seasonMatchUtils";
import type { MatchLink } from "@/lib/matchLinks";
import { MatchLinkSuggestionForm } from "./MatchLinkSuggestionForm";

function playerAvatar(picLink: string, season: number, kit?: string) {
  return replaceSeasonsKit(picLink, kit || season.toString());
}

function goalMinuteValue(minute?: string) {
  const value = Number.parseInt(minute ?? "", 10);
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
}

function goalMinuteLabel(minute?: string) {
  if (!minute) return "—";
  return minute.endsWith("'") ? minute : `${minute}'`;
}

function expectedRoversGoals(
  score?: string,
  homeTeam?: string,
  awayTeam?: string,
) {
  const goals = score?.match(/(\d+)\s*-\s*(\d+)/);
  if (!goals) return null;
  if (homeTeam === "Tranmere Rovers") return Number(goals[1]);
  if (awayTeam === "Tranmere Rovers") return Number(goals[2]);
  return null;
}

function penaltyOutcome(pens?: string, homeTeam?: string, awayTeam?: string) {
  if (!pens) return null;

  const winner = pens.match(/^(.+?)\s+win(?:s)?\b/i)?.[1]?.toLowerCase();
  const tranmereWon = winner?.includes("tranmere");
  const tranmerePlayed = [homeTeam, awayTeam].some((team) =>
    team?.toLowerCase().includes("tranmere"),
  );

  if (winner && tranmerePlayed) {
    return {
      label: tranmereWon ? "Won on penalties" : "Lost on penalties",
      detail: pens,
      won: tranmereWon,
    };
  }

  return { label: "Penalty shootout", detail: pens, won: false };
}

export default function MatchReport(props: {
  match: MatchPageView;
  next: Match[];
  previous: Match[];
  lastMeeting?: Match;
  comments: Comment[];
  url: string;
  avg: number;
  manager: ManagerRecord | null;
  milestones: MatchMilestone[];
  matchLinks: MatchLink[];
}) {
  const { match } = props;
  const penalty = penaltyOutcome(match.pens, match.homeTeam, match.awayTeam);
  const players = match.apps ?? [];
  let formation: ManagerFormation | undefined = "442";
  if (match.formation && (match.formation as ManagerFormation) != null) {
    formation = match.formation as ManagerFormation;
  } else if (props.manager?.favouriteFormation) {
    formation = props.manager?.favouriteFormation;
  }

  const lineup = arrangeMatchLineup(players, formation);
  const goals = [...(match.goals ?? [])].sort(
    (left, right) =>
      goalMinuteValue(left.Minute) - goalMinuteValue(right.Minute),
  );
  const expectedGoalTotal = expectedRoversGoals(
    match.score,
    match.homeTeam,
    match.awayTeam,
  );
  const matchPlayerNames = [
    ...new Set(
      players
        .flatMap((player) => [player.Name, player.SubbedBy, player.SubSubbedBy])
        .filter(Boolean),
    ),
  ] as string[];

  const breadcrumbs = [
    { id: 1, name: "Home", href: "/" },
    {
      id: 2,
      name: match.season.toString(),
      href: `/season/${match.season}`,
    },
  ];

  return (
    <main className="pb-24 text-[#071a2b]">
      <div className="border-b border-[#071a2b]/10 pt-6">
        <BreadcrumbLinks
          breadcrumbs={breadcrumbs}
          currentpage={match.date}
          currenthref={`/match/${match.season}/${match.date}`}
        />

        <section className="mx-auto grid max-w-7xl gap-0 px-6 pb-14 pt-8 sm:px-10 lg:grid-cols-[minmax(340px,0.8fr)_minmax(0,1.2fr)] lg:px-12 lg:pt-12">
          <div className="relative min-h-[420px] overflow-hidden bg-[#132c82] p-8 sm:min-h-[520px] sm:p-12">
            <div
              aria-hidden="true"
              className="absolute inset-5 border border-white/20"
            />
            {match.programme ? (
              <Image
                width={700}
                height={900}
                priority
                alt={`${match.homeTeam} v ${match.awayTeam} match programme`}
                src={`https://img.tranmere-web.com/${match.programme}`}
                className="relative z-10 mx-auto h-full max-h-[520px] w-full object-contain"
              />
            ) : (
              <div className="relative z-10 grid h-full place-items-center text-center text-white/60">
                <p className="font-mono text-xs uppercase tracking-[0.16em]">
                  {match.noProgrammeIssued
                    ? "No programme issued"
                    : "Programme cover not recorded"}
                </p>
              </div>
            )}
            <p className="absolute left-5 top-5 z-20 bg-[#071a2b] px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.14em] text-white">
              Match archive
            </p>
          </div>

          <div className="flex flex-col justify-center border border-[#071a2b]/15 bg-[#fffdf8] p-7 sm:p-10 lg:border-l-0 lg:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              {match.competition} · {match.date}
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              {match.homeTeam}
              <span className="my-3 block font-mono text-5xl font-bold text-blue-700 sm:text-6xl">
                {match.score}
              </span>
              {match.awayTeam}
            </h1>

            {penalty && (
              <p
                className={`mt-5 inline-flex w-fit items-center border px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] ${
                  penalty.won
                    ? "border-emerald-700/25 bg-emerald-50 text-emerald-800"
                    : "border-red-700/20 bg-red-50 text-red-800"
                }`}
              >
                {penalty.label}
                <span className="mx-2 text-current/35">·</span>
                <span className="normal-case tracking-normal">
                  {penalty.detail}
                </span>
              </p>
            )}

            <dl className="mt-8 grid grid-cols-2 border-y border-[#071a2b]/15 text-sm">
              <div className="py-5 pr-4">
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#071a2b]/50">
                  Venue
                </dt>
                <dd className="mt-2 font-semibold">{match.venue}</dd>
              </div>
              <div className="border-l border-[#071a2b]/15 py-5 pl-4">
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#071a2b]/50">
                  Attendance
                </dt>
                <dd className="mt-2 font-mono font-bold">
                  {match.attendance?.toLocaleString() || "—"}
                </dd>
                <AttendanceCorrectionForm
                  season={match.season.toString()}
                  matchDate={match.date}
                  homeTeam={match.homeTeam ?? "Tranmere Rovers"}
                  awayTeam={match.awayTeam ?? match.opposition ?? "Unknown"}
                  currentAttendance={match.attendance ?? null}
                />
              </div>
              {match.referee && (
                <div className="col-span-2 border-t border-[#071a2b]/15 py-5">
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#071a2b]/50">
                    Referee
                  </dt>
                  <dd className="mt-2 font-semibold">{match.referee}</dd>
                </div>
              )}
              <div className="col-span-2 border-t border-[#071a2b]/15 py-5">
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#071a2b]/50">
                  Rovers kit
                </dt>
                <dd className="mt-2 font-semibold">{kitLabel(match.kit)}</dd>
                <KitCorrectionForm
                  season={match.season.toString()}
                  matchDate={match.date}
                  currentKit={match.kit}
                />
              </div>
            </dl>

            {match.formattedGoals && (
              <div className="mt-7">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#071a2b]/50">
                  Rovers scorers
                </p>
                <p className="mt-2 font-display text-xl font-semibold">
                  {match.formattedGoals}
                </p>
              </div>
            )}

            <Reviews
              text="Supporter rating"
              avg={props.avg}
              count={props.comments.length}
              className="mt-7"
            />
          </div>
        </section>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12">
        {match.report && (
          <section className="mb-12 grid gap-5 border-y border-[#071a2b]/15 py-8 lg:grid-cols-[240px_minmax(0,1fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                Match report
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold">
                The story of the game
              </h2>
            </div>
            <div
              className="prose prose-lg max-w-none text-[#071a2b]/70"
              dangerouslySetInnerHTML={{ __html: match.report.report }}
            />
          </section>
        )}

        <section className="mb-12 border-y border-[#071a2b]/15 py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                Rovers goals
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold">
                How the goals were made
              </h2>
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#071a2b]/45">
              {goals.length} {goals.length === 1 ? "goal" : "goals"} recorded
            </p>
          </div>

          {goals.length > 0 && (
            <ol className="mt-6 border border-[#071a2b]/15 bg-[#071a2b]/15">
              {goals.map((goal, index) => (
                <li
                  key={goal.id ?? `${goal.Scorer}-${goal.Minute}-${index}`}
                  className="grid gap-px border-b border-[#071a2b]/15 bg-[#071a2b]/15 last:border-b-0 sm:grid-cols-[112px_minmax(0,1fr)]"
                >
                  <div className="flex items-center justify-between bg-[#071a2b] px-5 py-4 text-white sm:block sm:px-6 sm:py-6">
                    <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-blue-300">
                      Goal {index + 1}
                    </span>
                    <time className="font-mono text-3xl font-bold sm:mt-2 sm:block">
                      {goalMinuteLabel(goal.Minute)}
                    </time>
                  </div>

                  <div className="bg-[#fffdf8] px-5 py-5 sm:px-7 sm:py-6">
                    <Link
                      href={`/page/player/${goal.Scorer}`}
                      className="font-display text-2xl font-semibold hover:text-blue-700"
                    >
                      {goal.Scorer}
                    </Link>

                    {goal.Assist && (
                      <p className="mt-2 text-sm text-[#071a2b]/65">
                        Assisted by{" "}
                        <Link
                          href={`/page/player/${goal.Assist}`}
                          className="font-semibold text-blue-700 underline decoration-blue-700/25 underline-offset-4"
                        >
                          {goal.Assist}
                        </Link>
                      </p>
                    )}

                    {(goal.GoalType || goal.Foot || goal.AssistType) && (
                      <dl className="mt-5 grid gap-px border border-[#071a2b]/10 bg-[#071a2b]/10 sm:grid-cols-3">
                        {goal.GoalType && (
                          <div className="bg-[#f4f0e8] px-4 py-3">
                            <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/45">
                              Goal type
                            </dt>
                            <dd className="mt-1 text-sm font-semibold">
                              {goal.GoalType}
                            </dd>
                          </div>
                        )}
                        {goal.Foot && (
                          <div className="bg-[#f4f0e8] px-4 py-3">
                            <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/45">
                              Foot
                            </dt>
                            <dd className="mt-1 text-sm font-semibold">
                              {goal.Foot}
                            </dd>
                          </div>
                        )}
                        {goal.AssistType && (
                          <div className="bg-[#f4f0e8] px-4 py-3">
                            <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/45">
                              Assist type
                            </dt>
                            <dd className="mt-1 text-sm font-semibold">
                              {goal.AssistType}
                            </dd>
                          </div>
                        )}
                      </dl>
                    )}
                    <GoalCorrectionForm
                      goal={goal}
                      season={match.season.toString()}
                      matchDate={match.date}
                      playerNames={matchPlayerNames}
                    />
                  </div>
                </li>
              ))}
            </ol>
          )}
          {(expectedGoalTotal === null || goals.length < expectedGoalTotal) && (
            <GoalSubmissionForm
              season={match.season.toString()}
              matchDate={match.date}
              opposition={
                match.opposition ||
                (match.homeTeam === "Tranmere Rovers"
                  ? match.awayTeam
                  : match.homeTeam) ||
                "Unknown opposition"
              }
              competition={match.competition}
              playerNames={matchPlayerNames}
            />
          )}
        </section>

        {props.milestones.length > 0 && (
          <section className="mb-12 border-y border-[#071a2b]/15 bg-blue-50/45 py-8 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                  Matchday milestones
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold">
                  A day to remember
                </h2>
              </div>
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#071a2b]/45">
                {props.milestones.length} recorded
              </p>
            </div>
            <ul className="mt-6 grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 sm:grid-cols-2">
              {props.milestones.map((milestone) => (
                <li key={`${milestone.kind}-${milestone.name}`}>
                  <Link
                    href={milestone.href}
                    className="flex min-h-20 items-center gap-4 bg-[#fffdf8] px-5 py-4 transition hover:bg-white"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-700 font-mono text-xs font-bold text-white">
                      {milestone.kind === "debut"
                        ? "D"
                        : milestone.kind === "final-appearance"
                          ? "F"
                          : milestone.kind === "first-goal"
                            ? "G"
                            : milestone.kind === "appearance-landmark"
                              ? (milestone.label.match(/\d+/)?.[0] ?? "A")
                              : milestone.kind === "hat-trick"
                                ? "3"
                                : "M"}
                    </span>
                    <span className="text-sm leading-5">
                      <span className="font-semibold">{milestone.name}</span>{" "}
                      <span className="text-[#071a2b]/65">
                        {milestone.label}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {players.length > 0 && (
          <section>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                  Team sheet
                </p>
                <h2 className="mt-2 font-display text-4xl font-semibold">
                  Rovers XI
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#071a2b]/60">
                  Player positions are assigned using a best-guess algorithm
                  based on the formation and each player&apos;s preferred
                  position.
                </p>
              </div>
              <p className="font-mono text-xs text-[#071a2b]/45">
                {formationLabel(lineup.formation)}
                {props.manager ? ` · ${props.manager.name}` : ""}
              </p>
              <FormationCorrectionForm
                season={match.season.toString()}
                matchDate={match.date}
                currentFormation={match.formation}
              />
            </div>

            <div className="fantasy-pitch relative min-h-[720px] overflow-hidden border border-[#071a2b]/25 bg-blue-900 px-3 py-8 text-white sm:px-8">
              <div className="pointer-events-none absolute inset-4 border border-white/25" />
              <div className="pointer-events-none absolute inset-x-4 top-1/2 border-t border-white/25" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
              <div className="relative z-10 flex min-h-[654px] flex-col justify-between">
                {lineup.rows.map((line, lineIndex) => (
                  <div
                    key={lineIndex}
                    className="flex min-h-32 items-center justify-around gap-1"
                  >
                    {line.map((player) => (
                      <div
                        key={player.Name}
                        className="relative flex w-14 min-w-0 flex-col items-center text-center sm:w-28"
                      >
                        <Link
                          href={`/page/player/${player.Name}`}
                          aria-label={player.Name}
                          className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-full border border-white/45 bg-[#f4f0e8] transition hover:ring-4 hover:ring-blue-200/30 sm:h-24 sm:w-24"
                        >
                          <Image
                            alt=""
                            width={112}
                            height={112}
                            unoptimized
                            src={playerAvatar(
                              player.profile.picLink,
                              parseInt(match.season),
                              match.kit,
                            )}
                            className="h-full w-full object-cover"
                          />
                        </Link>
                        <Link
                          href={`/page/player/${player.Name}`}
                          className="mt-2 max-w-full truncate text-xs font-bold hover:text-blue-200"
                        >
                          {player.Name}
                        </Link>
                        <div className="mt-1 flex min-h-4 items-center justify-center gap-1">
                          {player.YellowCard && (
                            <span
                              title="Yellow card"
                              className="h-3.5 w-2.5 bg-yellow-400"
                            />
                          )}
                          {player.RedCard && (
                            <span
                              title="Red card"
                              className="h-3.5 w-2.5 bg-red-500"
                            />
                          )}
                          {player.SubbedBy && (
                            <ArrowPathIcon
                              title="Substituted"
                              className="h-4 w-4 text-blue-200"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {players.some((player) => player.SubbedBy) && (
              <div className="mt-4 border border-[#071a2b]/15 bg-[#fffdf8] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
                  Substitutions
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {players
                    .filter((player) => player.SubbedBy)
                    .map((player) => (
                      <p key={player.Name} className="text-sm">
                        <Link
                          href={`/page/player/${player.Name}`}
                          className="font-semibold hover:text-blue-700"
                        >
                          {player.Name}
                        </Link>
                        <span className="text-[#071a2b]/45"> replaced by </span>
                        <Link
                          href={`/page/player/${player.SubbedBy}`}
                          className="font-semibold hover:text-blue-700"
                        >
                          {player.SubbedBy}
                        </Link>
                        {player.SubSubbedBy && (
                          <>
                            <span className="text-[#071a2b]/45">
                              {" "}
                              then replaced by{" "}
                            </span>
                            <Link
                              href={`/page/player/${player.SubSubbedBy}`}
                              className="font-semibold hover:text-blue-700"
                            >
                              {player.SubSubbedBy}
                            </Link>
                          </>
                        )}
                        {player.SubTime && (
                          <span className="font-mono text-xs text-[#071a2b]/45">
                            {" "}
                            · {player.SubTime}
                          </span>
                        )}
                      </p>
                    ))}
                </div>
              </div>
            )}

            <details className="group mt-4 border border-[#071a2b]/15 bg-[#fffdf8]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 marker:hidden sm:p-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
                    Community archive
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-semibold">
                    Correct the team sheet
                  </h3>
                </div>
                <span
                  aria-hidden="true"
                  className="grid h-9 w-9 shrink-0 place-items-center border border-[#071a2b]/20 font-mono text-xl text-blue-700 transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="border-t border-[#071a2b]/10 px-5 pb-5 sm:px-6 sm:pb-6">
                <p className="max-w-2xl pt-5 text-sm leading-6 text-[#071a2b]/60">
                  Suggest a correction to a player, shirt number, card or
                  substitution. Every change is checked by an administrator
                  before it is published.
                </p>
                <div className="mt-5 divide-y divide-[#071a2b]/10 border-t border-[#071a2b]/10">
                  {players.map((player) => (
                    <div key={player.id} className="py-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{player.Name}</p>
                          <p className="mt-1 font-mono text-[11px] text-[#071a2b]/45">
                            {player.Number
                              ? `No. ${player.Number}`
                              : "No shirt number"}
                            {player.SubbedBy
                              ? ` · replaced by ${player.SubbedBy}${player.SubTime ? ` (${player.SubTime})` : ""}`
                              : ""}
                            {player.SubSubbedBy
                              ? ` · ${player.SubbedBy} then replaced by ${player.SubSubbedBy}`
                              : ""}
                          </p>
                        </div>
                        <AppearanceCorrectionForm
                          appearance={player}
                          season={match.season.toString()}
                          matchDate={match.date}
                          playerNames={matchPlayerNames}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {players.length < 11 && (
                  <div className="mt-5 border-t border-[#071a2b]/10 pt-5">
                    <p className="mb-4 max-w-2xl text-sm leading-6 text-[#071a2b]/60">
                      Is somebody missing from the XI? Add one player or propose
                      the remaining lineup in a single submission.
                    </p>
                    <MissingAppearanceCorrectionForm
                      season={match.season.toString()}
                      matchDate={match.date}
                    />
                  </div>
                )}
              </div>
            </details>
          </section>
        )}

        {players.length === 0 && (
          <section className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Team sheet
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              Rovers XI not yet recorded
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#071a2b]/60">
              Help complete this match by submitting any starters, shirt
              numbers, substitutions or cards that are missing. Every entry is
              reviewed before publication.
            </p>
            <div className="mt-6 border-t border-[#071a2b]/10 pt-6">
              <MissingAppearanceCorrectionForm
                season={match.season.toString()}
                matchDate={match.date}
                emptyLineup
              />
            </div>
          </section>
        )}

        <section className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Related links
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            Elsewhere on this matchday
          </h2>
          {props.matchLinks.length > 0 ? (
            <div className="mt-6 grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 sm:grid-cols-2">
              {props.matchLinks.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#fffdf8] px-4 py-4 text-sm font-bold transition hover:bg-[#e8e2d6] hover:text-blue-700"
                >
                  <span className="block">{item.label} ↗</span>
                  <span className="mt-1 block font-mono text-[10px] uppercase tracking-[.12em] text-[#071a2b]/50">
                    {item.publisher || item.linkType}
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[#071a2b]/60">
              No external links have been added yet.
            </p>
          )}
          <div className="mt-6 border-t border-[#071a2b]/15 pt-5">
            <MatchLinkSuggestionForm
              season={match.season.toString()}
              matchDate={match.date}
            />
          </div>
        </section>

        <section className="mt-12 grid gap-8 border-t border-[#071a2b]/15 pt-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              Supporter verdict
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold">
              Comments &amp; ratings
            </h2>
            <CommentPanel comments={props.comments} url={props.url} />
          </div>
          {match.ticket && (
            <aside className="border border-[#071a2b]/15 bg-[#fffdf8] p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
                Match ticket
              </p>
              <Image
                width={500}
                height={500}
                alt={`${match.homeTeam} v ${match.awayTeam} match ticket`}
                src={`https://img.tranmere-web.com/${match.ticket}`}
                className="w-full object-contain"
              />
            </aside>
          )}
        </section>

        {props.lastMeeting &&
          (() => {
            const lastMeeting = props.lastMeeting;
            const outcome = matchOutcome(lastMeeting);
            const opposition = lastMeeting.opposition ?? "the opposition";
            return (
              <section className="mt-12 border-y border-[#071a2b]/15 py-8">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                      Fixture history
                    </p>
                    <h2 className="mt-2 font-display text-3xl font-semibold">
                      Last time we met
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-[#071a2b]/60">
                      The previous Rovers meeting with {opposition}.
                    </p>
                  </div>
                  <Link
                    href={`/games/${encodeURIComponent(opposition)}`}
                    className="inline-flex w-fit items-center gap-2 border border-[#071a2b]/20 bg-[#fffdf8] px-4 py-3 text-sm font-bold transition hover:border-blue-700 hover:text-blue-700"
                  >
                    Complete head-to-head
                    <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
                <Link
                  href={`/match/${lastMeeting.season}/${lastMeeting.date}`}
                  className="group mt-7 grid gap-px border border-[#071a2b]/15 bg-[#071a2b]/15 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
                >
                  <span
                    className={`grid min-h-20 min-w-20 place-items-center px-5 font-mono text-xl font-bold text-white ${outcomeClass(outcome, "bg-amber-500")}`}
                  >
                    {outcome}
                  </span>
                  <span className="bg-[#fffdf8] px-5 py-4 transition group-hover:bg-blue-50/70">
                    <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#071a2b]/45">
                      {lastMeeting.competition} · {lastMeeting.date} ·{" "}
                      {lastMeeting.location === "H"
                        ? "Prenton Park"
                        : lastMeeting.location === "N"
                          ? "Neutral venue"
                          : "Away"}
                    </span>
                    <span className="mt-2 block font-display text-2xl font-semibold">
                      {lastMeeting.home}{" "}
                      <span className="font-mono text-blue-700">
                        {lastMeeting.ft}
                      </span>{" "}
                      {lastMeeting.visitor}
                    </span>
                  </span>
                  <span className="hidden bg-[#fffdf8] px-5 py-4 text-right text-sm font-bold text-blue-700 sm:flex sm:items-center">
                    Open match report
                  </span>
                </Link>
              </section>
            );
          })()}

        {props.previous.length > 0 && (
          <ResultTable title="Previous 5 Matches" results={props.previous} />
        )}
        {props.next.length > 0 && (
          <ResultTable title="Next 5 Matches" results={props.next} />
        )}
      </div>
    </main>
  );
}
