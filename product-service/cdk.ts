import 'dotenv/config';
import * as cdk from 'aws-cdk-lib';

import { GatewayLambda } from './gateway-lambda.stack';

const app = new cdk.App();

new GatewayLambda(app, 'product-service-stack', {
    productsTableName: process.env.PRODUCTS_TABLE_NAME,
    stocksTableName: process.env.STOCKS_TABLE_NAME,
    emailForAllNotifications: process.env.EMAIL_FOR_ALL_NOTIFICATIONS,
    emailForFilteredNotifications: process.env.EMAIL_FOR_FILTERED_NOTIFICATIONS,
}, {
    env :{
        region: process.env.AWS_DEFAULT_REGION,
    }
});