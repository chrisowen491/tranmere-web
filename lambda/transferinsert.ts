import { v4 as uuidv4 } from 'uuid';
import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { TranmereWebUtils, DataTables } from '../lib/tranmere-web-utils';
let utils = new TranmereWebUtils();

exports.handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body!);
  var item = {
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
