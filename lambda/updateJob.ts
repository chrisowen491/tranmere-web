import { TranmereWebUtils, DataTables } from '../lib/tranmere-web-utils';
const utils = new TranmereWebUtils();

exports.handler = async () => {
  const playerTotalsHash = {};

  for (let i = 1977; i <= utils.getYear(); i++) {
    const playerHash = {};

    const apps = await utils.getAppsBySeason(i);
    const goals = await utils.getGoalsBySeason(i);

    for (let a = 0; a < apps.length; a++) {
      const app = apps[a];
      if (!playerHash[app.Name]) {
        playerHash[app.Name] = buildNewPlayer(i, app.Name);
      }
      playerHash[app.Name].starts++;
      playerHash[app.Name].Apps++;

      if (app.YellowCard) playerHash[app.Name].yellow++;
      if (app.RedCard) playerHash[app.Name].red++;

      if (app.SubbedBy) {
        if (!playerHash[app.SubbedBy]) {
          playerHash[app.SubbedBy] = buildNewPlayer(i, app.SubbedBy);
        }
        playerHash[app.SubbedBy].subs++;
        playerHash[app.SubbedBy].Apps++;

        if (app.SubYellow) playerHash[app.SubbedBy].yellow++;
        if (app.SubRed) playerHash[app.SubbedBy].red++;
      }
    }
    for (let g = 0; g < goals.length; g++) {
      const goal = goals[g];
      if (!playerHash[goal.Scorer]) {
        playerHash[goal.Scorer] = buildNewPlayer(i, goal.Scorer);
      }
      playerHash[goal.Scorer].goals++;
      if (goal.GoalType == 'Header') {
        playerHash[goal.Scorer].headers++;
      } else if (goal.GoalType == 'FreeKick') {
        playerHash[goal.Scorer].freekicks++;
      } else if (goal.GoalType == 'Penalty') {
        playerHash[goal.Scorer].penalties++;
      }
      if (goal.Assist) {
        if (!playerHash[goal.Assist]) {
          playerHash[goal.Assist] = buildNewPlayer(i, goal.Assist);
        }
        playerHash[goal.Assist].assists++;
      }
    }

    for (const key in playerHash) {
      if (Object.prototype.hasOwnProperty.call(playerHash, key)) {
        if (key != '')
          await utils.insertUpdateItem(
            playerHash[key],
            DataTables.SUMMARY_TABLE_NAME
          );

        console.log('Updated DB for ' + key + ' during season ' + i);
        if (!playerTotalsHash[key]) {
          playerTotalsHash[key] = buildNewPlayer('TOTAL', key);
        }
        playerTotalsHash[key].Apps =
          playerTotalsHash[key].Apps + playerHash[key].Apps;
        playerTotalsHash[key].starts =
          playerTotalsHash[key].starts + playerHash[key].starts;
        playerTotalsHash[key].subs =
          playerTotalsHash[key].subs + playerHash[key].subs;
        playerTotalsHash[key].goals =
          playerTotalsHash[key].goals + playerHash[key].goals;
        playerTotalsHash[key].assists =
          playerTotalsHash[key].assists + playerHash[key].assists;
        playerTotalsHash[key].headers =
          playerTotalsHash[key].headers + playerHash[key].headers;
        playerTotalsHash[key].freekicks =
          playerTotalsHash[key].freekicks + playerHash[key].freekicks;
        playerTotalsHash[key].penalties =
          playerTotalsHash[key].penalties + playerHash[key].penalties;
        playerTotalsHash[key].yellow =
          playerTotalsHash[key].yellow + playerHash[key].yellow;
        playerTotalsHash[key].red =
          playerTotalsHash[key].red + playerHash[key].red;
      }
    }
  }

  for (const key in playerTotalsHash) {
    if (Object.prototype.hasOwnProperty.call(playerTotalsHash, key)) {
      if (key != '')
        await utils.insertUpdateItem(
          playerTotalsHash[key],
          DataTables.SUMMARY_TABLE_NAME
        );
    }
  }
};

function buildNewPlayer(season, name) {
  const SECONDS_IN_AN_HOUR = 60 * 60;
  const secondsSinceEpoch = Math.round(Date.now() / 1000);
  const expirationTime = secondsSinceEpoch + 24 * SECONDS_IN_AN_HOUR;

  return {
    Season: season.toString(),
    Player: name,
    TimeToLive: expirationTime,
    Apps: 0,
    starts: 0,
    subs: 0,
    goals: 0,
    assists: 0,
    headers: 0,
    freekicks: 0,
    penalties: 0,
    yellow: 0,
    red: 0
  };
}
