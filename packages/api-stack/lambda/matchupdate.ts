import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { TranmereWebUtils, DataTables } from '@tranmere-web/lib/src/tranmere-web-utils';
import { Match } from '@tranmere-web/lib/src/tranmere-web-types';
import { DynamoDBDocument, UpdateCommand } from '@aws-sdk/lib-dynamodb';

import { DynamoDB } from '@aws-sdk/client-dynamodb';
const utils = new TranmereWebUtils();
const dynamo = DynamoDBDocument.from(
  new DynamoDB({ apiVersion: '2012-08-10' })
);

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const date = event.pathParameters!.date;
  const season = event.pathParameters!.season;
  const body = JSON.parse(event.body!) as Match;
  let attendance = 0;

  if (body.attendance) attendance = parseInt(body.attendance.toString());

  const params = new UpdateCommand({
    TableName: DataTables.RESULTS_TABLE,
    Key: {
      season: season,
      date: date
    },
    UpdateExpression:
      'set programme = :p, attendance=:a, youtube=:y, home=:h, visitor=:v, opposition=:o, pens=:x, hgoal=:f, vgoal=:g',
    ExpressionAttributeValues: {
      ':y': body.youtube,
      ':h': body.home,
      ':v': body.visitor,
      ':o': body.opposition,
      ':x': body.pens,
      ':f': body.hgoal,
      ':g': body.vgoal,
      ':a': attendance,
      ':p': body.programme
    },
    ReturnValues: 'UPDATED_NEW'
  });

  await dynamo.send(params);
  return utils.sendResponse(200, 'ok');
};
