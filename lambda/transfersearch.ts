/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { TranmereWebUtils, DataTables } from '../lib/tranmere-web-utils';
import { DynamoDBDocument, QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
const utils = new TranmereWebUtils();
const dynamo = DynamoDBDocument.from(
  new DynamoDB({ apiVersion: '2012-08-10' })
);

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const season = event.queryStringParameters
    ? event.queryStringParameters.season
    : null;
  const filter = event.queryStringParameters
    ? event.queryStringParameters.filter
    : null;
  const club = event.queryStringParameters
    ? event.queryStringParameters.club
    : null;

  const query: QueryCommandInput = {
    TableName: DataTables.TRANSFER_TABLE,
    IndexName: 'ByValueIndex',
    ScanIndexForward: false,
    ExpressionAttributeNames: {},
    ExpressionAttributeValues: {}
  };

  if (season) {
    (query.KeyConditionExpression = 'season = :season'),
      (query.ExpressionAttributeValues![':season'] = parseInt(season));
  }

  if (filter || club) {
    if (filter == 'In') {
      query.FilterExpression = '#to = :team';
      query.ExpressionAttributeNames!['#to'] = 'to';
      query.ExpressionAttributeValues![':team'] = 'Tranmere Rovers';
      if (club) {
        query.FilterExpression += 'AND #from = :opposition';
        query.ExpressionAttributeNames!['#from'] = 'from';
        query.ExpressionAttributeValues![':opposition'] = club;
      }
    } else if (filter == 'Out') {
      query.FilterExpression = '#from = :team';
      query.ExpressionAttributeNames!['#from'] = 'from';
      query.ExpressionAttributeValues![':team'] = 'Tranmere Rovers';
      if (club) {
        query.FilterExpression += 'AND #to = :opposition';
        query.ExpressionAttributeNames!['#to'] = 'to';
        query.ExpressionAttributeValues![':opposition'] = club;
      }
    } else {
      query.FilterExpression = '#from = :team OR #to = :team';
      query.ExpressionAttributeNames!['#from'] = 'from';
      query.ExpressionAttributeNames!['#to'] = 'to';
      query.ExpressionAttributeValues![':team'] = club;
    }
  } else {
    delete query.ExpressionAttributeNames;
    if (!season) {
      delete query.ExpressionAttributeValues;
    }
  }

  const result = season ? await dynamo.query(query) : await dynamo.scan(query);
  const results = result.Items;
  const amendedResults: any[] = [];
  results?.forEach((result) => {
    result.team = result!.from != 'Tranmere Rovers' ? result!.from : result!.to;
    result!.type = result!.from != 'Tranmere Rovers' ? 'in' : 'out';
    amendedResults.push(result!);
  });

  if (!season) {
    amendedResults.sort(function (a, b) {
      if (a.cost < b.cost) return 1;
      if (a.cost > b.cost) return -1;
      return 0;
    });
  }
  return utils.sendResponse(200, { transfers: amendedResults });
};
