import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  TranmereWebUtils,
  ProgrammeImage
} from '@tranmere-web/lib/src/tranmere-web-utils';
import { Appearance, Goal } from '@tranmere-web/lib/src/tranmere-web-types';
import { MatchView } from '@tranmere-web/lib/src/tranmere-web-view-types';

const utils = new TranmereWebUtils();

const playerMap = {};

const re = /\/\d\d\d\d\//gm;
const re3 = /\/\d\d\d\d[A-Za-z]\//gm;
const seasonMapping = {
  '1978': 1977,
  '1984': 1983,
  '1990': 1989,
  '1992': 1991,
  '1994': 1993,
  '1996': 1995,
  '1998': 1997,
  '2001': 2000,
  '2003': 2002,
  '2005': 2004,
  '2008': 2007
};

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const date = event.pathParameters!.date;
  const season = parseInt(event.pathParameters!.season!);

  if (!playerMap['John Aldridge']) {
    const squadSearch = await utils.getAllPlayersFromDb();
    squadSearch.forEach((player) => {
      playerMap[player.name] = player;
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
  view.goalkeepers = [];
  view.fullback1 = [];
  view.fullback2 = [];
  view.defenders = [];
  view.midfielders = [];
  view.wingers1 = [];
  view.wingers2 = [];
  view.strikers = [];
  view.formattedGoals = formatGoals(view.goals);
  if (view.attendance! > 0) view.hasAttendance = true;
  if (view.venue && view.venue != 'Unknown') view.hasVenue = true;

  const noPositionList: Appearance[] = [];
  for (const app of view.apps) {
    if (playerMap[app.Name]) {
      app.bio = playerMap[app.Name];

      if (app.bio && app.bio.picLink) {
        let theSeason = season;
        if (seasonMapping[season]) theSeason = seasonMapping[season];
        app.bio.picLink = app.bio.picLink.replace(re, '/' + theSeason + '/');
        app.bio.picLink = app.bio.picLink.replace(re3, '/' + theSeason + '/');
      }
      if (app.bio) {
        if (app.bio.position == 'Goalkeeper') {
          view.goalkeepers.push(app);
        } else if (app.bio.position == 'Central Defender') {
          view.defenders.push(app);
        } else if (
          app.bio.position == 'Full Back' &&
          view.fullback1.length == 0
        ) {
          view.fullback1.push(app);
        } else if (
          app.bio.position == 'Full Back' &&
          view.fullback2.length == 0
        ) {
          view.fullback2.push(app);
        } else if (app.bio.position == 'Central Midfielder') {
          view.midfielders.push(app);
        } else if (app.bio.position == 'Winger' && view.wingers1.length == 0) {
          view.wingers1.push(app);
        } else if (app.bio.position == 'Winger' && view.wingers2.length == 0) {
          view.wingers2.push(app);
        } else if (app.bio.position == 'Striker') {
          view.strikers.push(app);
        } else {
          noPositionList.push(app);
        }
      } else {
        noPositionList.push(app);
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

  for (const position of noPositionList) {
    if (view.goalkeepers.length == 0) {
      view.goalkeepers.push(position);
    } else if (view.fullback1.length == 0) {
      view.fullback1.push(position);
    } else if (view.fullback2.length == 0) {
      view.fullback2.push(position);
    } else if (view.defenders.length < 2) {
      view.defenders.push(position);
    } else if (view.wingers1.length == 0) {
      view.wingers1.push(position);
    } else if (view.wingers2.length == 0) {
      view.wingers2.push(position);
    } else if (view.midfielders.length < 2) {
      view.midfielders.push(position);
    } else {
      view.strikers.push(position);
    }
  }

  view.defColspan = Math.floor(
    24 / (view.defenders.length + view.fullback1.length + view.fullback2.length)
  );
  view.midColspan = Math.floor(
    24 / (view.midfielders.length + view.wingers1.length + view.wingers2.length)
  );
  view.strColspan = Math.floor(24 / view.strikers.length);
  view.random = Math.ceil(Math.random() * 100000);
  view.url = `/match/${season}/${date}`;
  view.title = 'Match Summary';
  view.pageType = 'AboutPage';
  view.description = `Match Summary For ${match?.home} ${match?.ft} ${match?.visitor} - ${match?.date}`;
  view.date = date!;
  view.season = season!.toString();

  const page = utils.buildPage(view, './templates/match.mustache');

  const maxAge = season == 2021 ? 86400 : 2592000;

  return utils.sendHTMLResponse(page, maxAge);
};

function formatGoals(goals: Goal[]) {
  let output = '';
  const scorers = {};
  goals.forEach((goal) => {
    if (scorers[goal.Scorer]) {
      scorers[goal.Scorer] = scorers[goal.Scorer] + 1;
    } else {
      scorers[goal.Scorer] = 1;
    }
  });

  const keys = Object.keys(scorers);

  keys.forEach((key, index) => {
    if (scorers[key] > 1) {
      output = `${output}${key} ${scorers[key]}`;
    } else {
      output = output + key;
    }
    if (index != keys.length - 1) {
      output = `${output}, `;
    }
  });
  return output;
}
