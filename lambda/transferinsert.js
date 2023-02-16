const AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();
const utils = require('../lib/utils')();
const { v4: uuidv4} = require('uuid');

exports.handler = async function (event, context) {

    const body = JSON.parse(event.body)

    var params = {
        TableName: utils.TRANSFER_TABLE,
        Item: {
            'id' : uuidv4(),
            'name' : body.name,
            'season' : parseInt(body.season),
            'from' : body.from,
            'to' : body.to,
            'value' : body.value,
            'cost' : parseInt(body.cost),
        }
    };

    await dynamo.put(params).promise();
    return utils.sendResponse(200, "ok");
};