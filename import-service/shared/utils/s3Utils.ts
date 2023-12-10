import S3 from "aws-sdk/clients/s3";
import csvParser from 'csv-parser';

const s3 = new S3({
    region: process?.env?.PRODUCT_AWS_REGION || 'eu-north-1',
})

interface ParseS3CSVObjectStreamProps {
    s3ObjectStream: any;
    params?: {
        onDataCallback?: (chunk: string) => Promise<void>,
        onEndCallback?: any
    }
}

export const parseS3CSVObjectStream = async ({
    s3ObjectStream, 
    params = {}
}: ParseS3CSVObjectStreamProps): Promise<void> => {
    const { onDataCallback, onEndCallback } = params

    await new Promise((res, rej) => {
        s3ObjectStream
            .pipe(csvParser())
            .on('data', async (chunk: any) => {
                console.log('Parsed chunk: ', chunk);

                const parsedChunk = Object
                    .entries(chunk)
                    .reduce<Record<string, any>>((carry, [key, value]) => {
                        // lowercase all object keys and remove redundant character
                        const parsedKey = key.charCodeAt(0) === 0xFEFF ? key.slice(1) : key
                        carry[parsedKey.toLowerCase()] = value;
                
                        return carry;
                    }, {}) 

                await onDataCallback(JSON.stringify(parsedChunk))
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