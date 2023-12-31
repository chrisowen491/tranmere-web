import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { TranmereWebUtils, DataTables } from '../lib/tranmere-web-utils';
import {DynamoDB} from 'aws-sdk';
let utils = new TranmereWebUtils();
const dynamo = new DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

exports.handler = async (event : APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> =>{

    // Find Event Id
    // Build Event JSON
    // Format AI Request.
    // Make AI Call
    // Save AI Message to DB

    const date = event.pathParameters!.date;
    const season = event.pathParameters!.season;

    
    var params = {
        TableName: DataTables.REPORT_TABLE,
        Key:{
            "date": date
        },
        UpdateExpression: "set report = :r",
        ExpressionAttributeValues:{
            ":r": "<p>Match Report Goes Here</p>",
        },
        ReturnValues:"UPDATED_NEW"
    };

    await dynamo.update(params).promise();
    return utils.sendResponse(200, "ok");
};