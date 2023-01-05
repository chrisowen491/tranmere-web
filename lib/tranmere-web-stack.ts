import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
import { aws_apigateway as apigw} from 'aws-cdk-lib'; 
import { Construct } from 'constructs';
import * as acm from "aws-cdk-lib/aws-certificatemanager"
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as events from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as appsync from '@aws-cdk/aws-appsync-alpha';
import { MappingTemplate } from '@aws-cdk/aws-appsync-alpha';
import { Datadog } from 'datadog-cdk-constructs-v2';


const ENVIRONMENT : string = process.env.ENVIRONMENT!;
const DD_KEY : string = process.env.DD_KEY!;
const CF_KEY : string = process.env.CF_KEY!;
const CF_SPACE : string = process.env.CF_SPACE!;
const EMAIL_ADDRESS : string = process.env.EMAIL_ADDRESS!;
const SCRAPE_ID : string = process.env.SCRAPE_ID!;
const SCRAPE_SEASON : string = process.env.SCRAPE_SEASON!;
const SCRAPE_URL : string = process.env.SCRAPE_URL!;

import * as pack from '../package.json';
import { Tracing } from 'aws-cdk-lib/aws-lambda';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class TranmereWebStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const datadog = new Datadog(this, "Datadog", {
      nodeLayerVersion: 85,
      extensionLayerVersion: 34,
      env: ENVIRONMENT,
      site: "datadoghq.eu",
      service: pack.name,
      version: pack.version,
      enableMergeXrayTraces: true,
      //forwarderArn: `arn:aws:lambda:${this.region}:${this.account}:function:datadog-ForwarderStack-19X9T7BINWXOJ-Forwarder-DWZq1b3ofPJO`,
      tags: "owner:architecture,datadog:true",
      apiKey: DD_KEY
    });

    const rootDomain = "tranmere-web.com";

    const env_variables = {
      "EMAIL_ADDRESS": EMAIL_ADDRESS,
      "CF_SPACE": CF_SPACE,
      "CF_KEY": CF_KEY,
      "SCRAPE_ID": SCRAPE_ID,
      "SCRAPE_SEASON": SCRAPE_SEASON,
      "SCRAPE_URL": SCRAPE_URL,
      "DD_SERVICE": pack.name,
      "DD_VERSION": pack.version,
      "DD_ENV": ENVIRONMENT
    }

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

    
    const contact_us_lambda =new NodejsFunction(this, 'ContactUsFunction', {
      entry: './lambda/contactus.js',
      handler: 'handler', 
      memorySize: 1024,
      runtime: lambda.Runtime.NODEJS_16_X,
      timeout: cdk.Duration.seconds(300),
      environment: env_variables,
      bundling: {
        minify: true,
        externalModules: ['aws-sdk'],
      }
    });

    contact_us_lambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ses:SendEmail', 'SES:SendRawEmail'],
      resources: ['*'],
      effect: iam.Effect.ALLOW,
    }));

    const update_job_lambda = new NodejsFunction(this, 'UpdateJobFunction', {
      entry: './lambda/updateJob.js',
      handler: 'handler', 
      memorySize: 1024,
      runtime: lambda.Runtime.NODEJS_16_X,
      timeout: cdk.Duration.seconds(600),
      environment: env_variables,
      bundling: {
        minify: true,
        externalModules: ['aws-sdk'],
        commandHooks: {
          beforeBundling(inputDir: string, outputDir: string): string[] {
            return [];
          },
          afterBundling(inputDir: string, outputDir: string): string[] {
            return [`mkdir ${outputDir}/libs && cp -R ${inputDir}/lambda/libs/* ${outputDir}/libs`];
          },
          beforeInstall() {
            return [];
          },
        },
      }
    });

    new events.Rule(this,'UpdateJobFunctionRule',{
      targets: [new targets.LambdaFunction(update_job_lambda)],
      schedule: events.Schedule.cron({minute: '45', hour: '23'}),
    });

    const hat_trick_job_lambda = new NodejsFunction(this, 'HatTrickJobFunction', {
      entry: './lambda/hatTrickJob.js',
      handler: 'handler', 
      memorySize: 1024,
      runtime: lambda.Runtime.NODEJS_16_X,
      timeout: cdk.Duration.seconds(600),
      environment: env_variables,
      bundling: {
        minify: true,
        externalModules: ['aws-sdk'],
        commandHooks: {
          beforeBundling(inputDir: string, outputDir: string): string[] {
            return [];
          },
          afterBundling(inputDir: string, outputDir: string): string[] {
            return [`mkdir ${outputDir}/libs && cp -R ${inputDir}/lambda/libs/* ${outputDir}/libs`];
          },
          beforeInstall() {
            return [];
          },
        },
      }
    });

    new events.Rule(this,'HatTrickJobFunctionRule',{
      targets: [new targets.LambdaFunction(hat_trick_job_lambda)],
      schedule: events.Schedule.cron({minute: '45', hour: '23'}),
    });

    const scraper_job_lambda = new NodejsFunction(this, 'ScraperJobFunction', {
      entry: './lambda/scraper.js',
      handler: 'handler', 
      memorySize: 1024,
      runtime: lambda.Runtime.NODEJS_16_X,
      timeout: cdk.Duration.seconds(600),
      environment: env_variables,
      bundling: {
        minify: true,
        externalModules: ['aws-sdk'],
        commandHooks: {
          beforeBundling(inputDir: string, outputDir: string): string[] {
            return [];
          },
          afterBundling(inputDir: string, outputDir: string): string[] {
            return [`mkdir ${outputDir}/libs && cp -R ${inputDir}/lambda/libs/* ${outputDir}/libs`];
          },
          beforeInstall() {
            return [];
          },
        },
      }
    });

    new events.Rule(this,'ScraperJobFunctionRule',{
      targets: [new targets.LambdaFunction(scraper_job_lambda)],
      schedule: events.Schedule.cron({minute: '45', hour: '23'}),
    });


    const match_page_lambda =new NodejsFunction(this, 'MatchPageFunction', {
      entry: './lambda/matchpage.js',
      handler: 'handler', 
      memorySize: 1024,
      runtime: lambda.Runtime.NODEJS_16_X,
      timeout: cdk.Duration.seconds(300),
      environment: env_variables,
      bundling: {
        minify: true,
        externalModules: ['aws-sdk'],
        commandHooks: {
          beforeBundling(inputDir: string, outputDir: string): string[] {
            return [];
          },
          afterBundling(inputDir: string, outputDir: string): string[] {
            return [`mkdir ${outputDir}/templates && cp -R ${inputDir}/tranmere-web/templates/* ${outputDir}/templates && mkdir ${outputDir}/libs && cp -R ${inputDir}/lambda/libs/* ${outputDir}/libs`];
          },
          beforeInstall() {
            return [];
          },
        },
      }
    });

    const match_update_lambda =new NodejsFunction(this, 'MatchUpdateFunction', {
      entry: './lambda/matchupdate.js',
      handler: 'handler', 
      memorySize: 1024,
      runtime: lambda.Runtime.NODEJS_16_X,
      timeout: cdk.Duration.seconds(300),
      environment: env_variables,
      bundling: {
        minify: true,
        externalModules: ['aws-sdk'],
      }
    }); 
    
    const page_lambda =new NodejsFunction(this, 'DynamicPageFunction', {
      entry: './lambda/page.js',
      handler: 'handler', 
      memorySize: 1024,
      runtime: lambda.Runtime.NODEJS_16_X,
      timeout: cdk.Duration.seconds(300),
      environment: env_variables,
      bundling: {
        minify: true,
        externalModules: ['aws-sdk'],
        commandHooks: {
          beforeBundling(inputDir: string, outputDir: string): string[] {
            return [];
          },
          afterBundling(inputDir: string, outputDir: string): string[] {
            return [`mkdir ${outputDir}/templates && cp -R ${inputDir}/tranmere-web/templates/* ${outputDir}/templates && mkdir ${outputDir}/libs && cp -R ${inputDir}/lambda/libs/* ${outputDir}/libs`];
          },
          beforeInstall() {
            return [];
          },
        },
      }
    });     

    const player_search_lambda =new NodejsFunction(this, 'PlayerSearchFunction', {
      entry: './lambda/playersearch.js',
      handler: 'handler', 
      memorySize: 1024,
      runtime: lambda.Runtime.NODEJS_16_X,
      timeout: cdk.Duration.seconds(300),
      environment: env_variables,
      bundling: {
        minify: true,
        externalModules: ['aws-sdk'],
      }
    });  
    
    const results_search_lambda =new NodejsFunction(this, 'ResultsSearchFunction', {
      entry: './lambda/resultssearch.js',
      handler: 'handler', 
      memorySize: 1024,
      runtime: lambda.Runtime.NODEJS_16_X,
      timeout: cdk.Duration.seconds(300),
      environment: env_variables,
      bundling: {
        minify: true,
        externalModules: ['aws-sdk'],
      }
    });  

    const player_builder_lambda =new NodejsFunction(this, 'PlayerBuilderFunction', {
      entry: './lambda/playerbuilder.js',
      handler: 'handler', 
      memorySize: 1024,
      runtime: lambda.Runtime.NODEJS_16_X,
      timeout: cdk.Duration.seconds(300),
      environment: env_variables,
      bundling: {
        minify: true,
        externalModules: ['aws-sdk'],
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
      }
    });   
    
    const media_sync_lambda =new NodejsFunction(this, 'MediaSyncFunction', {
      entry: './lambda/mediasync.js',
      handler: 'handler', 
      memorySize: 1024,
      runtime: lambda.Runtime.NODEJS_16_X,
      timeout: cdk.Duration.seconds(300),
      environment: env_variables,
      bundling: {
        minify: true,
        externalModules: ['aws-sdk'],
      }
    });       

    const contact_us = api.root.addResource('contact-us');
    contact_us.addMethod(
      'POST',
      new apigw.LambdaIntegration(contact_us_lambda, {proxy: true}),
    );

    const media_sync = api.root.addResource('media-sync');
    const type = media_sync.addResource('{type}');
    type.addMethod(
      'POST',
      new apigw.LambdaIntegration(media_sync_lambda, {proxy: true}),
    );

    const builder = api.root.addResource('builder');
    const kit = builder.addResource('{kit}');
    const hair = kit.addResource('{hair}');
    const body = hair.addResource('{body}');
    const features = body.addResource('{features}');
    const hairColour = features.addResource('{hairColour}');
    const neckColour = hairColour.addResource('{neckColour}');
    const background = neckColour.addResource('{background}');
    const highlights = background.addResource('{highlights}');
    
    highlights.addMethod(
      'GET',
      new apigw.LambdaIntegration(player_builder_lambda, {proxy: true}),
    );

    const match = api.root.addResource('match');
    const season = match.addResource('{season}');
    const date = season.addResource('{date}');
    date.addMethod(
      'GET',
      new apigw.LambdaIntegration(match_page_lambda, {proxy: true}),
    );
    date.addMethod(
      'POST',
      new apigw.LambdaIntegration(match_update_lambda, {proxy: true}),
    );

    const page = api.root.addResource('page');
    const pageName = page.addResource('{pageName}');
    const classifier = pageName.addResource('{classifier}');
    classifier.addMethod(
      'GET',
      new apigw.LambdaIntegration(page_lambda, {proxy: true}),
    );

    const player_search = api.root.addResource('player-search');
    player_search.addMethod(
      'GET',
      new apigw.LambdaIntegration(player_search_lambda, {proxy: true}),
    );

    const result_search = api.root.addResource('result-search');
    result_search.addMethod(
      'GET',
      new apigw.LambdaIntegration(results_search_lambda, {proxy: true}),
    );

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

    TranmereWebPlayerTable.grantReadData(player_search_lambda);
    TranmereWebPlayerSeasonSummaryTable.grantReadData(player_search_lambda);

    TranmereWebGames.grantReadData(results_search_lambda);
    
    TranmereWebAppsTable.grantReadData(page_lambda);
    TranmereWebPlayerSeasonSummaryTable.grantReadData(page_lambda);
    TranmereWebPlayerTable.grantReadData(page_lambda);

    TranmereWebGames.grantReadWriteData(match_update_lambda);

    TranmereWebPlayerTable.grantReadData(match_page_lambda);
    TranmereWebGames.grantReadData(match_page_lambda);
    TranmereWebGoalsTable.grantReadData(match_page_lambda);
    TranmereWebAppsTable.grantReadData(match_page_lambda);

    TranmereWebMediaSyncTable.grantReadWriteData(media_sync_lambda);
    TranmereWebPlayerTable.grantReadWriteData(media_sync_lambda);
    TranmereWebStarsTable.grantReadWriteData(media_sync_lambda);

    TranmereWebPlayerSeasonSummaryTable.grantReadWriteData(update_job_lambda);
    TranmereWebGoalsTable.grantReadData(update_job_lambda);
    TranmereWebAppsTable.grantReadData(update_job_lambda);

    TranmereWebGoalsTable.grantReadData(hat_trick_job_lambda);
    TranmereWebHatTricks.grantReadWriteData(hat_trick_job_lambda);

    TranmereWebGoalsTable.grantReadWriteData(scraper_job_lambda);
    TranmereWebAppsTable.grantReadWriteData(scraper_job_lambda);
    TranmereWebGames.grantReadWriteData(scraper_job_lambda);

    const graphqltables = [
      TranmereWebClubs,
      TranmereWebCompetitions,
      TranmereWebManagers,
      TranmereWebPlayerTable,
      TranmereWebStarsTable,
      TranmereWebHatTricks
    ];

    const graphql = new appsync.GraphqlApi(this, 'Api', {
      name: 'tranmere-web-appsync-api',
      schema: appsync.SchemaFile.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.IAM,
        },
      },
      xrayEnabled: true,
    });

    const appsyncrole = new iam.Role(this, "appsyncrole", {
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
      inlinePolicies: {
        allowAppSync: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["appsync:GraphQL"],
              resources: [graphql.arn + "/types/*/fields/*"]
            })
          ]
        })
      }
    });

    // Prints out the AppSync GraphQL endpoint to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: graphql.graphqlUrl
      });
  
      // Prints out the AppSync GraphQL API key to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: graphql.apiKey || ''
    });

    const graph_ql = api.root.addResource('graphql');
    graph_ql.addMethod("GET", new apigw.AwsIntegration({
      service: 'appsync-api',
      region: this.region,
      subdomain: "ndshdu4npzcldgpb7vxap2iwty",
      integrationHttpMethod: 'GET',
      path: 'graphql',
      options: {
        credentialsRole: appsyncrole,
        requestParameters: {
          'integration.request.querystring.query': 'method.request.querystring.query'
        },
        integrationResponses: [
          {
            statusCode: '200',
          }
        ]
      },
    }),
    {
      requestParameters: {
        'method.request.querystring.query': true,
      },
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': apigw.Model.EMPTY_MODEL
          }
        },
      ]
     });

  
    for(var i=0; i < graphqltables.length; i++) {
      const tableName = graphqltables[i].tableName;
      const table = graphqltables[i]
      const dynamoDataSources = graphql.addDynamoDbDataSource(tableName, table);
      table.grantReadData(new iam.ServicePrincipal("appsync.amazonaws.com"));
      dynamoDataSources.createResolver(tableName + "resolver", {
        typeName: "Query",
        fieldName: "list" + tableName,
        requestMappingTemplate: MappingTemplate.fromFile("graphql/template.json"),
        responseMappingTemplate: MappingTemplate.fromString("$util.toJson($context.result)")
      });
    }

    datadog.addLambdaFunctions([contact_us_lambda, media_sync_lambda, player_builder_lambda, results_search_lambda, player_search_lambda, match_page_lambda, match_update_lambda]);
    datadog.addLambdaFunctions([page_lambda, hat_trick_job_lambda, update_job_lambda, scraper_job_lambda]);

  }
}
