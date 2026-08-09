const RECEIVER = process.env.EMAIL_ADDRESS;
const SENDER = 'admin@tranmere-web.com';

import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SES } from '@aws-sdk/client-ses';
const ses = new SES();

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Received event:', event);
  if (event.body) await sendEmail(JSON.parse(event.body));
  return sendResponse(200, 'Success');
};

function sendResponse(code: number, obj: any): APIGatewayProxyResult {
  return {
    isBase64Encoded: false,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    statusCode: code,
    body: JSON.stringify(obj)
  };
}

async function sendEmail(event: { name: string; email: string; desc: string }) {
  const params = {
    Destination: {
      ToAddresses: [RECEIVER!]
    },
    Message: {
      Body: {
        Text: {
          Data:
            'name: ' +
            event.name +
            '\nemail: ' +
            event.email +
            '\ndesc: ' +
            event.desc,
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
    ses.sendEmail(params, function (err: Error, data: unknown) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
