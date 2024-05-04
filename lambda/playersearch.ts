/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { TranmereWebUtils, DataTables } from '../lib/tranmere-web-utils';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
const utils = new TranmereWebUtils();
const dynamo = DynamoDBDocument.from(
  new DynamoDB({ apiVersion: '2012-08-10' })
);

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const squadSearch = await dynamo.scan({
    TableName: DataTables.PLAYER_TABLE_NAME
  });
  const playerHash: any = {};
  for (const member of squadSearch.Items!) {
    playerHash[member.name] = member;
  }

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
    result.bio = playerHash[result.Player];
    if (result.bio && result.bio.picLink) {
      result.bio.pic = {
        fields: {
          file: {
            url: result.bio.picLink
          }
        }
      };
    }
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

  return utils.sendResponse(200, { players: results.slice(0, 50) });
};
