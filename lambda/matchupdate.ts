import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { TranmereWebUtils, DataTables } from '../lib/tranmere-web-utils';
import { Match } from '../lib/tranmere-web-types';
import {DynamoDB} from 'aws-sdk';
let utils = new TranmereWebUtils();
const dynamo = new DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

exports.handler = async (event : APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> =>{

    const date = event.pathParameters!.date;
    const season = event.pathParameters!.season;
    const body = JSON.parse(event.body!) as Match;

    var params = {
        TableName: DataTables.RESULTS_TABLE,
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
            ":a": body.attendance,
            ":p": body.programme
        },
        ReturnValues:"UPDATED_NEW"
    };

    await dynamo.update(params).promise();
    return utils.sendResponse(200, "ok");
};