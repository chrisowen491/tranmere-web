import { v4 as uuidv4 } from 'uuid';
import { APIGatewayEvent } from 'aws-lambda';
import { TranmereWebUtils, DataTables } from '@tranmere-web/lib/src/tranmere-web-utils';
const utils = new TranmereWebUtils();
exports.handler = async (event: APIGatewayEvent) => {
  console.log('Received event:', event);

  for (let i = 1977; i <= utils.getYear(); i++) {
    const dateMap = {};
    const goals = await utils.getGoalsBySeason(i);

    for (let g = 0; g < goals.length; g++) {
      const goal = goals[g];

      if (!dateMap[goal.Date]) {
        dateMap[goal.Date] = [goal];
      } else {
        dateMap[goal.Date].push(goal);
      }
    }

    for (const key in dateMap) {
      if (Object.prototype.hasOwnProperty.call(dateMap, key)) {
        if (dateMap[key].length >= 3) {
          const playerMap = {};
          for (let g = 0; g < dateMap[key].length; g++) {
            const goal = dateMap[key][g];
            if (!playerMap[goal.Scorer]) {
              playerMap[goal.Scorer] = [goal];
            } else {
              playerMap[goal.Scorer].push(goal);
            }
          }

          for (const player in playerMap) {
            if (Object.prototype.hasOwnProperty.call(playerMap, player)) {
              if (playerMap[player].length >= 3) {
                console.log(
                  `Hat Trick Found For ${playerMap[player][0].Scorer} against ${playerMap[player][0].Opposition} on ${playerMap[player][0].Date}`
                );

                const SECONDS_IN_AN_HOUR = 60 * 60;
                const secondsSinceEpoch = Math.round(Date.now() / 1000);
                const expirationTime =
                  secondsSinceEpoch + 24 * SECONDS_IN_AN_HOUR;

                const entry = {
                  id: uuidv4(),
                  TimeToLive: expirationTime,
                  Season: playerMap[player][0].Season,
                  Player: playerMap[player][0].Scorer,
                  Date: playerMap[player][0].Date,
                  Opposition: playerMap[player][0].Opposition,
                  Goals: playerMap[player].length
                };
                await utils.insertUpdateItem(
                  entry,
                  DataTables.HAT_TRICKS_TABLE
                );
              }
            }
          }
        }
      }
    }
  }
};
