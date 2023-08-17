import { Construct } from 'constructs';
import * as events from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {NodejsFunction, ICommandHooks} from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import { aws_apigateway as apigw} from 'aws-cdk-lib'; 
import { IAuthorizer } from 'aws-cdk-lib/aws-apigateway';

export interface TranmereWebLambdaProps {
    readonly lambdaFile? : string;
    readonly environment?: {
        [key: string]: string;
    };
    readonly schedule?: events.CronOptions
    readonly policy?: iam.PolicyStatement;
    readonly readTables?: Array<ddb.ITable>; 
    readonly readWriteTables?: Array<ddb.ITable>; 
    readonly extraDirectory?: string;
    readonly commandHooks?: ICommandHooks;
    readonly cacheKeyParameters?: string[];
    apiResource?: apigw.Resource;
    apiMethod?: string;
    scopes?: string;
    authorizer?: IAuthorizer;
}
  
export class TranmereWebLambda extends Construct {
    constructor(scope: Construct, id: string, props: TranmereWebLambdaProps = {}) {
        super(scope, id);

        const the_lambda = new NodejsFunction(this, id, {
            entry: props.lambdaFile,
            handler: 'handler', 
            memorySize: 1024,
            runtime: lambda.Runtime.NODEJS_18_X,
            timeout: cdk.Duration.seconds(600),
            environment: props.environment,
            bundling: {
              minify: true,
              sourceMap: true,
              commandHooks: props.commandHooks
            }
        });

        if(props.readTables) {
            for(var i=0; i < props.readTables?.length; i++) {
                props.readTables[i].grantReadData(the_lambda);
            }
        }

        if(props.readWriteTables) {
            for(var i=0; i < props.readWriteTables?.length; i++) {
                props.readWriteTables[i].grantReadWriteData(the_lambda);
            }
        }

        if(props.schedule?.hour && props.schedule?.minute) {
            new events.Rule(this, id + 'Rule',{
                targets: [new targets.LambdaFunction(the_lambda)],
                schedule: events.Schedule.cron(props.schedule),
            }); 
        }

        if(props.policy) {
            the_lambda.addToRolePolicy(props.policy);
        }
        
        if(props.authorizer && props.apiResource && props.apiMethod && props.scopes) {

            props.apiResource.addMethod(
                props.apiMethod,
                new apigw.LambdaIntegration(the_lambda, 
                    {proxy: true, cacheKeyParameters: props.cacheKeyParameters},
                ),
                {
                    authorizationScopes: [props.scopes],
                    authorizer: props.authorizer
                }
            );
        }
        else if(props.apiResource && props.apiMethod) {
            props.apiResource.addMethod(
                props.apiMethod,
                new apigw.LambdaIntegration(the_lambda, {proxy: true, cacheKeyParameters: props.cacheKeyParameters} ),
            );
        }
    }
}