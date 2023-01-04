const AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async function(event, context){

    var season = event.queryStringParameters ? event.queryStringParameters.season : null;
    var competition = event.queryStringParameters ? event.queryStringParameters.competition : null;
    var opposition = event.queryStringParameters ? event.queryStringParameters.opposition : null;
    var date = event.queryStringParameters ? event.queryStringParameters.date : null;
    var manager = event.queryStringParameters ? event.queryStringParameters.manager : null;
    var venue = event.queryStringParameters ? event.queryStringParameters.venue : null;
    var pens = event.queryStringParameters ? event.queryStringParameters.pens : null;
    var sort = event.queryStringParameters ? event.queryStringParameters.sort : null;
    var or = event.queryStringParameters ? event.queryStringParameters.or : null;

    
    var data = await getResults(season, competition, opposition, date, manager, venue, pens, sort, or);
    var results = [];
    for(var i=0; i < data.length; i++) {
        var match = data[i];
        if(match.venue == "Wembley Stadium") {
            match.location = "N";
        } else if(match.home == "Tranmere Rovers") {
            match.location = "H";
        } else {
            match.location = "A";
        }
        if(match.programme && match.programme != "#N/A") {

             var smallBody = {
              "bucket": 'trfc-programmes',
              "key": match.programme,
              "edits": {
                "resize": {
                  "width": 100,
                  "fit": "contain"
                }
              }
            };
            var largeBody = {
                "bucket": 'trfc-programmes',
                "key": match.programme,
            };
            match.programme = Buffer.from(JSON.stringify(smallBody)).toString('base64');
            match.largeProgramme = Buffer.from(JSON.stringify(largeBody)).toString('base64');
        } else {
            delete match.programme;
        }
        if(date && !or) {
            match.goals = await getGoals(date, match.season);
            match.apps = await getApps(date, match.season);
        }
        if(match.attendance == 0)
            match.attendance = null;
        results.push(match)
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


    if(date && results.length == 1)
        return sendResponse(200, results[0]);
    else
        return sendResponse(200, results);

}

async function getResults(season, competition, opposition, date, manager, venue, pens, sort, or) {

    var query = false;
    var params = {
        TableName : "TranmereWebGames",
        ExpressionAttributeValues: {},
        ExpressionAttributeNames: {}
    };

    if(season) {
        params.KeyConditionExpression =  "season = :season",
        params.ExpressionAttributeValues[":season"] = decodeURIComponent(season);
        query = true;
    } else if(opposition) {
        params.IndexName = "OppositionIndex";
        params.KeyConditionExpression =  "opposition = :opposition",
        params.ExpressionAttributeValues[":opposition"] = decodeURIComponent(opposition);
        query = true;
    } else if(competition) {
        params.IndexName = "CompetitionIndex";
        params.KeyConditionExpression =  "competition = :competition",
        params.ExpressionAttributeValues[":competition"] = decodeURIComponent(competition);
        query = true;
    } else if(venue && (decodeURIComponent(sort) != "Top Attendance")) {
        params.IndexName = "VenueIndex";
        params.KeyConditionExpression =  "venue = :venue",
        params.ExpressionAttributeValues[":venue"] = decodeURIComponent(venue);
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
        if(query && !params.ExpressionAttributeValues[":static"]) {
            params.KeyConditionExpression =  params.KeyConditionExpression + " and #date BETWEEN :from and :to";
        } else {
            params.FilterExpression = "#date BETWEEN :from and :to";
        }
        params.ExpressionAttributeNames["#date"] = "date";
        params.ExpressionAttributeValues[":from"] = decodeURIComponent(dates[0]);
        params.ExpressionAttributeValues[":to"] = decodeURIComponent(dates[1]);
    }

    if(or) {
        var modifier = ">"
        if(or == "previous") {
            modifier = "<"
            params.ScanIndexForward = false;
        }
        params.KeyConditionExpression =  `season = :season and #date ${modifier} :date`,
        params.ExpressionAttributeValues[":season"] = decodeURIComponent(season);
        params.ExpressionAttributeNames["#date"] = "date";
        params.ExpressionAttributeValues[":date"] = decodeURIComponent(date);
        params.Limit = 5;

    }
    else if(date) {
        if(query) {
            params.KeyConditionExpression =  params.KeyConditionExpression + " and #date = :date";
        } else {
            params.FilterExpression = params.FilterExpression ? params.FilterExpression + " and #date = :date" : "#date = :date";
        }
        params.ExpressionAttributeNames["#date"] = "date";
        params.ExpressionAttributeValues[":date"] = decodeURIComponent(date);
    }

    if(season && opposition)
        params = buildQuery(params, opposition, "opposition");
    
    if(competition && (season || opposition)) 
        params = buildQuery(params, competition, "competition");  

    if(venue && (season || competition || opposition))
        params = buildQuery(params, venue, "venue"); 

    if(pens) {
        params.FilterExpression = params.FilterExpression ? params.FilterExpression + " and pens <> :pens" : "pens <> :pens";
        params.ExpressionAttributeValues[":pens"] = "";
    }
    
    if(!Object.keys(params.ExpressionAttributeNames).length)
        delete params.ExpressionAttributeNames;

    var result = query ? await dynamo.query(params).promise() : await dynamo.scan(params).promise();
    var items = result.Items;
    if (typeof result.LastEvaluatedKey != "undefined" && !or) {
        params.ExclusiveStartKey = result.LastEvaluatedKey;
        var nextResults =  query ? await dynamo.query(params).promise() : await dynamo.scan(params).promise();
        items = items.concat(nextResults.Items);
    }
    return items;
};

function buildQuery(query, attribute, attributeName) {
    query.FilterExpression = query.FilterExpression ? query.FilterExpression + ` and ${attributeName} = :${attributeName}` : `${attributeName} = :${attributeName}`;
    query.ExpressionAttributeValues[`:${attributeName}`] = decodeURIComponent(attribute);
    return query;
}

async function getGoals(date, season) {

    var params = {
        TableName : "TranmereWebGoalsTable",
        KeyConditionExpression :  "Season = :season",
        FilterExpression : "#Date = :date",
        ExpressionAttributeNames : {
            "#Date" : "Date"
        },
        ExpressionAttributeValues: {
            ":date" : decodeURIComponent(date),
            ":season" : decodeURIComponent(season)
        }
    }

    var result = await dynamo.query(params).promise();
    return result.Items;
};

async function getApps(date, season) {

    var params = {
        TableName : "TranmereWebAppsTable",
        KeyConditionExpression :  "Season = :season",
        FilterExpression : "#Date = :date",
        ExpressionAttributeNames : {
            "#Date" : "Date"
        },
        ExpressionAttributeValues: {
            ":date" : decodeURIComponent(date),
            ":season" : decodeURIComponent(season)
        }
    }

    var result = await dynamo.query(params).promise();
    return result.Items;
};

function sendResponse(statusCode, message) {
	const response = {
		statusCode: statusCode,
		body: JSON.stringify(message),
		headers: { 
            'Content-Type': 'application/json', 
            'Access-Control-Allow-Origin': '*',
            "Cache-Control": "public, max-age=86400"
        },
	};
	return response;
}