import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { TranmereWebUtils, DataTables } from '../lib/tranmere-web-utils';
import { MatchEvent } from '../lib/tranmere-web-types';
import axios from 'axios';
import {DynamoDB} from 'aws-sdk';
let utils = new TranmereWebUtils();
const dynamo = new DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

exports.handler = async (event : APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> =>{

    // Find Event Id
    // Format AI Request.
    // Make AI Call

    const date = event.pathParameters!.date;
    const season = event.pathParameters!.season;
    const reportId = event.pathParameters!.reportId;
    const events : MatchEvent[] = []    
    let page = 1;
    let url = `https://push.api.bbci.co.uk/batch?t=%2Fdata%2Fbbc-morph-lx-commentary-data-paged%2Fdiscipline%2Fsoccer%2FeventId%2F${reportId}%2FisUk%2Ffalse%2Flimit%2F20%2FnitroKey%2Flx-nitro%2FpageNumber%2F${page}%2Fversion%2F1.5.6`;

    const summary = await axios.get(url, {
        headers: {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "en-US,en;q=0.9",
            "sec-ch-ua": "\"Chromium\";v=\"118\", \"Google Chrome\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1"            
        }
    });

    summary.data.payload[0].body.results.forEach(element => {
        events.unshift({description: element.body[0].children[0].text, time: element.time, eventType: element.title})
    });

    console.log(summary.data.payload[0].body.numberOfPages)

    if(summary.data.payload[0].body.numberOfPages > 1) {
        for (let page = 2; page <= summary.data.payload[0].body.numberOfPages; page++){
            let url = `https://push.api.bbci.co.uk/batch?t=%2Fdata%2Fbbc-morph-lx-commentary-data-paged%2Fdiscipline%2Fsoccer%2FeventId%2F${reportId}%2FisUk%2Ffalse%2Flimit%2F20%2FnitroKey%2Flx-nitro%2FpageNumber%2F${page}%2Fversion%2F1.5.6`;
            let next_page = await axios.get(url, 
            {
                headers: {
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "accept-language": "en-US,en;q=0.9",
                    "sec-ch-ua": "\"Chromium\";v=\"118\", \"Google Chrome\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"macOS\"",
                    "sec-fetch-dest": "document",
                    "sec-fetch-mode": "navigate",
                    "sec-fetch-site": "none",
                    "sec-fetch-user": "?1",
                    "upgrade-insecure-requests": "1"            
                }
            });
            next_page.data.payload[0].body.results.forEach(element => {
                events.unshift({description: element.body[0].children[0].text, time: element.time, eventType: element.title})
            });
        }
    }
    


    var params = {
        TableName: DataTables.REPORT_TABLE,
        Key:{
            "day": date
        },
        UpdateExpression: "set report = :r",
        ExpressionAttributeValues:{
            ":r": `<p>match report goes here</p>`,
        },
        ReturnValues:"UPDATED_NEW"
    };

    await dynamo.update(params).promise();
    return utils.sendResponse(200, JSON.stringify(events));
};