import S3 from "aws-sdk/clients/s3";
import csvParser from 'csv-parser';

const s3 = new S3({
    region: process?.env?.PRODUCT_AWS_REGION || 'eu-north-1',
})

export const parseS3CSVObjectStream = async (s3ObjectStream: any, onEndCallback: any): Promise<void> => {
    await new Promise((res, rej) => {
        s3ObjectStream
            .pipe(csvParser())
            .on('data', (chunk: string) => {
                console.log('File chink data: ', chunk)
            })
            .on('end', async () => {
                await onEndCallback()

                res(true)
            })
            .on('error', (error: any) => {
                rej(error)
            })
    })
}

export const getSignedUrl = (operation: string, bucket: string, key: string) => (
    s3.getSignedUrl(operation, {
        Bucket: bucket,
        Key: key,
        Expires: 60*5 // 5min
    })
)