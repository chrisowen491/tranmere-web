import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  TranmereWebUtils,
} from '@tranmere-web/lib/src/tranmere-web-utils';
import {
  Goal,
  Match,
  MatchPageData
} from '@tranmere-web/lib/src/tranmere-web-types';

const utils = new TranmereWebUtils();

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const date = event.pathParameters!.date;
  const season = parseInt(event.pathParameters!.season!);

  const match : Match = {
    date: '',
    season: '',
    hgoal: 0,
    vgoal: 0,
    tier: 0
  }

  const view: MatchPageData = match!;
  view.goals = await utils.getGoalsBySeason(season, date);
  view.apps = await utils.getAppsBySeason(season, date);
  view.formattedGoals = formatGoals(view.goals);

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
