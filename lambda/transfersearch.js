const AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();
const utils = require('../lib/utils')();

exports.handler = async function (event, context) {

    var season = event.queryStringParameters ? event.queryStringParameters.season : null;
    var filter = event.queryStringParameters ? event.queryStringParameters.filter : null;
    var club = event.queryStringParameters ? event.queryStringParameters.club : null;

    var query = {
        TableName: utils.TRANSFER_TABLE,
        IndexName: "ByValueIndex",
        ScanIndexForward: false,
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {}
    }

    if(season) {
        query.KeyConditionExpression =  "season = :season",
        query.ExpressionAttributeValues[":season"] = parseInt(season)
    }

    if(filter || club) {
        if(filter == "In") {
            query.FilterExpression = "#to = :team";
            query.ExpressionAttributeNames["#to"] = "to";
            query.ExpressionAttributeValues[":team"] = "Tranmere Rovers"
            if(club) {
                query.FilterExpression += "AND #from = :opposition"
                query.ExpressionAttributeNames["#from"] = "from";
                query.ExpressionAttributeValues[":opposition"] = club
            }
        } else if(filter == "Out") {
            query.FilterExpression = "#from = :team";
            query.ExpressionAttributeNames["#from"] = "from";
            query.ExpressionAttributeValues[":team"] = "Tranmere Rovers"
            if(club) {
                query.FilterExpression += "AND #to = :opposition"
                query.ExpressionAttributeNames["#to"] = "to";
                query.ExpressionAttributeValues[":opposition"] = club
            }
        } else {
            query.FilterExpression = "#from = :team OR #to = :team";
            query.ExpressionAttributeNames["#from"] = "from";
            query.ExpressionAttributeNames["#to"] = "to";
            query.ExpressionAttributeValues[":team"] = club
        }
    } else {
        delete query.ExpressionAttributeNames;
        if(!season) {
            delete query.ExpressionAttributeValues;
        }
    }

    console.log("Query=" + JSON.stringify(query));

    var result = season ? await dynamo.query(query).promise() : await dynamo.scan(query).promise();
    var results = result.Items;
    var amendedResults = [];
    for(var i=0; i < results.length; i++) {
        results[i].team = results[i].from != "Tranmere Rovers" ?  results[i].from : results[i].to;
        results[i].type = results[i].from != "Tranmere Rovers" ?  "in" : "out";
        amendedResults.push(results[i]);
    }

    if(!season) {
        amendedResults.sort(function(a, b) {
            if (a.cost < b.cost) return 1
            if (a.cost > b.cost) return -1
            return 0
          });
    }
    return utils.sendResponse(200, {transfers: amendedResults});
};