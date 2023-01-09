const AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();
const utils = require('../lib/utils')();

exports.handler = async function (event, context) {

    const date = event.pathParameters.date;
    const season = event.pathParameters.season;
    const body = JSON.parse(event.body)

    var params = {
        TableName: utils.RESULTS_TABLE,
        Key:{
            "season": season,
            "date": date
        },
        UpdateExpression: "set programme = :p, attendance=:a, youtube=:y, home=:h, visitor=:v, opposition=:o, pens=:x, hgoal=:f, vgoal=:g",
        ExpressionAttributeValues:{
            ":y": body.youtube,
            ":h": body.home,
            ":v": body.visitor,
            ":o": body.opposition,
            ":x": body.pens,
            ":f": body.hgoal,
            ":g": body.vgoal,
            ":a": parseInt(body.attendance),
            ":p": body.programme
        },
        ReturnValues:"UPDATED_NEW"
    };

    await dynamo.update(params).promise();
    return utils.sendResponse(200, "ok");
};