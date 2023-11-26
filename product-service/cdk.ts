import * as cdk from 'aws-cdk-lib';

import { GatewayLambda } from './gateway-lambda.stack';

const app = new cdk.App();

new GatewayLambda(app, 'gateway-lambda-auth-stack', {
    env :{
        // account: process.env.CDK_DEFAULT_ACCOUNT, 
        region: "eu-north-1",
    }
});