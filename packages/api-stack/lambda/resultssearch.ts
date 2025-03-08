/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  TranmereWebUtils,
  DataTables,
  ProgrammeImage
} from '@tranmere-web/lib/src/tranmere-web-utils';
import { DynamoDBDocument, QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DBMatch, Match } from '@tranmere-web/lib/src/tranmere-web-types';
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
  const competition = event.queryStringParameters
    ? event.queryStringParameters.competition
    : null;
  const opposition = event.queryStringParameters
    ? event.queryStringParameters.opposition
    : null;
  const date = event.queryStringParameters
    ? event.queryStringParameters.date
    : null;
  const manager = event.queryStringParameters
    ? event.queryStringParameters.manager
    : null;
  const venue = event.queryStringParameters
    ? event.queryStringParameters.venue
    : null;
  const pens = event.queryStringParameters
    ? event.queryStringParameters.pens
    : null;
  const sort = event.queryStringParameters
    ? event.queryStringParameters.sort
    : null;

  const data = await getResults(
    season,
    competition,
    opposition,
    date,
    manager,
    venue,
    pens,
    sort
  );
  const results: any[] = [];
  const h2hresults = [
    buildDefaultSummary('Home'),
    buildDefaultSummary('Away'),
    buildDefaultSummary('Neutral')
  ];
  const h2hTotal = [buildDefaultSummary('Total')];
  for (let i = 0; i < data!.length; i++) {
    const match = data![i];

    let haindex = match.home == 'Tranmere Rovers' ? 0 : 1;
    if (match.venue == 'Wembley Stadium') {
      match.location = 'N';
      haindex = 2;
    } else {
      match.location = match.home == 'Tranmere Rovers' ? 'H' : 'A';
    }

    h2hresults[haindex].pld += 1;
    h2hTotal[0].pld += 1;

    const hgoal = match.hgoal ?? 0;
    const vgoal = match.vgoal ?? 0;

    if (match.home == 'Tranmere Rovers') {
      if (hgoal > vgoal) {
        h2hresults[haindex].wins += 1;
        h2hTotal[0].wins += 1;
      } else if (hgoal < vgoal) {
        h2hresults[haindex].lost += 1;
        h2hTotal[0].lost += 1;
      } else {
        h2hresults[haindex].draws += 1;
        h2hTotal[0].draws += 1;
      }
      h2hresults[haindex].for += hgoal;
      h2hresults[haindex].against += vgoal;
      h2hresults[haindex].diff += hgoal - vgoal;
      h2hTotal[0].for += hgoal;
      h2hTotal[0].against += vgoal;
      h2hTotal[0].diff += hgoal - vgoal;
    } else {
      if (hgoal > vgoal) {
        h2hresults[haindex].lost += 1;
        h2hTotal[0].lost += 1;
      } else if (hgoal < vgoal) {
        h2hresults[haindex].wins += 1;
        h2hTotal[0].wins += 1;
      } else {
        h2hresults[haindex].draws += 1;
        h2hTotal[0].draws += 1;
      }
      h2hresults[haindex].for += vgoal;
      h2hresults[haindex].against += hgoal;
      h2hresults[haindex].diff += vgoal - hgoal;
      h2hTotal[0].for += vgoal;
      h2hTotal[0].against += hgoal;
      h2hTotal[0].diff += vgoal - hgoal;
    }
    if (match.programme && match.programme != '#N/A') {
      const smallBody = new ProgrammeImage(match.programme);
      smallBody.edits = {
        resize: {
          width: 100,
          fit: 'contain'
        }
      };
      const largeBody = new ProgrammeImage(match.programme);
      match.programme = smallBody.imagestring();
      match.largeProgramme = largeBody.imagestring();
    } else {
      delete match.programme;
    }
    if (match.ticket && match.ticket != '#N/A') {
      const smallBody = new ProgrammeImage(match.ticket);
      smallBody.edits = {
        resize: {
          width: 100,
          fit: 'contain'
        }
      };
      const largeBody = new ProgrammeImage(match.ticket);
      match.ticket = smallBody.imagestring();
      match.largeTicket = largeBody.imagestring();
    } else {
      delete match.ticket;
    }
    if (date) {
      match.goals = await utils.getGoalsBySeason(parseInt(match.season), date);
      match.apps = await utils.getAppsBySeason(parseInt(match.season), date);
    }
    if (match.attendance == 0) match.attendance = null;
    if (match.competition !== 'Friendly') {
      results.push(match);
    }
  }

  if (h2hresults[2].pld == 0) {
    h2hresults.pop();
  }

  if (sort && decodeURIComponent(sort) == 'Top Attendance') {
    results.sort(function (a, b) {
      if (a.attendance < b.attendance) return 1;
      if (a.attendance > b.attendance) return -1;
      return 0;
    });
  } else if (sort && decodeURIComponent(sort) == 'Date Descending') {
    results.sort(function (a, b) {
      if (a.date < b.date) return 1;
      if (a.date > b.date) return -1;
      return 0;
    });
  } else {
    results.sort(function (a, b) {
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      return 0;
    });
  }

  if (date && results.length == 1) return utils.sendResponse(200, results[0]);
  else
    return utils.sendResponse(200, {
      results: results,
      h2hresults: h2hresults,
      h2htotal: h2hTotal
    });
};

async function getResults(
  season: string | null | undefined,
  competition: string | null | undefined,
  opposition: string | null | undefined,
  date: string | null | undefined,
  manager: string | null | undefined,
  venue: string | null | undefined,
  pens: string | null | undefined,
  sort: string | null | undefined
) {
  let query = false;
  let params: QueryCommandInput = {
    TableName: DataTables.RESULTS_TABLE,
    ExpressionAttributeValues: {},
    ExpressionAttributeNames: {}
  };

  if (season) {
    params.KeyConditionExpression = 'season = :season';
    params.ExpressionAttributeValues![':season'] = decodeURIComponent(season);
    query = true;
  } else if (opposition) {
    params.IndexName = 'OppositionIndex';
    params.KeyConditionExpression = 'opposition = :opposition';
    params.ExpressionAttributeValues![':opposition'] =
      decodeURIComponent(opposition);
    query = true;
  } else if (competition) {
    params.IndexName = 'CompetitionIndex';
    params.KeyConditionExpression = 'competition = :competition';
    params.ExpressionAttributeValues![':competition'] =
      decodeURIComponent(competition);
    query = true;
  } else if (venue && decodeURIComponent(sort!) != 'Top Attendance') {
    params.IndexName = 'VenueIndex';
    params.KeyConditionExpression = 'venue = :venue';
    params.ExpressionAttributeValues![':venue'] = decodeURIComponent(venue);
    query = true;
  } else if (sort && decodeURIComponent(sort) == 'Top Attendance') {
    params.IndexName = 'AttendanceIndex';
    params.KeyConditionExpression = '#static = :static';
    params.ExpressionAttributeNames = {
      '#static': 'static'
    };
    params.ExpressionAttributeValues = {
      ':static': 'static'
    };
    params.ScanIndexForward = false;
    params.Limit = 20;
    query = true;
  }

  if (sort && decodeURIComponent(sort) == 'Top Attendance') {
    params.Limit = 60;
  }

  if (manager) {
    const dates = manager.split(',');
    if (query && !params.ExpressionAttributeValues![':static']) {
      params.KeyConditionExpression =
        params.KeyConditionExpression + ' and #date BETWEEN :from and :to';
    } else {
      params.FilterExpression = '#date BETWEEN :from and :to';
    }
    params.ExpressionAttributeNames!['#date'] = 'date';
    params.ExpressionAttributeValues![':from'] = decodeURIComponent(dates[0]);
    params.ExpressionAttributeValues![':to'] = decodeURIComponent(dates[1]);
  }

  if (season && opposition)
    params = buildQuery(params, opposition, 'opposition');

  if (competition && (season || opposition))
    params = buildQuery(params, competition, 'competition');

  if (venue && (season || competition || opposition))
    params = buildQuery(params, venue, 'venue');
  else if (venue && sort && decodeURIComponent(sort) == 'Top Attendance') {
    params = buildQuery(params, venue, 'venue');
  }

  if (pens) {
    params.FilterExpression = params.FilterExpression
      ? params.FilterExpression + ' and pens <> :pens'
      : 'pens <> :pens';
    params.ExpressionAttributeValues![':pens'] = '';
  }

  if (!Object.keys(params.ExpressionAttributeNames!).length)
    delete params.ExpressionAttributeNames;

  const result = query ? await dynamo.query(params) : await dynamo.scan(params);
  let items = result.Items;
  if (typeof result.LastEvaluatedKey != 'undefined') {
    params.ExclusiveStartKey = result.LastEvaluatedKey;
    const nextResults = query
      ? await dynamo.query(params)
      : await dynamo.scan(params);
    items = items!.concat(nextResults.Items!);
  }

  const results = items as DBMatch[];

  const matches: Match[] = results.map((result) => {
    return {
      date: result.date,
      division: result.division,
      competition: result.competition,
      programme: result.programme,
      ticket: result.ticket,
      youtube: result.youtube,
      pens: result.pens,
      home: result.home,
      visitor: result.visitor,
      opposition: result.opposition,
      venue: result.venue,
      static: result.static,
      ft: result.ft,
      day: result.day,
      referee: result.referee,
      formation: result.formation,
      location: result.location,
      tier: Number(result.tier),
      season: result.season!.toString(),
      hgoal: Number(result.hgoal),
      vgoal: Number(result.vgoal),
      attendance: Number(result.attendance),
      round: Number(result.round)
    };
  });
  return matches;
}

function buildQuery(query, attribute, attributeName) {
  query.FilterExpression = query.FilterExpression
    ? query.FilterExpression + ` and ${attributeName} = :${attributeName}`
    : `${attributeName} = :${attributeName}`;
  query.ExpressionAttributeValues[`:${attributeName}`] =
    decodeURIComponent(attribute);
  return query;
}

function buildDefaultSummary(label) {
  return {
    venue: label,
    pld: 0,
    wins: 0,
    draws: 0,
    lost: 0,
    for: 0,
    against: 0,
    diff: 0
  };
}
