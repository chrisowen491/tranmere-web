import * as cdk from 'aws-cdk-lib';
import { aws_apigateway as apigw} from 'aws-cdk-lib'; 
import { Construct } from 'constructs';
import * as acm from "aws-cdk-lib/aws-certificatemanager"
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cognito from 'aws-cdk-lib/aws-cognito';
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
    const TranmereWebPlayerLinks = ddb.Table.fromTableAttributes(this,'TranmereWebPlayerLinks',{tableName: 'TranmereWebPlayerLinks',grantIndexPermissions: true});
    
    const TranmereWebUserPool = cognito.UserPool.fromUserPoolArn(this, "TranmereWebUserPool", `arn:aws:cognito-idp:${this.region}:${this.account}:userpool/eu-west-1_GAF4md6wn`);
    const cognitoAuthorizer = new apigw.CognitoUserPoolsAuthorizer(
      this,
      "TranmereWebAuthorizer",
      {
          cognitoUserPools: [TranmereWebUserPool],
      }
    );

    const TranmereWebMatchReport = new ddb.Table(this, 'TranmereWebMatchReport', {
      tableName: "TranmereWebMatchReport",
      partitionKey: { name: 'day', type: ddb.AttributeType.STRING },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
    });

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
        name: 'season',
        type: ddb.AttributeType.NUMBER,
      }
    });
    TranmereWebPlayerTransfers.addGlobalSecondaryIndex({
      indexName: 'ByValueIndex',
      partitionKey: {
        name: 'season',
        type: ddb.AttributeType.NUMBER,
      },
      projectionType: ddb.ProjectionType.ALL,
      sortKey: {
        name: 'cost',
        type: ddb.AttributeType.NUMBER,
      }
    });
    */

    /*
    const TranmereWebPlayerLinks = new ddb.Table(this, 'TranmereWebPlayerLinks', {
      tableName: "TranmereWebPlayerLinks",
      partitionKey: { name: 'id', type: ddb.AttributeType.STRING },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
    });
    TranmereWebPlayerLinks.addGlobalSecondaryIndex({
      indexName: 'ByNameIndex',
      partitionKey: {
        name: 'name',
        type: ddb.AttributeType.STRING,
      },
      projectionType: ddb.ProjectionType.ALL
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
    const report = date.addResource('{report}');
    const goal = api.root.addResource('goal');
    const goalseason = goal.addResource('{season}');
    const goalid = goalseason.addResource('{id}');
    const transfers = api.root.addResource('transfers');
    const links = api.root.addResource('links');
    const page = api.root.addResource('page');
    const pageName = page.addResource('{pageName}');
    const classifier = pageName.addResource('{classifier}');
    const player_search = api.root.addResource('player-search');
    const result_search = api.root.addResource('result-search');
    const transfer_search = api.root.addResource('transfer-search');
    const on = api.root.addResource('on');
    const upload = api.root.addResource('upload');

    new TranmereWebLambda(this, 'ContactUsFunction', {      
      environment: env_variables,
      lambdaFile: './lambda/contactus.ts',
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
      lambdaFile: './lambda/updateJob.ts',
      schedule: {minute: '45', hour: '23'},
      readTables: [TranmereWebGoalsTable, TranmereWebAppsTable],
      readWriteTables: [TranmereWebPlayerSeasonSummaryTable]
    });

    new TranmereWebLambda(this, 'HatTrickJobFunction', {      
      environment: env_variables,
      lambdaFile: './lambda/hatTrickJob.ts',
      schedule: {minute: '45', hour: '23'},
      readTables: [TranmereWebGoalsTable],
      readWriteTables: [TranmereWebHatTricks]
    });

    new TranmereWebLambda(this, 'ScraperJobFunction', {      
      environment: env_variables,
      lambdaFile: './lambda/scraper.ts',
      schedule: {minute: '45', hour: '22'},
      readWriteTables: [TranmereWebGoalsTable, TranmereWebAppsTable, TranmereWebGames]
    });

    /*
    new TranmereWebLambda(this, 'UploadJobFunction', {      
      environment: env_variables,
      lambdaFile: './lambda/upload.js',
      readWriteTables: [TranmereWebPlayerTransfers],
      apiResource: upload,
      apiMethod: 'GET',
      commandHooks: {
        beforeBundling(inputDir: string, outputDir: string): string[] {
          return [];
        },
        afterBundling(inputDir: string, outputDir: string): string[] {
          return [`mkdir ${outputDir}/csv && cp -R ${inputDir}/csv/* ${outputDir}/csv`];
        },
        beforeInstall() {
          return [];
        },
      }
    });
    */

    new TranmereWebLambda(this, 'MatchUpdateFunction', {      
      environment: env_variables,
      apiResource: date,
      apiMethod: 'POST',
      lambdaFile: './lambda/matchupdate.ts',
      readWriteTables: [TranmereWebGames],
      authorizer: cognitoAuthorizer,
      scopes: "TranmereWeb/matches.read"
    });

    new TranmereWebLambda(this, 'MatchReportFunction', {      
      environment: env_variables,
      apiResource: report,
      apiMethod: 'GET',
      lambdaFile: './lambda/matchreport.ts',
      readWriteTables: [TranmereWebMatchReport],
      authorizer: cognitoAuthorizer,
      scopes: "TranmereWeb/matches.read"
    });


    new TranmereWebLambda(this, 'GoalUpdateFunction', {      
      environment: env_variables,
      apiResource: goalid,
      apiMethod: 'POST',
      lambdaFile: './lambda/goalupdate.ts',
      readWriteTables: [TranmereWebGoalsTable],
      authorizer: cognitoAuthorizer,
      scopes: "TranmereWeb/matches.read"
    });

    new TranmereWebLambda(this, 'GoalFunction', {      
      environment: env_variables,
      apiResource: goalid,
      apiMethod: 'GET',
      lambdaFile: './lambda/goal.ts',
      readTables: [TranmereWebGoalsTable]
    });

    new TranmereWebLambda(this, 'TransferUpdateFunction', {      
      environment: env_variables,
      apiResource: transfers,
      apiMethod: 'POST',
      lambdaFile: './lambda/transferinsert.ts',
      readWriteTables: [TranmereWebPlayerTransfers],
      authorizer: cognitoAuthorizer,
      scopes: "TranmereWeb/matches.read"
    });

    new TranmereWebLambda(this, 'LinksUpdateFunction', {      
      environment: env_variables,
      apiResource: links,
      apiMethod: 'POST',
      lambdaFile: './lambda/linksinsert.ts',
      readWriteTables: [TranmereWebPlayerLinks],
      authorizer: cognitoAuthorizer,
      scopes: "TranmereWeb/matches.read"
    });

    new TranmereWebLambda(this, 'PlayerSearchFunction', {      
      environment: env_variables,
      lambdaFile: './lambda/playersearch.ts',
      apiResource: player_search,
      apiMethod: 'GET',
      readTables: [TranmereWebPlayerTable, TranmereWebPlayerSeasonSummaryTable]
    });

    new TranmereWebLambda(this, 'ResultsSearchFunction', {      
      environment: env_variables,
      lambdaFile: './lambda/resultssearch.ts',
      apiResource: result_search,
      apiMethod: 'GET',
      readTables: [TranmereWebGames]
    });

    new TranmereWebLambda(this, 'TransferSearchFunction', {      
      environment: env_variables,
      lambdaFile: './lambda/transfersearch.ts',
      apiResource: transfer_search,
      apiMethod: 'GET',
      readTables: [TranmereWebPlayerTransfers]
    });

    new TranmereWebLambda(this, 'OnThisDayFunction', {      
      environment: env_variables,
      lambdaFile: './lambda/onThisDayJob.ts',
      schedule: {minute: '25', hour: '00'},
      apiMethod: 'GET',
      readWriteTables: [TranmereWebOnThisDay],
      readTables: [TranmereWebGames]
    });

    new TranmereWebLambda(this, 'MediaSyncFunction', {      
      environment: env_variables,
      lambdaFile: './lambda/mediasync.ts',
      apiResource: type,
      apiMethod: 'POST',
      readWriteTables: [TranmereWebMediaSyncTable, TranmereWebPlayerTable, TranmereWebStarsTable]
    });

    new TranmereWebLambda(this, 'MatchPageFunction', {      
      environment: env_variables,
      lambdaFile: './lambda/matchpage.ts',
      apiResource: date,
      apiMethod: 'GET',
      readTables: [TranmereWebPlayerTable, TranmereWebGames, TranmereWebGoalsTable, TranmereWebAppsTable, TranmereWebMatchReport],
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
      lambdaFile: './lambda/page.ts',
      apiResource: classifier,
      apiMethod: 'GET',
      readTables: [TranmereWebAppsTable, TranmereWebPlayerSeasonSummaryTable, TranmereWebPlayerTable, TranmereWebPlayerTransfers, TranmereWebPlayerLinks],
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
      lambdaFile: './lambda/playerbuilder.ts',
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
        },
        {
          table: TranmereWebGames,
          keyColumn: "season"
        }
      ]
    });
  }
}