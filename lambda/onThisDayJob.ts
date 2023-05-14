import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { TranmereWebUtils, DataTables } from '../lib/tranmere-web-utils';
let utils = new TranmereWebUtils();

exports.handler = async (event : APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> =>{

    console.log('Received event:', event);

    var results : Array<any> = [];

    for(var i = 1977; i < utils.getYear(); i++) {
        var today = new Date();
        var year = today.getUTCMonth() > 5 ? i : i + 1; 
        today.setFullYear(year);
        var result = await utils.getResultForDate(i, today.toISOString().slice(0, 10))

        if(result && result.programme != "#N/A") {
            results.push(result);
            result.day = result.date.substr(5);
        }
    }

    if(results.length > 0) {
        var random = getRndInteger(0, results.length);
        utils.insertUpdateItem(results[random], DataTables.ON_THIS_DAY_TABLE);
    }

    return utils.sendResponse(200, results)
};

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}