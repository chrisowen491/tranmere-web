/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  TranmereWebUtils,
  DataTables
} from '@tranmere-web/lib/src/tranmere-web-utils';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
const utils = new TranmereWebUtils();
const dynamo = DynamoDBDocument.from(
  new DynamoDB({ apiVersion: '2012-08-10' })
);

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  let season = event.queryStringParameters
    ? event.queryStringParameters.season
    : null;
  const sort = event.queryStringParameters
    ? event.queryStringParameters.sort
    : null;
  const player = event.queryStringParameters
    ? event.queryStringParameters.player
    : null;
  const filter = event.queryStringParameters
    ? event.queryStringParameters.filter
    : null;
  const limitParameter = event.queryStringParameters?.limit;
  const requestedLimit = limitParameter ? Number(limitParameter) : Number.NaN;
  const limit = Number.isInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 1000)
    : 50;

  if (!season) season = 'TOTAL';

  const query = player
    ? {
        TableName: DataTables.SUMMARY_TABLE_NAME,
        IndexName: 'ByPlayerIndex',
        KeyConditionExpression: 'Player = :player',
        ExpressionAttributeValues: {
          ':player': player
        }
      }
    : {
        TableName: DataTables.SUMMARY_TABLE_NAME,
        KeyConditionExpression: 'Season = :season',
        ExpressionAttributeValues: {
          ':season': season
        }
      };

  const result = await dynamo.query(query);
  let results = result.Items!;

  for (const result of results) {
    delete result.TimeToLive;
  }

  if (filter) {
    const newResults: any[] = [];
    for (const match of results) {
      if (filter == 'OnlyOneApp' && match.Apps == 1) {
        newResults.push(match);
      }
      if (filter == 'GK' && match.bio && match.bio.position == 'Goalkeeper') {
        newResults.push(match);
      }
      if (filter == 'STR' && match.bio && match.bio.position == 'Striker') {
        newResults.push(match);
      }
      if (
        filter == 'CM' &&
        match.bio &&
        match.bio.position == 'Central Midfielder'
      ) {
        newResults.push(match);
      }
      if (filter == 'WIN' && match.bio && match.bio.position == 'Winger') {
        newResults.push(match);
      }
      if (filter == 'FB' && match.bio && match.bio.position == 'Full Back') {
        newResults.push(match);
      }
      if (
        filter == 'CD' &&
        match.bio &&
        match.bio.position == 'Central Defender'
      ) {
        newResults.push(match);
      }
    }
    results = newResults;
  }

  if (sort == 'Goals') {
    results.sort(function (a, b) {
      if (a.goals < b.goals) return 1;
      if (a.goals > b.goals) return -1;
      return 0;
    });
  } else {
    results.sort(function (a, b) {
      if (a.Apps < b.Apps) return 1;
      if (a.Apps > b.Apps) return -1;
      return 0;
    });
  }

  return utils.sendResponse(200, { players: results.slice(0, limit) });
};
