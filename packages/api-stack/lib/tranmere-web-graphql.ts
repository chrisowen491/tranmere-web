import { Construct } from 'constructs';
import * as appsync from '@aws-cdk/aws-appsync-alpha';
import { MappingTemplate } from '@aws-cdk/aws-appsync-alpha';
import { aws_apigateway as apigw } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import { PassthroughBehavior } from 'aws-cdk-lib/aws-apigateway';

export interface TranmereWebGraphQLProps {
  readonly tables?: TranmereWebDynamoDBTableProps[];
  readonly api?: apigw.RestApi;
  readonly region?: string;
}

export interface TranmereWebDynamoDBTableProps {
  readonly table: ddb.ITable;
  readonly keyColumn: string;
  readonly putSchema?: string;
}

export class TranmereWebGraphQL extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: TranmereWebGraphQLProps = {}
  ) {
    super(scope, id);

    const graphql = new appsync.GraphqlApi(this, 'Api', {
      name: 'tranmere-web-appsync-api',
      schema: appsync.SchemaFile.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.IAM
        }
      },
      xrayEnabled: true
    });

    const appsyncrole = new iam.Role(this, 'appsyncrole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      inlinePolicies: {
        allowAppSync: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['appsync:GraphQL'],
              resources: [graphql.arn + '/types/*/fields/*']
            })
          ]
        })
      }
    });

    // Prints out the AppSync GraphQL endpoint to the terminal
    new cdk.CfnOutput(this, 'GraphQLAPIURL', {
      value: graphql.graphqlUrl
    });

    // Prints out the AppSync GraphQL API key to the terminal
    new cdk.CfnOutput(this, 'GraphQLAPIKey', {
      value: graphql.apiKey || ''
    });

    if (props.api) {
      const graph_ql = props.api.root.addResource('graphql');
      graph_ql.addMethod(
        'GET',
        new apigw.AwsIntegration({
          service: 'appsync-api',
          region: props.region,
          subdomain: 'clllxcsjtbdujahnszk5grceuu',
          integrationHttpMethod: 'GET',
          path: 'graphql',
          options: {
            credentialsRole: appsyncrole,
            requestParameters: {
              'integration.request.querystring.query':
                'method.request.querystring.query',
              'integration.request.querystring.mutation':
                'method.request.querystring.mutation'
            },
            integrationResponses: [
              {
                statusCode: '200'
              }
            ]
          }
        }),
        {
          requestParameters: {
            'method.request.querystring.query': false,
            'method.request.querystring.mutation': false
          },
          methodResponses: [
            {
              statusCode: '200',
              responseModels: {
                'application/json': apigw.Model.EMPTY_MODEL
              }
            }
          ]
        }
      );

      graph_ql.addMethod(
        'POST',
        new apigw.AwsIntegration({
          service: 'appsync-api',
          region: props.region,
          subdomain: 'clllxcsjtbdujahnszk5grceuu',
          integrationHttpMethod: 'POST',
          path: 'graphql',
          options: {
            credentialsRole: appsyncrole,
            passthroughBehavior: PassthroughBehavior.WHEN_NO_TEMPLATES,
            integrationResponses: [
              {
                statusCode: '200'
              }
            ]
          }
        }),
        {
          methodResponses: [
            {
              statusCode: '200',
              responseModels: {
                'application/json': apigw.Model.EMPTY_MODEL
              }
            }
          ]
        }
      );
    }

    if (props.tables) {
      for (let i = 0; i < props.tables.length; i++) {
        const tableName = props.tables[i].table.tableName;
        const table = props.tables[i].table;
        const dynamoDataSources = graphql.addDynamoDbDataSource(
          tableName,
          table
        );
        table.grantReadData(new iam.ServicePrincipal('appsync.amazonaws.com'));
        dynamoDataSources.createResolver(tableName + 'resolver', {
          typeName: 'Query',
          fieldName: 'list' + tableName,
          requestMappingTemplate: MappingTemplate.fromFile(
            'graphql/template.json'
          ),
          responseMappingTemplate: MappingTemplate.fromString(
            '$util.toJson($context.result)'
          )
        });

        dynamoDataSources.createResolver(tableName + 'GetByIdResolver', {
          typeName: 'Query',
          fieldName: 'get' + tableName + 'ById',
          requestMappingTemplate: MappingTemplate.dynamoDbGetItem(
            props.tables[i].keyColumn,
            props.tables[i].keyColumn
          ),
          responseMappingTemplate: MappingTemplate.dynamoDbResultItem()
        });

        if (props.tables[i].putSchema) {
          table.grantWriteData(
            new iam.ServicePrincipal('appsync.amazonaws.com')
          );
          dynamoDataSources.createResolver(tableName + 'PutResolver', {
            typeName: 'Mutation',
            fieldName: 'add' + tableName,
            requestMappingTemplate: MappingTemplate.fromFile(
              `graphql/${props.tables[i].putSchema}`
            ),
            responseMappingTemplate: MappingTemplate.fromString(
              '$util.toJson($context.result)'
            )
          });
        }
      }
    }
  }
}
