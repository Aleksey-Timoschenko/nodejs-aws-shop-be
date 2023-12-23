import 'dotenv/config';
import * as cdk from 'aws-cdk-lib';

import { AuthorizationServiceStack } from './authorization-service.stack';

const app = new cdk.App();

new AuthorizationServiceStack(app, 'authorization-service-stack', {
    env :{ 
        region: process.env.AWS_DEFAULT_REGION,
    }
});