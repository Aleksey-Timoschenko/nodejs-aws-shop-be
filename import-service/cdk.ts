import 'dotenv/config';
import * as cdk from 'aws-cdk-lib';

import { GatewayLambda } from './gateway-lambda.stack';

const app = new cdk.App();

new GatewayLambda(app, 'import-service-stack', {
    filesBucketName: process.env.BUCKET_NAME_FOR_FILES,
    uploadedFilesFolderName: process.env.UPLOADED_FILES_FOLDER_NAME,
    parsedFilesFolderName: process.env.PARSED_FILES_FOLDER_NAME,
}, {
    env :{
        // account: process.env.CDK_DEFAULT_ACCOUNT, 
        region: "eu-north-1",
    }
});