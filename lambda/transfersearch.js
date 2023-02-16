const AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();
const utils = require('../lib/utils')();

exports.handler = async function (event, context) {

    var season = event.queryStringParameters ? event.queryStringParameters.season : null;
    var filter = event.queryStringParameters ? event.queryStringParameters.filter : null;

    var query = {
        TableName: utils.TRANSFER_TABLE,
        IndexName: "ByValueIndex",
        ExpressionAttributeNames: {},
        ExpressionAttributeValues: {}
    }

    if(season) {
        query.KeyConditionExpression =  "season = :season",
        query.ExpressionAttributeValues[":season"] = parseInt(season)
    }

    if(filter) {
        if(filter == "In") {
            query.FilterExpression = "#to = :team";
            query.ExpressionAttributeNames["#to"] = "to";
            query.ExpressionAttributeValues[":team"] = "Tranmere Rovers"
        } else if(filter == "Out") {
            query.FilterExpression = "#from = :team";
            query.ExpressionAttributeNames["#from"] = "from";
            query.ExpressionAttributeValues[":team"] = "Tranmere Rovers"
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

    return utils.sendResponse(200, {transfers: results});
};