import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { TranmereWebUtils, DataTables } from '../lib/tranmere-web-utils';
import { Goal } from '../lib/tranmere-web-types';
import { DynamoDBDocument, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
let utils = new TranmereWebUtils();
const dynamo = DynamoDBDocument.from(new DynamoDB({apiVersion: '2012-08-10'}));

exports.handler = async (event : APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> =>{

    const id = event.pathParameters!.id;
    const season = event.pathParameters!.season;
    const body = JSON.parse(event.body!) as Goal;

    var params = new UpdateCommand({
        TableName: DataTables.GOALS_TABLE_NAME,
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
    });
    await dynamo.send(params);
    return utils.sendResponse(200, "ok");
};