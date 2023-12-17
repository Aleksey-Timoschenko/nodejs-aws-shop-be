import { APIGatewayEvent } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { marshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from 'uuid';

import { httpStatusCode, productResponseMessages } from '../../shared/constants/httpConstants';
import { getResponse } from '../../shared/utils/httpUtils';
import { transactWriteItems } from '../../shared/utils/dbUtils';
import { ProductModel } from '../../models/product';
import { StockModel } from '../../models/stock';
import { validateRequestBody } from './createProduct.utils';
import { CreateProductDTO } from './createProduct.entities';

// Create DynamoDB service object
const ddb = new DynamoDBClient({
    region: process?.env?.PRODUCT_AWS_REGION || 'eu-north-1',
});

export const handler = async (event: APIGatewayEvent) => {
    console.log('Incoming request event: ', event);

    try {
        if (!event.body) {
            return getResponse({ statusCode: httpStatusCode.BAD_REQUEST, body: productResponseMessages.PRODUCT_DATA_NOT_VALID });
        }

        const requestBody: CreateProductDTO = typeof event.body === 'string' ? JSON.parse(event.body) : event.body

        // Body validation
        // It's better to implement validation within api gateway, but http api gateway is used 
        // which does'nt support body validation
        // If you want to implement body validation use rest api instead
        // Link - https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-vs-rest.html#http-api-vs-rest.differences.development
        const isBodyValid = validateRequestBody(requestBody)

        if (!isBodyValid) {
            return getResponse({ statusCode: httpStatusCode.BAD_REQUEST, body: productResponseMessages.PRODUCT_DATA_NOT_VALID });
        }

        const newProductId = uuidv4()
        const newProduct: ProductModel = { 
            id: newProductId,
            title: requestBody?.title ?? '',
            description: requestBody?.description ?? '',
            price: Number(requestBody?.price) ?? 0,
        }
        const newStock: StockModel = { 
            product_id: newProductId, 
            count: Number(requestBody?.count) ?? 0  
        }

        const transactionParams = {
            TransactItems: [
                {
                  Put: {
                    TableName: process.env.PRODUCTS_TABLE_NAME,
                    Item: marshall(newProduct),
                  }
                },
                {
                  Put: {
                    TableName: process.env.STOCKS_TABLE_NAME,
                    Item: marshall(newStock),
                  }
                }
            ]
        };

        const transactionResult = await transactWriteItems(ddb, transactionParams)

        if (transactionResult === null) {
            return getResponse({ statusCode: httpStatusCode.SERVER_ERROR, body: productResponseMessages.PRODUCT_NOT_CREATED })
        }

        return getResponse({ statusCode: httpStatusCode.OK, body: productResponseMessages.PRODUCT_SUCCESSFULLY_CREATED })
    } catch(error) {
        console.log('Create product error: ', error);
        
        return getResponse({ statusCode: httpStatusCode.SERVER_ERROR, body: JSON.stringify({ error }) })
    }
}
