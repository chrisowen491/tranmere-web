import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { TranmereWebUtils, DataTables } from '../lib/tranmere-web-utils';
import {DynamoDB} from 'aws-sdk';
let utils = new TranmereWebUtils();
const dynamo = new DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

exports.handler = async (event : APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> =>{

    const id = event.pathParameters!.id;
    const season = event.pathParameters!.season;
 
    return utils.sendResponse(200, await getGoals(id, season));
};

async function getGoals(id, season) {

    var params = {
        TableName : DataTables.GOALS_TABLE_NAME,
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
    return result.Items![0];
};