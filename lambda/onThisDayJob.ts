import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { TranmereWebUtils, DataTables } from '../lib/tranmere-web-utils';
import { Match } from '../lib/tranmere-web-types';
const utils = new TranmereWebUtils();

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Received event:', event);

  const results: Match[] = [];

  for (const season of utils.getSeasons()) {
    const today = new Date();
    const year = today.getUTCMonth() > 5 ? season : season + 1;
    today.setFullYear(year);
    const result = await utils.getResultForDate(
      season,
      today.toISOString().slice(0, 10)
    );

    if (result && result.programme != '#N/A') {
      results.push(result);
      result.day = result.date.substr(5);
    }
  }

  if (results.length > 0) {
    const random = getRndInteger(0, results.length);
    utils.insertUpdateItem(results[random], DataTables.ON_THIS_DAY_TABLE);
  }

  return utils.sendResponse(200, results);
};

function getRndInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
