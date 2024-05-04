import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { TranmereWebUtils } from '../lib/tranmere-web-utils';
const utils = new TranmereWebUtils();

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters!.id;
  const season = event.pathParameters!.season;

  return utils.sendResponse(200, await utils.getGoalsById(id, season));
};
