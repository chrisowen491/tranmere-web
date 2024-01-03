const RECEIVER = process.env.EMAIL_ADDRESS;
const SENDER = 'admin@tranmere-web.com';

import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { TranmereWebUtils } from '../lib/tranmere-web-utils';
import { SES } from '@aws-sdk/client-ses';
const ses = new SES();
let utils = new TranmereWebUtils();

exports.handler = async (event : APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> =>{

    console.log('Received event:', event);
    if(event.body)
        await sendEmail(JSON.parse(event.body));
    return utils.sendResponse(200, "Success");
};

async function sendEmail (event) {
    const params = {
        Destination: {
            ToAddresses: [
                RECEIVER!
            ]
        },
        Message: {
            Body: {
                Text: {
                    Data: 'name: ' + event.name + '\nemail: ' + event.email + '\ndesc: ' + event.desc,
                    Charset: 'UTF-8'
                }
            },
            Subject: {
                Data: 'Website Referral Form: ' + event.name,
                Charset: 'UTF-8'
            }
        },
        Source: SENDER!
    };
    return new Promise((resolve, reject) => {
      ses.sendEmail(params, function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
}