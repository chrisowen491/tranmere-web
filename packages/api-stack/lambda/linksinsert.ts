import { v4 as uuidv4 } from 'uuid';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  TranmereWebUtils,
  DataTables
} from '@tranmere-web/lib/src/tranmere-web-utils';
const utils = new TranmereWebUtils();

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body!);
  const item = {
    id: uuidv4(),
    name: body.name,
    link: body.link,
    description: body.description
  };

  await utils.insertUpdateItem(item, DataTables.LINKS_TABLE);
  return utils.sendResponse(200, 'ok');
};
