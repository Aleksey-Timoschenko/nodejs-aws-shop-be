import { APIGatewayEvent } from 'aws-lambda';
import S3 from "aws-sdk/clients/s3";

import { getResponse } from '../../../shared/utils/httpUtils'
import { httpStatusCode, importResponseMessages } from '../../../shared/constants/httpConstants'
import { getSignedUrl } from '../../../shared/utils/s3Utils';

const s3 = new S3({
    region: process?.env?.PRODUCT_AWS_REGION || 'eu-north-1',
})

export const handler = async (event: APIGatewayEvent) => {
    console.log('Incoming request event: ', event);

    try {
        const fileName = event.queryStringParameters?.name

        if (!fileName) {
            return getResponse({ statusCode: httpStatusCode.BAD_REQUEST, body: importResponseMessages.FILE_NAME_NOT_VALID })
        }

        // Get signed url for uploading files to s3 bucket
        const signedUrlKey = `uploaded/${fileName}`
        const signedURL = getSignedUrl('putObject', process.env.BUCKET_NAME_FOR_FILES, signedUrlKey)

        return getResponse({ statusCode: httpStatusCode.OK, body: signedURL })
    } catch(error) {
        return getResponse({ statusCode: httpStatusCode.SERVER_ERROR, body: JSON.stringify({ error }) })
    }
}