import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  TranmereWebUtils,
  ProgrammeImage
} from '@tranmere-web/lib/src/tranmere-web-utils';
import {
  Appearance,
  Goal,
  Player
} from '@tranmere-web/lib/src/tranmere-web-types';
import { MatchView } from '@tranmere-web/lib/src/tranmere-web-view-types';

const utils = new TranmereWebUtils();

const playerMap = new Map<string, Player>();

const re = /\/\d\d\d\d\//gm;
const re3 = /\/\d\d\d\d[A-Za-z]\//gm;
const seasonMapping = new Map<number, number>();
seasonMapping.set(1978, 1977);
seasonMapping.set(1984, 1983);
seasonMapping.set(1990, 1989);
seasonMapping.set(1992, 1991);
seasonMapping.set(1994, 1993);
seasonMapping.set(1996, 1995);
seasonMapping.set(1998, 1997);
seasonMapping.set(2001, 2000);
seasonMapping.set(2003, 2002);
seasonMapping.set(2005, 2004);
seasonMapping.set(2008, 2007);

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const date = event.pathParameters!.date;
  const season = parseInt(event.pathParameters!.season!);

  if (!playerMap.get('John Aldridge')) {
    const squadSearch = await utils.getAllPlayersFromDb();
    squadSearch.forEach((player) => {
      playerMap.set(player.name, player);
    });
  }

  const match = await utils.getResultForDate(season, date!);
  const report = await utils.getReportForDate(date!);

  const view: MatchView = match!;
  view.report = report;
  view.goals = await utils.getGoalsBySeason(season, date);
  view.apps = await utils.getAppsBySeason(season, date);
  if (view.programme && view.programme != '#N/A') {
    const largeBody = new ProgrammeImage(view.programme);
    view.largeProgramme = largeBody.imagestring();
  } else {
    delete view.programme;
  }
  view.formattedGoals = formatGoals(view.goals);
  if (view.attendance! > 0) view.hasAttendance = true;
  if (view.venue && view.venue != 'Unknown') view.hasVenue = true;

  const noPositionList: Appearance[] = [];
  for (const app of view.apps) {
    if (playerMap.get(app.Name)) {
      app.bio = playerMap.get(app.Name);

      if (app.bio && app.bio.picLink) {
        let theSeason = season;
        if (seasonMapping.get(season)) theSeason = seasonMapping.get(season)!;
        app.bio.picLink = app.bio.picLink.replace(re, '/' + theSeason + '/');
        app.bio.picLink = app.bio.picLink.replace(re3, '/' + theSeason + '/');
      }
    } else {
      app.bio = {
        name: app.Name,
        picLink:
          'https://images.ctfassets.net/pz711f8blqyy/1GOdp93iMC7T3l9L9UUqaM/0ea20a8950cdfb6f0239788f93747d74/blank.svg'
      };
      noPositionList.push(app);
    }
  }

  view.random = Math.ceil(Math.random() * 100000);
  view.url = `/match/${season}/${date}`;
  view.title = 'Match Summary';
  view.pageType = 'AboutPage';
  view.description = `Match Summary For ${match?.home} ${match?.ft} ${match?.visitor} - ${match?.date}`;
  view.date = date!;
  view.season = season!.toString();

  return utils.sendResponse(200, {
    season: view.season,
    score: view.ft,
    date: view.date,
    attendance: view.attendance,
    referee: view.referee,
    competition: view.competition,
    pens: view.pens,
    homeTeam: view.home,
    awayTeam: view.visitor,
    programme: view.largeProgramme,
    venue: view.venue,
    //fullGoals: view.goals,
    apps: view.apps ? view.apps : [],
    formattedGoals: view.formattedGoals,
    report: view.report ? view.report.report : null,
    team: view.apps.map((a) => a.Name),
    goals: view.goals.map((g) => g.Scorer),
    substitutes: view.apps
      .filter((a) => a.SubbedBy)
      .map((s) => s.SubbedBy + ' for ' + s.Name)
  });
};

function formatGoals(goals: Goal[]) {
  let output = '';
  const scorers = new Map<string, number>();
  goals.forEach((goal) => {
    if (scorers.get(goal.Scorer)) {
      scorers.set(goal.Scorer, scorers.get(goal.Scorer)! + 1);
    } else {
      scorers.set(goal.Scorer, 1);
    }
  });

  const keys = Object.keys(scorers);

  keys.forEach((key, index) => {
    if (scorers.get(key)! > 1) {
      output = `${output}${key} ${scorers.get(key)}`;
    } else {
      output = output + key;
    }
    if (index != keys.length - 1) {
      output = `${output}, `;
    }
  });
  return output;
}
