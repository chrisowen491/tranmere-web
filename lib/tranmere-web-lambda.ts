import { Construct } from 'constructs';
import * as events from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {NodejsFunction, ICommandHooks} from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import { aws_apigateway as apigw} from 'aws-cdk-lib'; 

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
    apiResource?: apigw.Resource;
    apiMethod?: string;
}
  
export class TranmereWebLambda extends Construct {
    constructor(scope: Construct, id: string, props: TranmereWebLambdaProps = {}) {
        super(scope, id);

        const the_lambda = new NodejsFunction(this, id, {
            entry: props.lambdaFile,
            handler: 'handler', 
            memorySize: 1024,
            runtime: lambda.Runtime.NODEJS_16_X,
            timeout: cdk.Duration.seconds(600),
            environment: props.environment,
            bundling: {
              minify: true,
              sourceMap: true,
              externalModules: ['aws-sdk'],
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
                props.readWriteTables[i].grantReadData(the_lambda);
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
        
        if(props.apiResource && props.apiMethod) {
            props.apiResource.addMethod(
                props.apiMethod,
                new apigw.LambdaIntegration(the_lambda, {proxy: true}),
              );
        }
    }
}