import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ProgrammeCollectionControl } from "@/components/apps/ProgrammeCollectionControl";
import { MatchAttendanceControl } from "@/components/apps/MatchAttendanceControl";
import { auth0 } from "@/lib/auth0";
import { getCollectionEntry } from "@/lib/programmeCollections";
import { getMatchAttendance } from "@/lib/matchAttendance";
import { MatchParams } from "@/lib/types";
import type {
  Appearance,
  Goal,
  MatchPageData,
} from "@tranmere-web/lib/src/tranmere-web-types";
import { GetYear } from "@tranmere-web/lib/src/apiFunctions";
import { queryAppRows, queryGoalRows } from "@tranmere-web/lib/src/d1-queries";
import MatchReport from "@/components/apps/MatchReport";
import { GetCommentsByUrl } from "@/lib/comments";
import { notFound } from "next/navigation";
import { enrichMatchPlayers } from "@/lib/matchPlayers";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl, breadcrumbJsonLd, JsonLd } from "@/components/seo/JsonLd";
import { getManagerAtDate } from "@/lib/managers";
import { getMatchMilestones } from "@/lib/matchMilestones";
import {
  getGameBySeasonAndDate,
  getMatchReport,
  searchGames,
} from "@/lib/games";

function mapAppearance(row: {
  id: string;
  season: number;
  match_date: string;
  player_name: string;
  competition: string | null;
  opposition: string;
  shirt_number: number | null;
  yellow_card: number;
  red_card: number;
  substitute_time: string | null;
  substituted_by: string | null;
  substitute_yellow_card: number;
  substitute_red_card: number;
}): Appearance {
  return {
    id: row.id,
    Date: row.match_date,
    Opposition: row.opposition,
    Competition: row.competition ?? "",
    Season: String(row.season),
    Name: row.player_name,
    Number: row.shirt_number?.toString(),
    SubbedBy: row.substituted_by,
    SubTime: row.substitute_time,
    YellowCard: row.yellow_card ? "TRUE" : null,
    RedCard: row.red_card ? "TRUE" : null,
    SubYellow: row.substitute_yellow_card ? "TRUE" : null,
    SubRed: row.substitute_red_card ? "TRUE" : null,
    Type: "Start",
  };
}

function mapGoal(row: {
  id: string;
  season: number;
  match_date: string;
  scorer: string;
  opposition: string;
  goal_type: string | null;
  minute: string | null;
  assist: string | null;
  assist_type: string | null;
}): Goal {
  return {
    id: row.id,
    Date: row.match_date,
    GoalType: row.goal_type ?? undefined,
    Minute: row.minute ?? undefined,
    Opposition: row.opposition,
    Scorer: row.scorer,
    Assist: row.assist ?? undefined,
    AssistType: row.assist_type ?? undefined,
    Season: String(row.season),
  };
}

function formatGoals(goals: Goal[]) {
  const scorers = new Map<string, number>();
  for (const goal of goals) {
    scorers.set(goal.Scorer, (scorers.get(goal.Scorer) ?? 0) + 1);
  }
  return [...scorers]
    .map(([scorer, total]) => (total === 1 ? scorer : `${scorer} (${total})`))
    .join(", ");
}

export async function generateMetadata(props: { params: MatchParams }) {
  const params = await props.params;
  const env = getCloudflareContext().env;
  const match = await getGameBySeasonAndDate(
    env.DB,
    params.season,
    params.date,
  );
  if (!match) notFound();
  return pageMetadata({
    title: `${match.home} ${match.ft} ${match.visitor}`,
    description: `${match.competition ?? "Football"} match report: ${match.home} ${match.ft} ${match.visitor}, played on ${match.date}.`,
    pathname: `/match/${params.season}/${params.date}`,
  });
}

export default async function MatchPage(props: { params: MatchParams }) {
  const params = await props.params;
  const env = (await getCloudflareContext({ async: true })).env;
  const baseUrl = `/match/${params.season}/${params.date}`;
  const [game, reportRow, appRows, goalRows, session] = await Promise.all([
    getGameBySeasonAndDate(env.DB, params.season, params.date),
    getMatchReport(env.DB, params.date),
    queryAppRows(env.DB, {
      season: Number(params.season),
      matchDate: params.date,
    }),
    queryGoalRows(env.DB, {
      season: Number(params.season),
      matchDate: params.date,
    }),
    auth0.getSession(),
  ]);
  if (!game) notFound();
  const gameId = game.id;
  if (!gameId) notFound();
  const apps = appRows.map(mapAppearance);
  const goals = goalRows.map(mapGoal);
  const matchData: MatchPageData = {
    ...game,
    homeTeam: game.home,
    awayTeam: game.visitor,
    score: game.ft ?? `${game.hgoal}-${game.vgoal}`,
    report: reportRow
      ? { day: reportRow.match_date, report: reportRow.report }
      : null,
    apps,
    goals,
    formattedGoals: formatGoals(goals),
    substitutes: apps
      .filter((appearance) => appearance.SubbedBy)
      .map((appearance) => `${appearance.SubbedBy} for ${appearance.Name}`),
  };
  const [match, manager] = await Promise.all([
    enrichMatchPlayers(env.DB, matchData),
    getManagerAtDate(env.DB, matchData.date),
  ]);

  const [matches, milestones, opponentMatches] = await Promise.all([
    searchGames(env.DB, { season: Number(match.season) }),
    getMatchMilestones(env.DB, {
      season: Number(match.season),
      matchDate: match.date,
      apps: appRows,
      goals: goalRows,
      manager,
      includeFinalAppearances: Number(match.season) !== GetYear(),
    }),
    searchGames(env.DB, {
      opposition: match.opposition,
      dateTo: match.date,
      sort: "date-desc",
      limit: 2,
    }),
  ]);

  const next = matches.results.filter((m) => m.date > match.date).slice(0, 5);
  const previousMatches = matches.results.filter((m) => m.date < match.date);
  const previous = previousMatches.slice(
    Math.max(previousMatches.length - 5, 0),
  );
  const lastMeeting = opponentMatches.results.find(
    (opponentMatch) => opponentMatch.date < match.date,
  );

  const comments = await GetCommentsByUrl(env, baseUrl);
  const [collectionEntry, attendanceEntry] = session
    ? await Promise.all([
        game.noProgrammeIssued
          ? Promise.resolve(null)
          : getCollectionEntry(env.DB, session.user.sub, gameId),
        getMatchAttendance(env.DB, session.user.sub, gameId),
      ])
    : [null, null];
  let score = 0;
  comments.forEach((c) => {
    score = score + c.rating;
  });

  const avg = Math.round(score / comments.length);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SportsEvent",
          name: `${match.homeTeam} ${match.score} ${match.awayTeam}`,
          url: absoluteUrl(baseUrl),
          startDate: match.date,
          eventStatus: "https://schema.org/EventScheduled",
          competitor: [
            { "@type": "SportsTeam", name: match.homeTeam },
            { "@type": "SportsTeam", name: match.awayTeam },
          ],
          location: match.venue
            ? { "@type": "Place", name: match.venue }
            : undefined,
          description: `${match.competition ?? "Football"} match: ${match.homeTeam} ${match.score} ${match.awayTeam}.`,
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", pathname: "/" },
          { name: "Results", pathname: "/results" },
          {
            name: `${match.season}/${Number(match.season) + 1}`,
            pathname: `/season/${match.season}`,
          },
          {
            name: `${match.homeTeam} ${match.score} ${match.awayTeam}`,
            pathname: baseUrl,
          },
        ])}
      />
      <MatchReport
        match={match}
        next={next}
        previous={previous}
        lastMeeting={lastMeeting}
        comments={comments}
        url={baseUrl}
        avg={avg}
        manager={manager}
        milestones={milestones}
      ></MatchReport>
      <section className="mx-auto max-w-7xl px-6 pb-8 sm:px-10 lg:px-12">
        {session ? (
          <MatchAttendanceControl
            gameId={gameId}
            initialAttended={Boolean(attendanceEntry)}
          />
        ) : (
          <div className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 text-sm font-semibold text-[#071a2b]">
            <a
              href={`/auth/login?returnTo=${encodeURIComponent(baseUrl)}`}
              className="text-blue-700"
            >
              Log in
            </a>{" "}
            to record this match in your private Rovers passport.
          </div>
        )}
      </section>
      {!game.noProgrammeIssued && (
        <section className="mx-auto max-w-7xl px-6 pb-24 sm:px-10 lg:px-12">
          {session ? (
            <ProgrammeCollectionControl
              gameId={gameId}
              initialEntry={collectionEntry}
            />
          ) : (
            <div className="border border-[#071a2b]/15 bg-[#fffdf8] p-6 text-sm font-semibold text-[#071a2b]">
              <a
                href={`/auth/login?returnTo=${encodeURIComponent(baseUrl)}`}
                className="text-blue-700"
              >
                Log in
              </a>{" "}
              to add this programme to your collection.
            </div>
          )}
        </section>
      )}
    </>
  );
}
