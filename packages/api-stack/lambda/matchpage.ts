import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  TranmereWebUtils,
  ProgrammeImage
} from '@tranmere-web/lib/src/tranmere-web-utils';
import {
  Appearance,
  Goal,
  Player,
  MatchPageData
} from '@tranmere-web/lib/src/tranmere-web-types';

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

  if (!match) {
    console.log('Match not found: ' + date);
    return utils.sendResponse(404, { message: 'Match not found' });
  }

  const report = await utils.getReportForDate(date!);

  const view: MatchPageData = match!;
  view.report = report;
  view.goals = await utils.getGoalsBySeason(season, date);
  view.apps = await utils.getAppsBySeason(season, date);
  view.homeTeam = view.home;
  view.awayTeam = view.visitor;
  view.score = view.ft;

  if (view.programme && view.programme != '#N/A') {
    const largeBody = new ProgrammeImage(view.programme);
    view.programme = largeBody.imagestring();
  } else {
    delete view.programme;
  }
  if (view.ticket && view.ticket != '#N/A') {
    const largeBody = new ProgrammeImage(view.ticket);
    view.ticket = largeBody.imagestring();
  } else {
    delete view.ticket;
  }
  view.formattedGoals = formatGoals(view.goals);

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

  view.substitutes = view.apps
    .filter((a) => a.SubbedBy)
    .map((s) => s.SubbedBy + ' for ' + s.Name);

  return utils.sendResponse(200, view);
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

  scorers.forEach((value, key) => {
    if (value === 1) {
      output += key + ', ';
    } else {
      output += key + ' (' + value + '), ';
    }
  });

  output = output.slice(0, -2);
  return output;
}
