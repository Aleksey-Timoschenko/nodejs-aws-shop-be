import 'dotenv/config';
import * as cdk from 'aws-cdk-lib';

import { GatewayLambda } from './gateway-lambda.stack';

const app = new cdk.App();

new GatewayLambda(app, 'gateway-lambda-auth-stack', {
    productsTableName: process.env.PRODUCTS_TABLE_NAME,
    stocksTableName: process.env.STOCKS_TABLE_NAME
}, {
    env :{
        // account: process.env.CDK_DEFAULT_ACCOUNT, 
        region: "eu-north-1",
    }
});