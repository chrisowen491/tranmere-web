const AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();
const utils = require('../lib/utils')();

exports.handler = async function (event, context) {
    console.log('Received event:', event);

    var results = [];

    for(var i = 1977; i < utils.getYear(); i++) {
        var today = new Date();
        var year = today.getUTCMonth() > 5 ? i : i + 1; 
        today.setFullYear(year);
        var result = await getResults(i, today.toISOString().slice(0, 10))

        if(result && result.programme != "#N/A") {
            results.push(result);
            result.day = result.date.substr(5);
        }
    }

    if(results.length > 0) {
        var random = getRndInteger(0, results.length);
        insertUpdateItem(results[random], utils.ON_THIS_DAY_TABLE);
    }

    return utils.sendResponse(200, results)
};

async function getResults(season, date) {
    
    var params = {
        TableName : utils.RESULTS_TABLE,
        KeyConditionExpression:  "season = :season and #date = :date",
        ExpressionAttributeValues: {
            ":season": decodeURIComponent(season),
            ":date": decodeURIComponent(date)
        },
        ExpressionAttributeNames: { "#date": "date" }
    }      
    var result = await dynamo.query(params).promise();
    return result.Items[0];
};

async function insertUpdateItem(item, type){
	const params = {
		TableName: type,
		Item: item
	};

	return await dynamo.put(params).promise();
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}