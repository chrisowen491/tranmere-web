const AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();
const utils = require('../lib/utils')();
const { v4: uuidv4} = require('uuid');

exports.handler = async function (event, context) {

    const body = JSON.parse(event.body)
    console.log('got');
    var params = {
        TableName: utils.LINKS_TABLE,
        Item: {
            'id' : uuidv4(),
            'name' : body.name,
            'link' : body.link,
            'description' : body.description,
        }
    };

    await dynamo.put(params).promise();
    return utils.sendResponse(200, "ok");
};