const AWS = require('aws-sdk');
const contentful = require("contentful");
const utils = require('../lib/utils')();
let dynamo = new AWS.DynamoDB.DocumentClient();
const client = contentful.createClient({
  space: process.env.CF_SPACE,
  accessToken: process.env.CF_KEY
});

exports.handler = async function (event, context) {
    console.log('Received event:', event);
    console.log(event.pathParameters.type);

    if(event.body) {
        const body = JSON.parse(event.body)

        if(body.sys.type === "Entry") {
            const content = await client.getEntry(body.sys.id);
            var item = content.fields;
            item.id = body.sys.id;
            await insertUpdateItem(item, event.pathParameters.type);
        } else if(body.sys.type === "DeletedEntry"){
            await deleteItem(body.sys.id, event.pathParameters.type);
        }
    }
    return utils.sendResponse(200, "ok");
};

async function insertUpdateItem(item, type){
	const params = {
		TableName: type,
		Item: item
	};

	return await dynamo.put(params).promise();
}

async function deleteItem(id, type){
	console.log(id);
	const params = {
		TableName: type,
		Key:{
            "id": id
        },
	};

	return await dynamo.delete(params).promise();
}