import { v4 as uuidv4 } from 'uuid';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { TranmereWebUtils, DataTables } from '@tranmere-web/lib/src/tranmere-web-utils';
const utils = new TranmereWebUtils();

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body!);
  const item = {
    id: uuidv4(),
    name: body.name,
    season: parseInt(body.season),
    from: body.from,
    to: body.to,
    value: body.value,
    cost: parseInt(body.cost)
  };

  await utils.insertUpdateItem(item, DataTables.TRANSFER_TABLE);
  return utils.sendResponse(200, 'ok');
};
