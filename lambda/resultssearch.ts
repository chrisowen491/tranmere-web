import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { TranmereWebUtils, DataTables, ProgrammeImage } from '../lib/tranmere-web-utils';
import {DynamoDB} from 'aws-sdk';
let utils = new TranmereWebUtils();

const dynamo = new DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

exports.handler = async (event : APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> =>{

    const season = event.queryStringParameters ? event.queryStringParameters.season : null;
    const competition = event.queryStringParameters ? event.queryStringParameters.competition : null;
    const opposition = event.queryStringParameters ? event.queryStringParameters.opposition : null;
    const date = event.queryStringParameters ? event.queryStringParameters.date : null;
    const manager = event.queryStringParameters ? event.queryStringParameters.manager : null;
    const venue = event.queryStringParameters ? event.queryStringParameters.venue : null;
    const pens = event.queryStringParameters ? event.queryStringParameters.pens : null;
    const sort = event.queryStringParameters ? event.queryStringParameters.sort : null;
    const or = event.queryStringParameters ? event.queryStringParameters.or : null;

    const data = await getResults(season, competition, opposition, date, manager, venue, pens, sort, or);
    var results : Array<any> = [];
    var h2hresults = [buildDefaultSummary("Home"), buildDefaultSummary("Away"), buildDefaultSummary("Neutral")];
    var h2hTotal = [buildDefaultSummary("Total")];
    for(var i=0; i < data!.length; i++) {
        var match = data![i];
        if(match.home == "Tranmere Rovers") {
            var haindex = 0;
            if(match.venue == "Wembley Stadium") {
                match.location = "N";
                haindex = 2;
            } else {
                match.location = "H";
            }
            h2hresults[haindex].pld += 1;
            if(parseInt(match.hgoal) > parseInt(match.vgoal)) {
                h2hresults[haindex].wins += 1;
            } else if(parseInt(match.hgoal) < parseInt(match.vgoal)) {
                h2hresults[haindex].lost += 1;
            } else {
                h2hresults[haindex].draws += 1;
            }
            h2hresults[haindex].for += parseInt(match.hgoal);
            h2hresults[haindex].against += parseInt(match.vgoal);
            h2hresults[haindex].diff += (parseInt(match.hgoal) - parseInt(match.vgoal));
        } else {
            haindex = 1;
            if(match.venue == "Wembley Stadium") {
                match.location = "N";
                var haindex = 2;
            } else {
                match.location = "A";
            }
            h2hresults[haindex].pld += 1;
            if(parseInt(match.hgoal) > parseInt(match.vgoal)) {
                h2hresults[haindex].lost += 1;
            } else if(parseInt(match.hgoal) < parseInt(match.vgoal)) {
                h2hresults[haindex].wins += 1;
            } else {
                h2hresults[haindex].draws += 1;
            }
            h2hresults[haindex].for += parseInt(match.vgoal);
            h2hresults[haindex].against += parseInt(match.hgoal);
            h2hresults[haindex].diff += (parseInt(match.vgoal) - parseInt(match.hgoal));            
        }
        if(match.programme && match.programme != "#N/A") {
            var smallBody = new ProgrammeImage(match.programme );
            smallBody.edits = {
                resize: {
                  width: 100,
                  fit: "contain"
                }
            };
            var largeBody = new ProgrammeImage( match.programme ); 
            match.programme = smallBody.imagestring();
            match.largeProgramme = largeBody.imagestring();
        } else {
            delete match.programme;
        }
        if(date && !or) {
            match.goals = await utils.getGoalsBySeason(match.season, date);
            match.apps = await utils.getAppsBySeason(match.season, date);
        }
        if(match.attendance == 0)
            match.attendance = null;
        results.push(match)
    }

    if(h2hresults[2].pld == 0) {
        h2hresults.pop();
    }

    for(var i=0; i < h2hresults.length; i++) {
        h2hTotal[0].pld += h2hresults[i].pld;
        h2hTotal[0].wins += h2hresults[i].wins;
        h2hTotal[0].draws += h2hresults[i].draws;
        h2hTotal[0].lost += h2hresults[i].lost;
        h2hTotal[0].for += h2hresults[i].for;
        h2hTotal[0].against += h2hresults[i].against;
        h2hTotal[0].diff +=  h2hresults[i].diff;
    }

    if(sort && (decodeURIComponent(sort) == "Top Attendance")) {
        results.sort(function(a, b) {
          if (a.attendance < b.attendance) return 1
          if (a.attendance > b.attendance) return -1
          return 0
        });
    } else {
        results.sort(function(a, b) {
          if (a.date < b.date) return -1
          if (a.date > b.date) return 1
          return 0
        });
    }

    if(date && results.length == 1 && !or)
        return utils.sendResponse(200, results[0]);
    else
        return utils.sendResponse(200, {results: results, h2hresults: h2hresults, h2htotal: h2hTotal});
}

async function getResults(season, competition, opposition, date, manager, venue, pens, sort, or) {

    var query = false;
    var params : DynamoDB.DocumentClient.QueryInput = {
        TableName : DataTables.RESULTS_TABLE,
        ExpressionAttributeValues: {},
        ExpressionAttributeNames: {}
    };

    if(season) {
        params.KeyConditionExpression =  "season = :season",
        params.ExpressionAttributeValues![":season"] = decodeURIComponent(season);
        query = true;
    } else if(opposition) {
        params.IndexName = "OppositionIndex";
        params.KeyConditionExpression =  "opposition = :opposition",
        params.ExpressionAttributeValues![":opposition"] = decodeURIComponent(opposition);
        query = true;
    } else if(competition) {
        params.IndexName = "CompetitionIndex";
        params.KeyConditionExpression =  "competition = :competition",
        params.ExpressionAttributeValues![":competition"] = decodeURIComponent(competition);
        query = true;
    } else if(venue && (decodeURIComponent(sort) != "Top Attendance")) {
        params.IndexName = "VenueIndex";
        params.KeyConditionExpression =  "venue = :venue",
        params.ExpressionAttributeValues![":venue"] = decodeURIComponent(venue);
        query = true;
    } else if(sort && (decodeURIComponent(sort) == "Top Attendance")) {
        params.IndexName = "AttendanceIndex";
        params.KeyConditionExpression =  "#static = :static",
        params.ExpressionAttributeNames = {
            "#static": "static"
        };
        params.ExpressionAttributeValues = {
            ":static": "static",
        };
        params.ScanIndexForward = false;
        params.Limit = 20;
        query = true;
    }
    
    if(sort && (decodeURIComponent(sort) == "Top Attendance")) {
        params.Limit = 60;    
    }
    
    if(manager) {
        var dates = manager.split(',');
        if(query && !params.ExpressionAttributeValues![":static"]) {
            params.KeyConditionExpression =  params.KeyConditionExpression + " and #date BETWEEN :from and :to";
        } else {
            params.FilterExpression = "#date BETWEEN :from and :to";
        }
        params.ExpressionAttributeNames!["#date"] = "date";
        params.ExpressionAttributeValues![":from"] = decodeURIComponent(dates[0]);
        params.ExpressionAttributeValues![":to"] = decodeURIComponent(dates[1]);
    }

    if(or) {
        var modifier = ">"
        if(or == "previous") {
            modifier = "<"
            params.ScanIndexForward = false;
        }
        params.KeyConditionExpression =  `season = :season and #date ${modifier} :date`,
        params.ExpressionAttributeValues![":season"] = decodeURIComponent(season);
        params.ExpressionAttributeNames!["#date"] = "date";
        params.ExpressionAttributeValues![":date"] = decodeURIComponent(date);
        params.Limit = 5;

    }
    else if(date) {
        if(query) {
            params.KeyConditionExpression =  params.KeyConditionExpression + " and #date = :date";
        } else {
            params.FilterExpression = params.FilterExpression ? params.FilterExpression + " and #date = :date" : "#date = :date";
        }
        params.ExpressionAttributeNames!["#date"] = "date";
        params.ExpressionAttributeValues![":date"] = decodeURIComponent(date);
    }

    if(season && opposition)
        params = buildQuery(params, opposition, "opposition");
    
    if(competition && (season || opposition)) 
        params = buildQuery(params, competition, "competition");  

    if(venue && (season || competition || opposition))
        params = buildQuery(params, venue, "venue"); 
    else if(venue && sort && (decodeURIComponent(sort) == "Top Attendance")) {
        params = buildQuery(params, venue, "venue"); 
    }

    if(pens) {
        params.FilterExpression = params.FilterExpression ? params.FilterExpression + " and pens <> :pens" : "pens <> :pens";
        params.ExpressionAttributeValues![":pens"] = "";
    }
    
    if(!Object.keys(params.ExpressionAttributeNames!).length)
        delete params.ExpressionAttributeNames;

    var result = query ? await dynamo.query(params).promise() : await dynamo.scan(params).promise();
    var items = result.Items;
    if (typeof result.LastEvaluatedKey != "undefined" && !or) {
        params.ExclusiveStartKey = result.LastEvaluatedKey;
        var nextResults =  query ? await dynamo.query(params).promise() : await dynamo.scan(params).promise();
        items = items!.concat(nextResults.Items!);
    }
    return items;
};

function buildQuery(query, attribute, attributeName) {
    query.FilterExpression = query.FilterExpression ? query.FilterExpression + ` and ${attributeName} = :${attributeName}` : `${attributeName} = :${attributeName}`;
    query.ExpressionAttributeValues[`:${attributeName}`] = decodeURIComponent(attribute);
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