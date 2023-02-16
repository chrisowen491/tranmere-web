const AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();
const utils = require('../lib/utils')();

exports.handler = async function (event, context) {

    const id = event.pathParameters.id;
    const season = event.pathParameters.season;
    const body = JSON.parse(event.body)

    var params = {
        TableName: utils.GOALS_TABLE_NAME,
        Key:{
            "Season": season,
            "id": id
        },
        UpdateExpression: "set #Date=:p, GoalType=:a, #Minute=:y, Opposition=:h, Scorer=:v, Assist=:o, AssistType=:x",
        ExpressionAttributeNames : {
            "#Date" : "Date",
            "#Minute" : "Minute"
        },
        ExpressionAttributeValues:{
            ":p": body.Date,
            ":a": body.GoalType,
            ":y": body.Minute,
            ":h": body.Opposition,
            ":v": body.Scorer,
            ":o": body.Assist,
            ":x": body.AssistType
        },
        ReturnValues:"UPDATED_NEW"
    };
    await dynamo.update(params).promise();
    return utils.sendResponse(200, "ok");
};