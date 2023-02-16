const AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();
const utils = require('../lib/utils')();

exports.handler = async function (event, context) {

    const id = event.pathParameters.id;
    const season = event.pathParameters.season;
 
    return utils.sendResponse(200, await getGoals(id, season));
};

async function getGoals(id, season) {

    var params = {
        TableName : utils.GOALS_TABLE_NAME,
        KeyConditionExpression :  "Season = :season and #id = :id",
        ExpressionAttributeNames : {
            "#id" : "id"
        },
        ExpressionAttributeValues: {
            ":id" : decodeURIComponent(id),
            ":season" : decodeURIComponent(season)
        }
    }
    var result = await dynamo.query(params).promise();
    return result.Items[0];
};