import * as cdk from 'aws-cdk-lib';
import { aws_apigateway as apigw } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { TranmereWebLambda } from './tranmere-web-lambda';
import { TranmereWebGraphQL } from './tranmere-web-graphql';

const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS!;
const DD_TAGS = process.env.DD_TAGS!;

export class TranmereWebStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const rootDomain = 'tranmere-web.com';

    const env_variables = {
      EMAIL_ADDRESS: EMAIL_ADDRESS,
      DD_TAGS: DD_TAGS,
      DD_EXTENSION_VERSION: 'next'
    };

    const TranmereWebHatTricks = ddb.Table.fromTableAttributes(
      this,
      'TranmereWebHatTricks',
      { tableName: 'TranmereWebHatTricks', grantIndexPermissions: true }
    );

    // Base API gateway
    const api = new apigw.RestApi(this, 'tranmere-web', {
      // 👇 enable CORS
      defaultCorsPreflightOptions: {
        allowHeaders: ['Content-Type', 'x-api-key'],
        allowMethods: ['OPTIONS'],
        allowCredentials: true,
        allowOrigins: ['*']
      },
      domainName: {
        domainName: `api.${rootDomain}`,
        certificate: acm.Certificate.fromCertificateArn(
          this,
          'tranmere-web-cert',
          'arn:aws:acm:us-east-1:559251280975:certificate/afb04599-690b-4911-8952-92c97112984c'
        ),
        endpointType: apigw.EndpointType.EDGE
      }
    });

    const contact_us = api.root.addResource('contact-us');

    new TranmereWebLambda(this, 'ContactUsFunction', {
      environment: env_variables,
      lambdaFile: './lambda/contactus.ts',
      apiResource: contact_us,
      apiMethod: 'POST',
      policy: new iam.PolicyStatement({
        actions: ['ses:SendEmail', 'SES:SendRawEmail'],
        resources: ['*'],
        effect: iam.Effect.ALLOW
      })
    });

    new TranmereWebGraphQL(this, 'TranmereWebGraphQL', {
      region: this.region,
      api: api,
      tables: [
        {
          table: TranmereWebHatTricks,
          keyColumn: 'Season'
        },
      ]
    });
  }
}
