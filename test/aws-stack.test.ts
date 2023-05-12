import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as TranmereWeb from '../lib/tranmere-web-stack';

test('API Gateway Created', () => {
   const app = new cdk.App();
//     // WHEN
   const stack = new TranmereWeb.TranmereWebStack(app, 'MyTestStack');
//     // THEN
   const template = Template.fromStack(stack);

   template.hasResourceProperties('AWS::ApiGateway::RestApi', {
    Name: "tranmere-web"
   });
});
