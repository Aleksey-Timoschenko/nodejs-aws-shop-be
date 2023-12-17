import { SQSEvent, SQSRecord } from 'aws-lambda';
import Lambda from 'aws-sdk/clients/lambda'
import SNS from 'aws-sdk/clients/sns'

import { httpStatusCode } from '../../shared/constants/httpConstants';

const lambda = new Lambda({
    region: process?.env?.PRODUCT_AWS_REGION || 'eu-north-1',
})
const sns = new SNS({
    region: process?.env?.PRODUCT_AWS_REGION || 'eu-north-1',
})

export const handler = async (event: SQSEvent) => {
    console.log('Incoming request event: ', event);

    try {
        for (const message of event.Records) {
            await processMessageAsync(message);
        }

        console.log('Records successfully created');
    } catch(error) {
        console.log('Error: ', error);
        
    }
}

export const processMessageAsync = async (message: SQSRecord): Promise<any> => {
    try {
      const parsedMessageBody = JSON.parse(message.body)
    
      // Create new product
      // There are several ways how we can do it
      // 1. via executing createProduct lambda (as you can see here)
      // 2. via sqs event (consume event in createProduct lambda)
      // 3. create common util for creating products and use it here and in createProduct lambda
      const createProductResponse = await lambda.invoke({
        FunctionName: process.env.CREATE_PRODUCT_LAMBDA_NAME,
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify({ body: parsedMessageBody })
      }).promise()


      if (createProductResponse.StatusCode !== httpStatusCode.OK) {
        console.error("An error occurred in 'createProduct' lambda");

        throw new Error('Product creating fail');
      }

      console.log('New product was created');
      
      
      // Send notification in SNS topic
      await sns.publish({
        TopicArn: process.env.CREATE_PRODUCT_SNS_TOPIC_ARN ?? '',
        Message: 'New product was created!',
        MessageAttributes: {
            count: {
                DataType: 'Number',
                StringValue: `${parsedMessageBody?.count ?? 0}`,
            }
        }
      }).promise()

      console.log('Email was sent');
    } catch (error) {
      console.error("An error occurred in 'processMessageAsync': ", error);
      
      throw error;
    }
  }