import  {v4 as uuidv4} from 'uuid'
import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { TranmereWebUtils, DataTables } from '../lib/tranmere-web-utils';
import {DynamoDB} from 'aws-sdk';
let utils = new TranmereWebUtils();
const dynamo = new DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

exports.handler = async (event : APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> =>{

    const body = JSON.parse(event.body!)
    console.log('got');
    var params = {
        TableName: DataTables.LINKS_TABLE,
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