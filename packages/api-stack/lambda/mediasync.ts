import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { TranmereWebUtils } from '@tranmere-web/lib/src/tranmere-web-utils';
import { createClient } from 'contentful';
const utils = new TranmereWebUtils();

const client = createClient({
  space: process.env.CF_SPACE!,
  accessToken: process.env.CF_KEY!
});

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Received event:', event);
  console.log(event.pathParameters!.type);

  if (event.body) {
    const body = JSON.parse(event.body);

    if (body.sys.type === 'Entry') {
      const content = await client.getEntry(body.sys.id);
      const item = content.fields;
      item.id = body.sys.id;
      await utils.insertUpdateItem(item, event.pathParameters!.type!);
    } else if (body.sys.type === 'DeletedEntry') {
      await utils.deleteItem(body.sys.id, event.pathParameters!.type!);
    }
  }
  return utils.sendResponse(200, 'ok');
};
