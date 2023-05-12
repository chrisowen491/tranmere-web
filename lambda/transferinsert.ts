import  {v4 as uuidv4} from 'uuid'
import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { TranmereWebUtils, DataTables } from '../lib/tranmere-web-utils';
import {DynamoDB} from 'aws-sdk';
let utils = new TranmereWebUtils();
const dynamo = new DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

exports.handler = async (event : APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> =>{

    const body = JSON.parse(event.body!)

    var params = {
        TableName: DataTables.TRANSFER_TABLE,
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