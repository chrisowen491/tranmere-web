import * as cdk from 'aws-cdk-lib';
import { aws_apigateway as apigw } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import { TranmereWebGraphQL } from './tranmere-web-graphql';

export class TranmereWebStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const rootDomain = 'tranmere-web.com';

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
