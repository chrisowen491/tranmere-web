import * as cdk from 'aws-cdk-lib';
import { aws_apigateway as apigw} from 'aws-cdk-lib'; 
import { Construct } from 'constructs';
import * as acm from "aws-cdk-lib/aws-certificatemanager"
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { TranmereWebLambda } from './tranmere-web-lambda'
import { TranmereWebGraphQL } from './tranmere-web-graphql'

const CF_KEY : string = process.env.CF_KEY!;
const CF_SPACE : string = process.env.CF_SPACE!;
const EMAIL_ADDRESS : string = process.env.EMAIL_ADDRESS!;
const SCRAPE_ID : string = process.env.SCRAPE_ID!;
const SCRAPE_SEASON : string = process.env.SCRAPE_SEASON!;
const SCRAPE_URL : string = process.env.SCRAPE_URL!;
const DD_TAGS : string = process.env.DD_TAGS!;

export class TranmereWebStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const rootDomain = "tranmere-web.com";

    const env_variables = {
      "EMAIL_ADDRESS": EMAIL_ADDRESS,
      "CF_SPACE": CF_SPACE,
      "CF_KEY": CF_KEY,
      "SCRAPE_ID": SCRAPE_ID,
      "SCRAPE_SEASON": SCRAPE_SEASON,
      "SCRAPE_URL": SCRAPE_URL,
      "DD_TAGS": DD_TAGS
    }

    const TranmereWebPlayerTable = ddb.Table.fromTableAttributes(this,'TranmereWebPlayerTable',{tableName: 'TranmereWebPlayerTable',grantIndexPermissions: true});
    const TranmereWebAppsTable = ddb.Table.fromTableAttributes(this,'TranmereWebAppsTable',{tableName: 'TranmereWebAppsTable',grantIndexPermissions: true});
    const TranmereWebGoalsTable = ddb.Table.fromTableArn(this, "TranmereWebGoalsTable", `arn:aws:dynamodb:${this.region}:${this.account}:table/TranmereWebGoalsTable`);
    const TranmereWebPlayerSeasonSummaryTable = ddb.Table.fromTableAttributes(this,'TranmereWebPlayerSeasonSummaryTable',{tableName: 'TranmereWebPlayerSeasonSummaryTable',grantIndexPermissions: true});
    const TranmereWebMediaSyncTable = ddb.Table.fromTableArn(this, "TranmereWebMediaSyncTable", `arn:aws:dynamodb:${this.region}:${this.account}:table/TranmereWebMediaSyncTable`);
    const TranmereWebGames = ddb.Table.fromTableAttributes(this,'TranmereWebGames',{tableName: 'TranmereWebGames',grantIndexPermissions: true});
    const TranmereWebClubs = ddb.Table.fromTableArn(this, "TranmereWebClubs", `arn:aws:dynamodb:${this.region}:${this.account}:table/TranmereWebClubs`);
    const TranmereWebCompetitions = ddb.Table.fromTableArn(this, "TranmereWebCompetitions", `arn:aws:dynamodb:${this.region}:${this.account}:table/TranmereWebCompetitions`);
    const TranmereWebManagers = ddb.Table.fromTableArn(this, "TranmereWebManagers", `arn:aws:dynamodb:${this.region}:${this.account}:table/TranmereWebManagers`);
    const TranmereWebStarsTable = ddb.Table.fromTableArn(this, "TranmereWebStarsTable", `arn:aws:dynamodb:${this.region}:${this.account}:table/TranmereWebStarsTable`);
    const TranmereWebHatTricks = ddb.Table.fromTableAttributes(this,'TranmereWebHatTricks',{tableName: 'TranmereWebHatTricks',grantIndexPermissions: true});
    const TranmereWebOnThisDay = ddb.Table.fromTableAttributes(this,'TranmereWebOnThisDay',{tableName: 'TranmereWebOnThisDay',grantIndexPermissions: true});
    const TranmereWebPlayerTransfers = ddb.Table.fromTableAttributes(this,'TranmereWebPlayerTransfers',{tableName: 'TranmereWebPlayerTransfers',grantIndexPermissions: true});

    /*
    const TranmereWebOnThisDay = new ddb.Table(this, 'TranmereWebOnThisDay', {
      tableName: "TranmereWebOnThisDay",
      partitionKey: { name: 'day', type: ddb.AttributeType.STRING },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
    });
    */

    /*
    const TranmereWebPlayerTransfers = new ddb.Table(this, 'TranmereWebPlayerTransfers', {
      tableName: "TranmereWebPlayerTransfers",
      partitionKey: { name: 'id', type: ddb.AttributeType.STRING },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
    });
    TranmereWebPlayerTransfers.addGlobalSecondaryIndex({
      indexName: 'ByNameIndex',
      partitionKey: {
        name: 'name',
        type: ddb.AttributeType.STRING,
      },
      projectionType: ddb.ProjectionType.ALL,
      sortKey: {
        name: 'date',
        type: ddb.AttributeType.STRING,
      }
    });
    */

    // Base API gateway
    const api = new apigw.RestApi(this, 'tranmere-web', {
      // 👇 enable CORS
      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'x-api-key'
        ],
        allowMethods: ['OPTIONS'],
        allowCredentials: true,
        allowOrigins: ['*'],
      },
      domainName: {
        domainName: `api.prod.${rootDomain}`,
        certificate: acm.Certificate.fromCertificateArn(
          this,
          "tranmere-web-cert",
          "arn:aws:acm:us-east-1:559251280975:certificate/7c66b883-d2e0-491d-b678-fb288111b292"
        ),
        endpointType: apigw.EndpointType.EDGE,
      },
    });

    const contact_us = api.root.addResource('contact-us');
    const media_sync = api.root.addResource('media-sync');
    const type = media_sync.addResource('{type}');
    const builder = api.root.addResource('builder');
    const kit = builder.addResource('{kit}');
    const hair = kit.addResource('{hair}');
    const body = hair.addResource('{body}');
    const features = body.addResource('{features}');
    const hairColour = features.addResource('{hairColour}');
    const neckColour = hairColour.addResource('{neckColour}');
    const background = neckColour.addResource('{background}');
    const highlights = background.addResource('{highlights}');
    const match = api.root.addResource('match');
    const season = match.addResource('{season}');
    const date = season.addResource('{date}');
    const transfers = api.root.addResource('transfers');
    const page = api.root.addResource('page');
    const pageName = page.addResource('{pageName}');
    const classifier = pageName.addResource('{classifier}');
    const player_search = api.root.addResource('player-search');
    const result_search = api.root.addResource('result-search');
    const on = api.root.addResource('on');

    new TranmereWebLambda(this, 'ContactUsFunction', {      
      environment: env_variables,
      lambdaFile: './lambda/contactus.js',
      apiResource: contact_us,
      apiMethod: 'POST',
      policy: new iam.PolicyStatement({
        actions: ['ses:SendEmail', 'SES:SendRawEmail'],
        resources: ['*'],
        effect: iam.Effect.ALLOW,
      }),
    });

    new TranmereWebLambda(this, 'UpdateJobFunction', {      
      environment: env_variables,
      lambdaFile: './lambda/updateJob.js',
      schedule: {minute: '45', hour: '23'},
      readTables: [TranmereWebGoalsTable, TranmereWebAppsTable],
      readWriteTables: [TranmereWebPlayerSeasonSummaryTable]
    });

    new TranmereWebLambda(this, 'HatTrickJobFunction', {      
      environment: env_variables,
      lambdaFile: './lambda/hatTrickJob.js',
      schedule: {minute: '45', hour: '23'},
      readTables: [TranmereWebGoalsTable],
      readWriteTables: [TranmereWebHatTricks]
    });

    new TranmereWebLambda(this, 'ScraperJobFunction', {      
      environment: env_variables,
      lambdaFile: './lambda/scraper.js',
      schedule: {minute: '45', hour: '23'},
      readWriteTables: [TranmereWebGoalsTable, TranmereWebAppsTable, TranmereWebGames]
    });

    new TranmereWebLambda(this, 'MatchUpdateFunction', {      
      environment: env_variables,
      apiResource: date,
      apiMethod: 'POST',
      lambdaFile: './lambda/matchupdate.js',
      readWriteTables: [TranmereWebGames],
      apiUserPool: "TranmereWeb/matches.read"
    });

    new TranmereWebLambda(this, 'TransferUpdateFunction', {      
      environment: env_variables,
      apiResource: transfers,
      apiMethod: 'POST',
      lambdaFile: './lambda/transferinsert.js',
      readWriteTables: [TranmereWebPlayerTransfers],
      apiUserPool: "TranmereWeb/matches.read"
    });

    new TranmereWebLambda(this, 'PlayerSearchFunction', {      
      environment: env_variables,
      lambdaFile: './lambda/playersearch.js',
      apiResource: player_search,
      apiMethod: 'GET',
      readTables: [TranmereWebPlayerTable, TranmereWebPlayerSeasonSummaryTable]
    });

    new TranmereWebLambda(this, 'ResultsSearchFunction', {      
      environment: env_variables,
      lambdaFile: './lambda/resultssearch.js',
      apiResource: result_search,
      apiMethod: 'GET',
      readTables: [TranmereWebGames]
    });

    new TranmereWebLambda(this, 'OnThisDayFunction', {      
      environment: env_variables,
      lambdaFile: './lambda/onThisDayJob.js',
      schedule: {minute: '25', hour: '00'},
      apiMethod: 'GET',
      readWriteTables: [TranmereWebOnThisDay],
      readTables: [TranmereWebGames]
    });

    new TranmereWebLambda(this, 'MediaSyncFunction', {      
      environment: env_variables,
      lambdaFile: './lambda/mediasync.js',
      apiResource: type,
      apiMethod: 'POST',
      readWriteTables: [TranmereWebMediaSyncTable, TranmereWebPlayerTable, TranmereWebStarsTable]
    });

    new TranmereWebLambda(this, 'MatchPageFunction', {      
      environment: env_variables,
      lambdaFile: './lambda/matchpage.js',
      apiResource: date,
      apiMethod: 'GET',
      readTables: [TranmereWebPlayerTable, TranmereWebGames, TranmereWebGoalsTable, TranmereWebAppsTable],
      commandHooks: {
        beforeBundling(inputDir: string, outputDir: string): string[] {
          return [];
        },
        afterBundling(inputDir: string, outputDir: string): string[] {
          return [`mkdir ${outputDir}/templates && cp -R ${inputDir}/templates/* ${outputDir}/templates`];
        },
        beforeInstall() {
          return [];
        },
      }
    });

    new TranmereWebLambda(this, 'DynamicPageFunction', {      
      environment: env_variables,
      lambdaFile: './lambda/page.js',
      apiResource: classifier,
      apiMethod: 'GET',
      readTables: [TranmereWebAppsTable, TranmereWebPlayerSeasonSummaryTable, TranmereWebPlayerTable, TranmereWebPlayerTransfers],
      commandHooks: {
        beforeBundling(inputDir: string, outputDir: string): string[] {
          return [];
        },
        afterBundling(inputDir: string, outputDir: string): string[] {
          return [`mkdir ${outputDir}/templates && cp -R ${inputDir}/templates/* ${outputDir}/templates`];
        },
        beforeInstall() {
          return [];
        },
      }
    });

    new TranmereWebLambda(this, 'PlayerBuilderFunction', {      
      environment: env_variables,
      lambdaFile: './lambda/playerbuilder.js',
      apiResource: highlights,
      apiMethod: 'GET',
      commandHooks: {
        beforeBundling(inputDir: string, outputDir: string): string[] {
          return [];
        },
        afterBundling(inputDir: string, outputDir: string): string[] {
          return [`mkdir ${outputDir}/assets && cp -R ${inputDir}/lambda/assets/* ${outputDir}/assets`];
        },
        beforeInstall() {
          return [];
        },
      },
    });  

    new TranmereWebGraphQL(this, 'TranmereWebGraphQL', {      
      region: this.region,
      api: api,
      tables: [
        {
          table: TranmereWebClubs,
          keyColumn: "name"
        },
        {
          table: TranmereWebCompetitions,
          keyColumn: "name"
        },
        {
          table: TranmereWebManagers,
          keyColumn: "name"
        },
        {
          table: TranmereWebPlayerTable,
          keyColumn: "id"
        },
        {
          table: TranmereWebStarsTable,
          keyColumn: "id"
        },
        {
          table: TranmereWebHatTricks,
          keyColumn: "Season"
        },       
        {
          table: TranmereWebOnThisDay,
          keyColumn: "day"
        }
      ]
    });
  }
}