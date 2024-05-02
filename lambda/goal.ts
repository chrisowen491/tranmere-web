import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { TranmereWebUtils } from '../lib/tranmere-web-utils';
let utils = new TranmereWebUtils();

exports.handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters!.id;
  const season = event.pathParameters!.season;

  return utils.sendResponse(200, await utils.getGoalsById(id, season));
};
