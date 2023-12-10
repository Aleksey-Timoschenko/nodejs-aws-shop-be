import { S3Event } from 'aws-lambda';
import S3 from "aws-sdk/clients/s3";
import SQS from 'aws-sdk/clients/sqs'

import { parseS3CSVObjectStream } from '../../../shared/utils/s3Utils'

const s3 = new S3({
    region: process?.env?.PRODUCT_AWS_REGION || 'eu-north-1',
})
const sqs = new SQS({
    region: process?.env?.PRODUCT_AWS_REGION || 'eu-north-1',
})

const CATALOG_ITEMS_QUEUE_URL = process.env.CATALOG_ITEMS_QUEUE_URL

export const handler = async (event: S3Event) => {
    console.log('Incoming request event: ', event);

    try {
        const triggerBucketName = event.Records[0].s3.bucket.name
        const triggerBucketObjectKey = event.Records[0].s3.object.key

        // Get file name
        const fileName = triggerBucketObjectKey.split('/').reverse()[0]

        const parsedFilesObjectKey = `${process.env.PARSED_FILES_FOLDER_NAME}/${fileName}`

        const s3ObjectResponse = s3.getObject({
            Bucket: triggerBucketName,
            Key: triggerBucketObjectKey,
        })
        
        const s3ObjectResponseStream = s3ObjectResponse.createReadStream()

        await parseS3CSVObjectStream({
            s3ObjectStream: s3ObjectResponseStream, 
            params: {
                onDataCallback: async (chunk) => {
                    try {
                        await sqs.sendMessage({
                            QueueUrl: CATALOG_ITEMS_QUEUE_URL,
                            MessageBody: chunk
                        }).promise()

                        console.log("Chunk was successfully send to sqs queue");
                    } catch(error) {
                        console.log("Chunk was not send to sqs queue: ", error);
                    }
                },
                onEndCallback: async () => {
                    await s3.copyObject({
                        Bucket: triggerBucketName,
                        CopySource: `${triggerBucketName}/${triggerBucketObjectKey}`,
                        Key: parsedFilesObjectKey
                    }).promise()
                    .then(async () => {
                        await s3.deleteObject({
                            Bucket: triggerBucketName,
                            Key: triggerBucketObjectKey
                        }).promise()
                        .catch(async (error) => {
                            // If error appears during removing file from uploaded folder
                            // We need to roll back the whole transaction and remove file from parsed folder
                            await s3.deleteObject({
                                Bucket: triggerBucketName,
                                Key: parsedFilesObjectKey
                            }).promise()
        
                            throw error
                        })
                    })
                }
            }
        })

        console.log('File successfully parsed')
    } catch(error) {
        console.log('Error: ', error)
    }
}